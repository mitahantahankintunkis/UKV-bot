<script setup>
import * as d3 from 'd3';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { onBeforeUnmount, onMounted, ref } from '@vue/runtime-core';


const props = defineProps([ 'project' ]);
const selected = ref(-1);
//const nodes = props.project['bot-nodes'] || [];
//const edges = props.project['bot-edges'] || [];

const nodes = [
    { id: 'asdf', pos: { x: 0, y: 1 }, label: '# TODO\nBot editor example\n##List\n- Sup\n- Kuva ![img](https://i.imgur.com/4vNedV6.jpeg)' },
    { id: 'qwer', pos: { x: 0, y: 5 }, label: 'Lorem ipsum dolor sit amet.' },
];
const edges = [
    { id: 'zxcv', from: 'asdf', to: 'qwer', label: 'Edge' },
];

// Parses markdown
for (let node of nodes) {
    const html = marked(node.label || '');
    node.cleanedHtml = DOMPurify.sanitize(html);
}

const prevTransform = ref(
    //JSON.parse(localStorage.getItem('treeview-transform')) ||
    { x: 0, y: 0, k: 1 }
);

onBeforeUnmount(function() {
    localStorage.setItem('treeview-transform', JSON.stringify(prevTransform.value));
});

onMounted(() => {
    const svg = d3.select('svg');
    const content = svg.select('g');
    const pattern = svg.select('pattern');
    const domContent = d3.select('.graph').append('div');

    // Initial transforms
    pattern.attr('patternTransform', `translate(${prevTransform.x} ${prevTransform.y}) scale(${prevTransform.k})`);
    domContent
        .style('transform-origin', '0px 0px')
        .style('transform', `translate(${prevTransform.x}px,${prevTransform.y}px) scale(${prevTransform.k})`)
        .style('width', 'fit-content')
        .style('height', 'fit-content');
    
    content.append('rect')
        .attr('x', 6 * 32)
        .attr('y', 0)
        .attr('width', 32)
        .attr('height', 32)
        .attr('rx', 4)
        .attr('fill', '#ff4444')

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
            pattern.attr('patternTransform', `translate(${t.x} ${t.y}) scale(${t.k})`)
            //pattern.attr('patternTransform', t);
        });

    svg.call(zoom)
        .call(zoom.transform,
            d3.zoomIdentity
                .translate(prevTransform.value.x, prevTransform.value.y)
                .scale(prevTransform.value.k))
        .on("dblclick.zoom", null);

    // Grabbing TODO

    // Lines
    const size = 64;
    const width = 4;
    const height = 1;

    content.selectAll('line')
        .data(edges)
        .join('line')
        .attr('x1', (d) => {
            const node = nodes.find((n) => n.id === d.from);
            return node.pos.x * size + (width / 2) * size;
        })
        .attr('y1', (d) => {
            const node = nodes.find((n) => n.id === d.from);
            return node.pos.y * size + height * size;
        })
        .attr('x2', (d) => {
            const node = nodes.find((n) => n.id === d.to);
            return node.pos.x * size + (width / 2) * size;
        })
        .attr('y2', (d) => {
            const node = nodes.find((n) => n.id === d.to);
            return node.pos.y * size;
        })
        .attr('stroke', '#444444')
        .attr('stroke-width', 2)

    // Nodes
    //background-color: #8cc6d4;
    //background-color: #b6d7df;
    //border-radius: 1rem 1rem 1rem 0;
    //max-width: 70%;
    //width: max-content;

    const messageBubbles = domContent
        .selectAll('div')
        .data(nodes)
        .join('div')
        .style('width', `${width * size}px`)
        .style('height', `${height * size}px`)
        .style('background-color', '#b6d7df')
        .style('color', '#003a49')
        .style('border-radius', '1rem 1rem 1rem 0')
        .style('padding', '1rem')
        .style('transform', (d) => `translate(${d.pos.x * size}px, ${d.pos.y * size}px)`);

    // Message as html
    messageBubbles
        .append('div')
        .html((d) => d.cleanedHtml)

        // Calculates the inner html height
        .each(function(d, i) {
            const element = d3.select(this);
            const h = element.node().scrollHeight;

            d.height = Math.ceil(h / size) * size;
            d.width = width * size;
        });

    messageBubbles
        .style('height', (d) => `fit-content`);
        //.style('height', (d) => `${d.height}px`);

    //const foreignObjects = messages
    //    .append('foreignObject')
    //    .attr('x', (d) => d.pos.x * size)
    //    .attr('y', (d) => d.pos.y * size)
    //    .attr('width', width * size)
    //    .attr('height', height * size)
    //    .attr('position', 'absolute');

    //foreignObjects.append('xhtml:div')
    //    .html((d) => d.cleanedHtml)

    //    // Calculates the inner html height
    //    .each(function(d, i) {
    //        const element = d3.select(this);
    //        const h = element.node().scrollHeight;

    //        d.height = Math.ceil(h / size) * size;
    //        d.width = width * size;
    //    });

    //// Sets the height according to the value calculated above
    //foreignObjects.attr('height', (d) => d.height);

    //messages.append('rect')
    //    .attr('fill', 'white')
    //    .attr('stroke', (d) => d.id === selected.value ? '#cc4444' : '#444444')
    //    .attr('stroke-width', (d) => d.id === selected.value ? 2 : 1)
    //    .attr('width', (d) => d.width)
    //    .attr('height', (d) => d.height)
    //    .attr('rx', 6)
    //    .attr('x', (d) => d.pos.x * size)
    //    .attr('y', (d) => d.pos.y * size)
    //    .attr('cursor', 'pointer');
    //    //.on('click', (e, d) => {
    //    //    emit('selected', d.id);
    //    //});

    //messages.append('text')
    //    .attr('fill', 'black')
    //    .attr('x', (d) => d.pos.x * size + size / 4)
    //    .attr('y', (d) => d.pos.y * size + (height * size) / 2 + size / 16)
    //    .attr('font-size', '7px')
    //    .attr('pointer-events', 'none')
    //    .text((d) => d.label.length > 30 ? `${d.label.substr(0, 30)}...` : d.label);
});

</script>


<template>
    <div class="cont">
        <svg>
            <defs>
                <pattern id="dots" x="-2" y="-2" width="64" height="64" patternUnits="userSpaceOnUse">
                    <circle fill="#ccc" cx="2" cy="2" r="2">
                    </circle>
                </pattern>
            </defs>
        
            <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"></rect>

                <g :transform="`translate(${prevTransform.x},${prevTransform.y}) scale(${prevTransform.k})`">
                </g>
        </svg>

        <div class="graph">
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
}

.graph:deep(ul) {
    list-style-position: inside;
}
</style>



<!--
    const messages = content.selectAll('g')
        .data(nodes)
        .join('g');

    const foreignObjects = messages
        .append('foreignObject')
        .attr('x', (d) => d.pos.x * size)
        .attr('y', (d) => d.pos.y * size)
        .attr('width', width * size)
        .attr('height', height * size)
        .attr('position', 'absolute');

    foreignObjects.append('xhtml:div')
        .html((d) => d.cleanedHtml)

        // Calculates the inner html height
        .each(function(d, i) {
            const element = d3.select(this);
            const h = element.node().scrollHeight;

            d.height = Math.ceil(h / size) * size;
            d.width = width * size;
        });

    // Sets the height according to the value calculated above
    foreignObjects.attr('height', (d) => d.height);

    messages.append('rect')
        .attr('fill', 'white')
        .attr('stroke', (d) => d.id === selected.value ? '#cc4444' : '#444444')
        .attr('stroke-width', (d) => d.id === selected.value ? 2 : 1)
        .attr('width', (d) => d.width)
        .attr('height', (d) => d.height)
        .attr('rx', 6)
        .attr('x', (d) => d.pos.x * size)
        .attr('y', (d) => d.pos.y * size)
        .attr('cursor', 'pointer');
        //.on('click', (e, d) => {
        //    emit('selected', d.id);
        //});

    //messages.append('text')
    //    .attr('fill', 'black')
    //    .attr('x', (d) => d.pos.x * size + size / 4)
    //    .attr('y', (d) => d.pos.y * size + (height * size) / 2 + size / 16)
    //    .attr('font-size', '7px')
    //    .attr('pointer-events', 'none')
    //    .text((d) => d.label.length > 30 ? `${d.label.substr(0, 30)}...` : d.label);
    -->