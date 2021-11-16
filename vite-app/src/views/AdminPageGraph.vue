<script setup>
import * as d3 from 'd3';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { onBeforeUnmount, onMounted, ref } from '@vue/runtime-core';


const props = defineProps([ 'project' ]);
const controls = ref('cursor');

//const nodes = props.project['bot-nodes'] || [];
//const edges = props.project['bot-edges'] || [];

const nodes = [
    { id: 'asdf', pos: { x: 0, y:  1 }, label: '# TODO\nBot editor example\n## List\n- Linkki [muuvo.fi](https://muuvo.fi)\n- Markdown tukee myös kuvia\n![img](https://i.imgur.com/4vNedV6.jpeg)' },
    { id: 'qwer', pos: { x: 6, y: 15 }, label: 'Lorem ipsum dolor sit amet.' },
];
const edges = [
    { id: 'zxcv', pos: { x: 0, y: 10 }, label: 'Lorem ipsum', from: 'asdf', to: 'qwer' },
];

// Parses markdown
for (let node of nodes) {
    const html = marked(node.label || '');
    node.cleanedHtml = DOMPurify.sanitize(html);
}

for (let edge of edges) {
    const html = marked(edge.label || '');
    edge.cleanedHtml = DOMPurify.sanitize(html);
}

const prevTransform = ref(
    JSON.parse(localStorage.getItem('treeview-transform')) ||
    { x: 0, y: 0, k: 1 }
);

function changeControls(id) {
    controls.value = id;
}

onBeforeUnmount(function() {
    localStorage.setItem('treeview-transform', JSON.stringify(prevTransform.value));
});

onMounted(() => {
    const container = d3.select('.cont')
    const svg = container.select('svg');
    const content = svg.select('g');
    const pattern = svg.select('pattern');
    const domContent = container.select('.graph').append('div');

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

    // Mouse events
    //container
    //    .on('click', function(e) {
    //        console.log(e, d3.select(this));
    //    })
    //    .on('contextmenu', console.log)

    // Bubbles
    // Chat bubble max width is 70% of 30rem -> 336px
    const size = 84;
    const width = 4;

    // Containers for different elements
    const botBubbles = domContent.append('div');
    const userBubbles = domContent.append('div');
    const incomingLines = content.append('g');
    const outgoingLines = content.append('g');

    // Handles bubble element dragging
    function bubbleDrag(bubbles) {
        function drag(e, d) {
            const selection = d3.select(this);

            // Screen to world
            const x = (e.x / size) / prevTransform.value.k - width / 2;
            const y = (e.y / size) / prevTransform.value.k - d.height / size / 2;

            d.pos.x = Math.floor(x);
            d.pos.y = Math.floor(y);

            redraw();
        }

        bubbles.call(
            d3.drag()
                .filter((e) => { return true; })
                .on('drag', drag)
        );
    }

    function bubbleEvents(bubbles) {
        function click(e, d) {
            console.log(e, d);
        }

        function dblclick(e, d) {
            console.log(e, d);
        }

        // Removes the clicked node
        function contextmenu(e, d) {
            e.preventDefault();
            redraw();
        }

        bubbles
            .on('click', click)
            .on('dblclick', dblclick)
            .on('contextmenu', contextmenu)
    }

    // Redraws bubbles and lines
    function redraw() {

        // Adds, updates, and removes bubbles
        function updateBubbles(cont, data, isBot) {
            cont
                .selectAll('div')
                .data(data, (d) => d.id)
                .join(
                    function (enter) {
                        enter.append('div')
                            .call(bubbleDrag)
                            .call(bubbleEvents)
                            .attr('class', 'bubble')
                            .classed('bot-bubble', isBot)
                            .classed('user-bubble', !isBot)
                            .style('transform', (d) => `translate(${d.pos.x * size}px, ${d.pos.y * size}px)`)
                            .html((d) => d.cleanedHtml)
                            .each(function(d) { d.height = d3.select(this).node().scrollHeight });
                    },

                    // Sets bubble positions and inner HTML.
                    // Calculates the height of each bubble.
                    function (update) {
                        update
                            .style('transform', (d) => `translate(${d.pos.x * size}px, ${d.pos.y * size}px)`)
                            .html((d) => d.cleanedHtml)
                            .each(function(d) { d.height = d3.select(this).node().scrollHeight });
                    },

                    function (exit) {
                        d3.select(this).remove();
                        //exit.remove();
                    });
        }

        // Each edge needs two lines, one incoming and one
        // outgoing line from each user bubble
        function updateLines(cont, incoming) {
            // Returns line coordinates
            const coordinates = (d) => {
                let node;
                let p0;
                let p1;

                if (incoming) {
                    node = nodes.find((n) => n.id === d.from);
                    p0 = node.pos;
                    p1 = d.pos;
                } else {
                    node = nodes.find((n) => n.id === d.to);
                    p0 = d.pos;
                    p1 = node.pos;
                }

                return {
                    x1: p0.x * size + (width / 2) * size,
                    x2: p1.x * size + (width / 2) * size,
                    y1: p0.y * size + node.height,
                    y2: p1.y * size,
                }
            };

            cont
                .selectAll('line')
                .data(edges, (d) => d.id)
                .join(
                    function (enter) {
                        enter.append('line')
                            .attr('marker-end', 'url(#arrow)')
                            .attr('stroke', '#444444')
                            .attr('stroke-width', 8)
                            .style('cursor', 'pointer')
                            .each((d) => { d.coords = coordinates(d); })
                            .attr('x1', (d) => d.coords.x1)
                            .attr('y1', (d) => d.coords.y1)
                            .attr('x2', (d) => d.coords.x2)
                            .attr('y2', (d) => d.coords.y2);
                    },

                    function (update) {
                        update
                            .each((d) => { d.coords = coordinates(d); })
                            .attr('x1', (d) => d.coords.x1)
                            .attr('y1', (d) => d.coords.y1)
                            .attr('x2', (d) => d.coords.x2)
                            .attr('y2', (d) => d.coords.y2);
                    },

                    function (exit) {
                        d3.select(this).remove();
                    })
        }

        updateBubbles(botBubbles,  nodes, true);
        updateBubbles(userBubbles, edges, false);
        updateLines(incomingLines, true);
        updateLines(outgoingLines, false);
    }

    redraw();
});

</script>


<template>
    <div class="cont">
        <svg>
            <defs>
                <pattern id="dots" x="-2" y="-2" width="84" height="84" patternUnits="userSpaceOnUse">
                    <circle fill="#ccc" cx="2" cy="2" r="2">
                    </circle>
                </pattern>

                <marker id="arrow" markerWidth="10" markerHeight="10" refX="3" refY="1.5" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,3 L4.5,1.5 z" fill="#444" />
                </marker>

                <filter id="shadow" x="0" y="0" width="200%" height="200%">
                    <!--
                    <feOffset result="offOut" in="SourceAlpha" dx="0" dy="0" />
                    <feGaussianBlur result="blurOut" in="offOut" stdDeviation="10" />
                    <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />

                    <feGaussianBlur id="blur" in="SourceAlpha" stdDeviation="1"/>
                    <feColorMatrix id="recolor"  type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" result="white-glow"/>

                    <feMerge> 
                        <feMergeNode in="white-glow"/> 
                        <feMergeNode in="SourceGraphic"/> 
                    </feMerge> 
                    -->

                    <feDropShadow dx="0" dy="0" stdDeviation="0.6" flood-color="white" />
                </filter>
            </defs>
        
            <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"></rect>
            <g :transform="`translate(${prevTransform.x},${prevTransform.y}) scale(${prevTransform.k})`"></g>
        </svg>

        <div class="graph">
        </div>
    </div>

    <div class="controls">
        <div @click="changeControls('cursor')" :class="{ selected: controls === 'cursor' }">
            C
        </div>
        <div @click="changeControls('bot')" :class="{ selected: controls === 'bot' }">
            B
        </div>
        <div @click="changeControls('user')" :class="{ selected: controls === 'user' }">
            U
        </div>
        <div @click="changeControls('edge')" :class="{ selected: controls === 'edge' }">
            E
        </div>
        <div @click="changeControls('select')" :class="{ selected: controls === 'select' }">
            S
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

svg, .graph {
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
    width: 80%;
    height: auto;
    margin: 0 auto;
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
    text-align: center;
    line-height: 3rem;
    cursor: pointer;
    user-select: none;
}

.controls > *:hover {
    background-color: #fafafa;
}

.selected {
    background-color: white;
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
    text-align: end;
}
</style>