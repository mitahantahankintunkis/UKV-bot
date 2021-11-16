<script setup>
import * as d3 from 'd3';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { onBeforeUnmount, onMounted, ref } from '@vue/runtime-core';


const props = defineProps([ 'project' ]);
const controls = ref('cursor');

const nodes = [
    { id: 'asdf', pos: { x: 0, y:  1 }, owner:  'bot', label: '# TODO\nBot editor example\n## List\n- Linkki [muuvo.fi](https://muuvo.fi)\n- Markdown tukee myös kuvia\n![img](https://i.imgur.com/4vNedV6.jpeg)' },
    { id: 'zxcv', pos: { x: 0, y: 10 }, owner: 'user', label: 'Lorem ipsum' },
    { id: 'qwer', pos: { x: 6, y: 15 }, owner:  'bot', label: 'Lorem ipsum dolor sit amet.' },
];

const edges = [
    { from: 'asdf', to: 'zxcv' },
    { from: 'zxcv', to: 'qwer' },
];

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
    
    container.on('click', function(e) {
        switch (controls.value) {
            case '':
                break;

            default:
                break;
        }
    });

    // Bubbles
    // Chat bubble max width is 70% of 30rem -> 336px
    const size = 84;
    const width = 4;

    // Containers for different elements
    const bubbleCont = domContent.append('div');
    const lineCont = content.append('g');

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
        // Sets bubble positions and inner HTML.
        // Calculates the height of each bubble.
        function bubbleUpdate(selection) {
            selection
                .style('transform', (d) => `translate(${d.pos.x * size}px, ${d.pos.y * size}px)`)
                .html((d) => {
                    const html = marked(d.label || '');
                    return DOMPurify.sanitize(html);
                })
                .each(function(d) { d.height = d3.select(this).node().scrollHeight });
        }

        function lineUpdate(selection) {
            selection
                .attr('x1', (d) => {
                    const node = nodes.find((n) => n.id === d.from);
                    return node.pos.x * size + (width / 2) * size;
                })
                .attr('y1', (d) => {
                    const node = nodes.find((n) => n.id === d.from);
                    return node.pos.y * size + node.height;
                })
                .attr('x2', (d) => {
                    const node = nodes.find((n) => n.id === d.to);
                    return node.pos.x * size + (width / 2) * size;
                })
                .attr('y2', (d) => {
                    const node = nodes.find((n) => n.id === d.to);
                    return node.pos.y * size;
                });
        }

        // Adds, updates, and removes bubbles
        bubbleCont
            .selectAll('div')
            .data(nodes, (d) => d.id)
            .join(
                function (enter) {
                    enter.append('div')
                        .call(bubbleDrag)
                        .call(bubbleEvents)
                        .attr('class', (d) => `bubble ${d.owner}-bubble`)
                        .call(bubbleUpdate);
                },

                bubbleUpdate,

                function (exit) {
                    d3.select(this).remove();
                });

        lineCont
            .selectAll('line')
            .data(edges, (d) => `${d.from}-${d.to}`)
            .join(
                function (enter) {
                    enter.append('line')
                        .attr('marker-end', 'url(#arrow)')
                        .attr('stroke', '#444444')
                        .attr('stroke-width', 8)
                        .style('cursor', 'pointer')
                        .call(lineUpdate);
                },

                lineUpdate,

                function (exit) {
                    d3.select(this).remove();
                });
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
    text-align: end;
}
</style>