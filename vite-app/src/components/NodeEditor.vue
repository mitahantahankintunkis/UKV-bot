<script setup>
import * as d3 from 'd3';
import CircularStack from '../circularStack.js';
import DOMPurify from 'dompurify';
import InfoBar from './InfoBar.vue';
import NodePrompt from './NodePrompt.vue';
import ChatbotContent from './ChatbotContent.vue';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from '@firebase/firestore';
import { inject, onBeforeUnmount, onMounted, ref } from '@vue/runtime-core';
import { marked } from 'marked';
import { nanoid } from 'nanoid';
import { useRoute } from 'vue-router';


const route = useRoute();
const db = inject('db');
const props = defineProps([ 'project' ]);
const promptNode = ref(null);
const info = ref([ '', 'Ei muutoksia', '' ]);
const saveIntervalID = ref(-1);
const history = ref(new CircularStack(64));

//let nodes = props.project.nodes || [];
//let edges = props.project.edges || [];
const project = ref(props.project || {
    nodes: [],
    edges: [],
    page: '# TODO',
});

//if (project.value.nodes && project.value.nodes.length > 0) {
//    history.value.push(project.value);
//}

const prevTransform = ref(
    JSON.parse(localStorage.getItem('treeview-transform')) ||
    { x: 0, y: 0, k: 1 }
);

// Redrawing function defined in onMounted
let redraw;

// Grid size (px) and bubble width
// Chat bubble max width is 70% of 30rem -> 336px
const size = 84;
const width = 4;

function saveToHistory() {
    const statesEqual = (a, b) => {
        if (a.nodes.length !== b.nodes.length) return false;
        if (a.edges.length !== b.edges.length) return false;

        for (let i = 0; i < a.nodes.length; ++i) {
            if (a.nodes[i].id !== b.nodes[i].id) return false;
            if (a.nodes[i].label !== b.nodes[i].label) return false;
            if (a.nodes[i].class !== b.nodes[i].class) return false;
            if (a.nodes[i].pos.x !== b.nodes[i].pos.x) return false;
            if (a.nodes[i].pos.y !== b.nodes[i].pos.y) return false;
        }

        for (let i = 0; i < a.edges.length; ++i) {
            if (a.edges[i].from !== b.edges[i].from) return false;
            if (a.edges[i].to !== b.edges[i].to) return false;
        }

        return true;
    };

    const prevProject = history.value.head();
    console.log('saving state');
    if (prevProject && project.value && statesEqual(prevProject, project.value)) return;

    const copy = JSON.parse(JSON.stringify(project.value));
    history.value.push(copy);
}

// Edits node data by prompting the user
function promptSubmit(value) {
    if (value) {
        saveToHistory();
        promptNode.value.label = value.label;
        promptNode.value.class = value.class;
    }

    promptNode.value = null;
    redraw();
}

// Centers the graph on the screen
function center() {
    if (project.value.nodes.length === 0) return;

    let minX = 1e9;
    let minY = 1e9;
    let maxX = -1e9;
    let maxY = -1e9;

    for (let node of project.value.nodes) {
        let x0 = node.pos.x * size;
        let y0 = node.pos.y * size;
        let x1 = node.pos.x * size + size * width;
        let y1 = node.pos.y * size + (node.height || 0);

        if (minX > x0) minX = x0;
        if (minY > y0) minY = y0;
        if (maxX < x1) maxX = x1;
        if (maxY < y1) maxY = y1;
    }

    info.value[2] = 'TODO - Toteuttaminen kesken';
}


async function uploadData() {
    if (props.project && props.project.readonly) {
        info.value[2] = 'Ei onnistu. Projekti on lukutilassa';
        return;
    }

    const projectId = route.params.project;
    const docRef = doc(db, 'projects', projectId);

    info.value[1] = 'Lähetetään...';

    await updateDoc(docRef, {
        nodes: project.value.nodes,
        edges: project.value.edges,
        timestamp: serverTimestamp(),

    }).then(() => {
        info.value[1] = 'Lähetetty pilveen';

    }).catch((e) => {
        console.error(e);
        info.value[2] = 'Virhe lähetettäessä pilveen';
    });
}


async function downloadData() {
    if (!db) return;

    info.value[1] = 'Ladataan...';

    const projectId = route.params.project;
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const cloudProject = docSnap.data() || {};

                info.value[1] = 'Ladattu pilvestä';

                saveToHistory();

                // Hacky way of reseting the graph
                project.value.nodes = [];
                project.value.edges = [];
                redraw();

                console.log(cloudProject);
                project.value = cloudProject;
                redraw();
            } else {
                info.value[1] = 'Projektia ei löytynyt pilvestä';
            }

        }).catch((e) => {
            console.error(e);
            info.value[2] = 'Virhe ladattaessa pilvestä';
        });
}


// Loads from localStorage
function loadGraph() {
    try {
        const storedProject = JSON.parse(localStorage.getItem('project'));

        if (storedProject) {
            info.value[1] = 'Ladattu tietokoneelta';

            saveToHistory();
            project.value.nodes = storedProject.nodes || [];
            project.value.edges = storedProject.edges || [];

            redraw();

            localStorage.removeItem('graph');
        }
    } catch {
        return;
    }
}


// Saves state to localStorage
function saveState() {
    console.log('saved');

    info.value[1] = 'Tallennettu';

    // Saves the current camera transformation
    localStorage.setItem('treeview-transform', JSON.stringify(prevTransform.value));

    if (project.value.nodes && project.value.nodes.length > 0) {
        localStorage.setItem('project', JSON.stringify(project.value));
    }
}

function undo() {
    info.value[2] = 'Erittäin buginen, ei kannata luottaa';

    const prev = history.value.pop();

    if (prev) {
        project.value.nodes = prev.nodes || [];
        project.value.edges = prev.edges || [];
    }

    redraw();
}

function redo() {
    info.value[2] = 'Erittäin buginen, ei kannata luottaa';

    const prev = history.value.unpop();

    if (prev) {
        project.value.nodes = prev.nodes || [];
        project.value.edges = prev.edges || [];
    }

    redraw();
}

onBeforeUnmount(saveState);

onMounted(() => {
    console.log('remount');

    const container = d3.select('.graph-cont')
    const svg = container.select('svg.graph-svg');
    const content = svg.select('g');
    const pattern = svg.select('pattern');
    const domContent = container.select('div.graph-dom');

    // Initial transforms and container settings
    pattern.attr('patternTransform', `translate(${prevTransform.x} ${prevTransform.y}) scale(${prevTransform.k})`);
    domContent
        .style('position', 'relative')
        .style('transform-origin', '0px 0px')
        .style('transform', `translate(${prevTransform.x}px,${prevTransform.y}px) scale(${prevTransform.k})`)
        .style('width', 'fit-content')
        .style('height', 'fit-content');

    // Zooming and panning
    const zoom = d3.zoom()
        .wheelDelta((e) => -e.deltaY * 0.001)
        .scaleExtent([0.02, 2])
        .filter((e) => !e.ctrlKey && !e.shiftKey)
        .on('zoom', (event) => {
            const t = event.transform;

            prevTransform.value = { x: t.x, y: t.y, k: t.k };

            content.attr('transform', t);
            domContent.style('transform', `translate(${t.x}px,${t.y}px) scale(${t.k})`)
            pattern.attr('patternTransform', t);
        });

    container.call(zoom)
        .call(zoom.transform,
            d3.zoomIdentity
                .translate(prevTransform.value.x, prevTransform.value.y)
                .scale(prevTransform.value.k))
        .on("dblclick.zoom", null);


    function addEdge(from, to) {
        if (from === to) return;
        if (project.value.edges.find((e) => {
            return (e.from === from && e.to === to) ||
                (e.to === from && e.from === to);
        })) return;

        info.value[1] = 'Tallentamattomia muutoksia';

        saveToHistory();
        project.value.edges = project.value.edges.concat([ { from, to } ]);

        redraw();
    }

    function removeEdge(edge) {
        info.value[1] = 'Tallentamattomia muutoksia';

        saveToHistory();
        project.value.edges = project.value.edges.filter((e) => !(e.from === edge.from && e.to === edge.to));

        redraw();
    }

    function addNode(node) {
        info.value[1] = 'Tallentamattomia muutoksia';

        saveToHistory();
        project.value.nodes = project.value.nodes.concat([ node ]);
    }

    function removeNode(node) {
        info.value[1] = 'Tallentamattomia muutoksia';

        saveToHistory();
        project.value.edges = project.value.edges.filter((e) => !(e.from === node.id || e.to === node.id));
        project.value.nodes = project.value.nodes.filter((n) => n.id !== node.id);

        redraw();
    }

    // Different events
    // Adds a new node
    function bgDoubleclicked(event) {
        // Determines mouse world coordinates
        const rect = event.target.getBoundingClientRect();
        const cx = event.clientX - rect.left
        const cy = event.clientY - rect.top
        const wx = ((cx - prevTransform.value.x) / size) / prevTransform.value.k - width / 2;
        const wy = ((cy - prevTransform.value.y) / size) / prevTransform.value.k - 0.5;

        addNode({
            id: nanoid(),
            pos: { x: Math.round(wx), y: Math.round(wy) },
            class: '',
            label: '*Tuplaklikkaa minua*',
        });

        redraw();
    }

    // Edits nodes by opening a prompt
    function nodeDoubleclicked(event, node) {
        promptNode.value = node;
    }

    // Removes the clicked node
    function nodeRightclicked(event, node) {
        event.preventDefault();

        removeNode(node);
    }

    // Removes the clicked edge
    function edgeRightclicked(event, edge) {
        event.preventDefault();

        removeEdge(edge);
    }

    // Bubbles

    // Containers for different elements
    const bubbleCont = domContent.select('div.bubble-cont');
    const lineCont = content.select('g.line-cont');
    
    // Binds background doubleclick
    container.on('dblclick', function(event) {
        if (event.target !== svg.select('rect').node()) return;
        bgDoubleclicked(event);
    });

    // Handles bubble element dragging
    function bubbleDrag(bubbles) {
        let line = null;
        let from = null;
        let to = null;
        let startPos = null;

        function start(e, d) {
            startPos = d.pos;

            if (e.sourceEvent.shiftKey) {
                const x = d.pos.x * size + (width / 2) * size;
                const y = d.pos.y * size + d.height;

                line = content
                    .append('line')
                    .attr('marker-end', 'url(#arrow)')
                    .attr('stroke', '#444444')
                    .attr('stroke-width', 8)
                    .style('cursor', 'pointer')
                    .attr('x1', x)
                    .attr('y1', y)
                    .attr('x2', x)
                    .attr('y2', y);

                from = d.id;
            }
        }

        function drag(e, d) {
            // Screen to world
            let x = (e.x / size) / prevTransform.value.k;
            let y = (e.y / size) / prevTransform.value.k;

            if (line) {
                const attributes = e.sourceEvent.target.attributes;
                const classes = e.sourceEvent.target.classList;

                // Checks whether the cursor is on top of a node
                // and snaps the edge to it
                if (classes.contains('bubble')) {
                    to = attributes.getNamedItem('node-id').value;
                    if (to !== from) {
                        const toNode = project.value.nodes.find((n) => n.id === to);

                        x = toNode.pos.x + (width / 2);
                        y = toNode.pos.y;
                    }
                }

                line.attr('x2', x * size)
                    .attr('y2', y * size);

            } else {
                d.pos.x = Math.round(x - width / 2);
                d.pos.y = Math.round(y - d.height / size / 2);
                info.value[1] = 'Tallentamattomia muutoksia';
            }

            redraw();
        }

        function end(e, d) {
            if (line) {
                line.remove();
                line = null;

                addEdge(from,to);
            } else {
                if (startPos.x !== d.pos.x || startPos.y !== d.pos.y) {
                    // Hacky way of saving the state
                    const tempPos = d.pos;
                    d.pos.x = startPos.x;
                    d.pos.y = startPos.y;
                    saveToHistory();

                    d.pos = tempPos;
                }
            }

            redraw();
        }

        bubbles.call(
            d3.drag()
                .filter((e) => { return true; })
                .on('start', start)
                .on('drag', drag)
                .on('end', end)
        );
    }

    // Redraws bubbles and lines
    redraw = () => {
        // Sets bubble positions and inner HTML.
        // Calculates the height of each bubble.
        function bubbleUpdate(selection) {
            selection
                .attr('class', (d) => `bubble ${d.class}-bubble`)
                .style('transform', (d) => `translate(${d.pos.x * size}px, ${d.pos.y * size}px)`)
                .selectAll('.bubble-contents')
                .html((d) => {
                    const html = marked(d.label || '');
                    return DOMPurify.sanitize(html);
                })
                .each(function(d) { d.height = d3.select(this).node().scrollHeight });

            return selection;
        }

        // Sets line coordinates
        function lineUpdate(selection) {
            selection
                .attr('x1', (d) => {
                    const node = project.value.nodes.find((n) => n.id === d.from);
                    return node.pos.x * size + (width / 2) * size;
                })
                .attr('y1', (d) => {
                    const node = project.value.nodes.find((n) => n.id === d.from);
                    return node.pos.y * size + node.height;
                })
                .attr('x2', (d) => {
                    const node = project.value.nodes.find((n) => n.id === d.to);
                    return node.pos.x * size + (width / 2) * size;
                })
                .attr('y2', (d) => {
                    const node = project.value.nodes.find((n) => n.id === d.to);
                    return node.pos.y * size;
                });

            return selection;
        }

        // Makes sure that there is stuff to draw
        if (!project.value || !project.value.nodes || project.value.nodes.length === 0) {
            return;
        }

        // Adds, updates, and removes bubbles
        bubbleCont
            .selectAll('div.bubble')
            .data(project.value.nodes || [], (d) => '' + d.id)
            .join(
                (enter) => {
                    const bubbles = enter.append('div')
                        .call(bubbleDrag)
                        .attr('node-id', (d) => d.id)
                        .on('dblclick', nodeDoubleclicked)
                        .on('dblclick', nodeDoubleclicked)
                        .on('contextmenu', nodeRightclicked);

                    // Markdown
                    bubbles.append('div')
                        .attr('class', 'bubble-contents')
                        .style('pointer-events', 'none');
                    
                    bubbles.call(bubbleUpdate);

                    return bubbles;
                },

                bubbleUpdate,

                (exit) => {
                    exit.remove();

                    return exit;
                });

        lineCont
            .selectAll('line')
            .data(project.value.edges || [], (d) => `${d.from}-${d.to}`)
            .join(
                (enter) => {
                    const lines = enter.append('line')
                        .attr('marker-end', 'url(#arrow)')
                        .attr('stroke', '#444444')
                        .attr('stroke-width', 8)
                        .style('cursor', 'pointer')
                        .on('contextmenu', edgeRightclicked)
                        .call(lineUpdate);

                    return lines;
                },

                lineUpdate,

                (exit) => {
                    exit.remove();

                    return exit;
                });
    };

    loadGraph();
    redraw();

    // Save interval
    clearInterval(saveIntervalID.value);
    saveIntervalID.value = setInterval(saveState, 1000 * 30);

    // Binds shortcuts
    document.addEventListener('keydown', function(event) {
      if (event.ctrlKey && event.key === 'z') {
          undo();

      } else if (event.ctrlKey && event.shiftKey && event.key === 'z') {
          redo();

      } else if (event.ctrlKey && event.key === 's') {
          saveState();
      }
    });
});

</script>


<template>
    <div class="cont">
        <div class="graph-cont">
            <svg class="graph-svg">
                <defs>
                    <pattern id="dots" x="-2" y="-2" width="84" height="84" patternUnits="userSpaceOnUse">
                        <circle fill="#ccc" cx="2" cy="2" r="2">
                        </circle>
                    </pattern>

                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="3" refY="1.5" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,3 L4.5,1.5 z" fill="#444" />
                    </marker>
                </defs>
            
                <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"></rect>
                <g :transform="`translate(${prevTransform.x},${prevTransform.y}) scale(${prevTransform.k})`">
                    <g class="line-cont"></g>
                </g>
            </svg>

            <div class="graph">
                <div class="graph-dom">
                    <div class="bubble-cont"></div>
                </div>
            </div>
        </div>

        <div class="controls">

            <div @click="downloadData">
                <font-awesome-icon class="icon" icon="download" />
                <div class="tooltip">Lataa pilvestä</div>
            </div>

            <div @click="uploadData">
                <font-awesome-icon class="icon" icon="upload" />
                <div class="tooltip">Lähetä pilveen/päivitä botti</div>
            </div>

            <div @click="saveState">
                <font-awesome-icon class="icon" icon="save" />
                <div class="tooltip">Tallenna tietokoneelle</div>
            </div>

            <div @click="center">
                <font-awesome-icon class="icon" icon="expand" />
                <div class="tooltip">Keskitä</div>
            </div>
        </div>

        <div class="infobar">
            <InfoBar :info="info"></InfoBar>
        </div>

        <NodePrompt v-if="promptNode" @submit="promptSubmit" :node="promptNode"></NodePrompt>

        <div class="chatbot">
            <ChatbotContent :key="history.index" :project="project" :editmode="true"></ChatbotContent>
        </div>
    </div>
</template>


<style scoped>
.cont {
    width: 100%;
    height: calc(100vh - 3.6rem);
    overflow: hidden;
    position: relative;
}

.graph-cont {
    width: 100%;
    height: 100%;
    position: relative;
}

svg.graph-svg, .graph {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

.graph {
    pointer-events: none;
}

.graph:deep(img) {
    width: 90%;
    height: auto;
    margin: 1rem auto;
    display: block;
    text-align: center;
}

.graph:deep(ul) {
    list-style-position: inside;
}

.controls {
    position: absolute;
    top: 3.6rem;
    left: 0;
    display: flex;
    flex-direction: column;
    margin: 1rem;
    background-color: #eee;
    gap: 1px;
    border: 1px solid #eee;
    border-radius: 4px;
}

.controls > * {
    width: 3rem;
    height: 3rem;
    background-color: #eee;
    cursor: pointer;
    user-select: none;
    color: #888;
    padding: 0.25rem;
    position: relative;
}

.controls > *:hover {
    background-color: #fafafa;
    color: #444;
}

.icon {
    width: 100%;
    height: 100%;
}

.selected {
    background-color: white;
}

.tooltip {
    display: inline-block;
    z-index: 10;
    pointer-events: none;
    width: max-content;
    background-color: #444;
    color: #eee;
    position: absolute;
    left: 3.5rem;
    top: 0.5rem;
    padding: 4px;
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.2s;
}

.controls > *:hover .tooltip {
    opacity: 1;
}

.infobar {
    position: absolute;
    left: 0;
    bottom: 0px;
    right: 30rem;
}

.graph:deep(.bubble) {
    pointer-events: auto;
    cursor: pointer;
    user-select: none;
    position: absolute;
    width: 336px;
    height: fit-content;
    color: #003a49;
    padding: 1rem;
    background-color: #aaa;
    border: 2px solid #999;
    border-radius: 1rem;
    text-align: center;
}

.graph:deep(.bot-bubble) {
    background-color: #b6d7df;
    border: 2px solid #a6c7cf;
    border-radius: 1rem 1rem 1rem 0;
    text-align: start;
}

.graph:deep(.user-bubble) {
    background-color: #eee;
    border: 2px solid #ddd;
    border-radius: 1rem 1rem 0 1rem;
    text-align: start;
}

.chatbot {
    border-left: 1px solid gray;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
}
</style>