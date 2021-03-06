<script setup>
import * as d3 from 'd3';
import CircularStack from '../circularStack.js';
import DOMPurify from 'dompurify';
import NodePrompt from './NodePrompt.vue';
import ChatbotContent from './ChatbotContent.vue';
import { onMounted, ref } from '@vue/runtime-core';
import { marked } from 'marked';
import { nanoid } from 'nanoid';


const emit = defineEmits([ 'download', 'upload', 'load', 'save', 'info' ]);
const props = defineProps([ 'project' ]);
const promptNode = ref(null);
const history = ref(new CircularStack(64));


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
    if (prevProject && props.project && statesEqual(prevProject, props.project)) return;

    const copy = JSON.parse(JSON.stringify(props.project));
    history.value.push(copy);
}

// Edits node data by prompting the user
function promptSubmit(value) {
    if (value) {
        saveToHistory();
        promptNode.value.label = value.label;
        promptNode.value.class = value.class;

        emit('info', 0, 'Tallentamattomia muutoksia');
    }

    promptNode.value = null;
    redraw();
}

// Centers the graph on the screen
function center() {
    if (props.project.nodes.length === 0) return;

    let minX = 1e9;
    let minY = 1e9;
    let maxX = -1e9;
    let maxY = -1e9;

    for (let node of props.project.nodes) {
        let x0 = node.pos.x * size;
        let y0 = node.pos.y * size;
        let x1 = node.pos.x * size + size * width;
        let y1 = node.pos.y * size + (node.height || 0);

        if (minX > x0) minX = x0;
        if (minY > y0) minY = y0;
        if (maxX < x1) maxX = x1;
        if (maxY < y1) maxY = y1;
    }

    emit('info', 1, 'TODO - Toteuttaminen kesken');
}

function undo() {
    emit('info', 1, 'TODO - Toteuttaminen kesken');
    return;

    const prev = history.value.pop();

    if (prev) {
        props.project.nodes = prev.nodes || [];
        props.project.edges = prev.edges || [];
    }

    redraw();
}

function redo() {
    emit('info', 1, 'TODO - Toteuttaminen kesken');
    return;

    const prev = history.value.unpop();

    if (prev) {
        props.project.nodes = prev.nodes || [];
        props.project.edges = prev.edges || [];
    }

    redraw();
}

onMounted(() => {
    const container = d3.select('.graph-cont')
    const svg = container.select('svg.graph-svg');
    const content = svg.select('g');
    const pattern = svg.select('pattern');
    const domContent = container.select('div.graph-dom');

    // Initial transforms and container settings
    pattern.attr('patternTransform', `translate(${prevTransform.value.x} ${prevTransform.value.y}) scale(${prevTransform.value.k})`);
    domContent
        .style('position', 'relative')
        .style('transform-origin', '0px 0px')
        .style('transform', `translate(${prevTransform.value.x}px,${prevTransform.value.y}px) scale(${prevTransform.value.k})`)
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
        if (props.project.edges.find((e) => {
            return (e.from === from && e.to === to) ||
                (e.to === from && e.from === to);
        })) return;

        emit('info', 0, 'Tallentamattomia muutoksia');

        saveToHistory();
        props.project.edges = props.project.edges.concat([ { from, to } ]);

        redraw();
    }

    function removeEdge(edge) {
        emit('info', 0, 'Tallentamattomia muutoksia');

        saveToHistory();
        props.project.edges = props.project.edges.filter((e) => !(e.from === edge.from && e.to === edge.to));

        redraw();
    }

    function addNode(node) {
        emit('info', 0, 'Tallentamattomia muutoksia');

        saveToHistory();
        props.project.nodes = props.project.nodes.concat([ node ]);
    }

    function removeNode(node) {
        emit('info', 0, 'Tallentamattomia muutoksia');

        saveToHistory();
        props.project.edges = props.project.edges.filter((e) => !(e.from === node.id || e.to === node.id));
        props.project.nodes = props.project.nodes.filter((n) => n.id !== node.id);

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
                        const toNode = props.project.nodes.find((n) => n.id === to);

                        x = toNode.pos.x + (width / 2);
                        y = toNode.pos.y;
                    }
                }

                line.attr('x2', x * size)
                    .attr('y2', y * size);

            } else {
                d.pos.x = Math.round(x - width / 2);
                d.pos.y = Math.round(y - d.height / size / 2);
                emit('info', 0, 'Tallentamattomia muutoksia');
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
                    const node = props.project.nodes.find((n) => n.id === d.from);
                    return node.pos.x * size + (width / 2) * size;
                })
                .attr('y1', (d) => {
                    const node = props.project.nodes.find((n) => n.id === d.from);
                    return node.pos.y * size + node.height;
                })
                .attr('x2', (d) => {
                    const node = props.project.nodes.find((n) => n.id === d.to);
                    return node.pos.x * size + (width / 2) * size;
                })
                .attr('y2', (d) => {
                    const node = props.project.nodes.find((n) => n.id === d.to);
                    return node.pos.y * size;
                });

            return selection;
        }

        // Makes sure that there is stuff to draw
        if (!props.project || !props.project.nodes || props.project.nodes.length === 0) {
            return;
        }

        // Adds, updates, and removes bubbles
        bubbleCont
            .selectAll('div.bubble')
            .data(props.project.nodes || [], (d) => '' + d.id)
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
            .data(props.project.edges || [], (d) => `${d.from}-${d.to}`)
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

    redraw();

    // Binds shortcuts
    document.addEventListener('keydown', function(event) {
      if (event.ctrlKey && event.key === 'z') {
          undo();

      } else if (event.ctrlKey && event.shiftKey && event.key === 'z') {
          redo();
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

            <div @click="emit('download')">
                <font-awesome-icon class="icon" icon="download" />
                <div class="tooltip">Lataa pilvestä</div>
            </div>

            <div @click="emit('upload')">
                <font-awesome-icon class="icon" icon="upload" />
                <div class="tooltip">Lähetä pilveen/päivitä botti</div>
            </div>

            <div @click="emit('save')">
                <font-awesome-icon class="icon" icon="save" />
                <div class="tooltip">Tallenna tietokoneelle</div>
            </div>

            <div @click="center">
                <font-awesome-icon class="icon" icon="expand" />
                <div class="tooltip">Keskitä</div>
            </div>
        </div>

        <div class="chatbot">
            <ChatbotContent :key="history.index" :project="project" :editmode="true"></ChatbotContent>
        </div>

        <div class="node-prompt">
            <NodePrompt v-if="promptNode" @submit="promptSubmit" :node="promptNode"></NodePrompt>
        </div>
    </div>
</template>


<style scoped>
.cont {
    width: 100%;
    height: calc(100vh - 3.6rem - 2rem);
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

.graph:deep(.contacts-bubble) {
    background-color: #cbb6df;
    border: 2px solid #b287da;
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