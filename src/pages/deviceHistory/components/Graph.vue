<script setup>

import { Graph, Shape } from '@antv/x6'
import {onMounted, defineComponent, toRefs, watch} from "vue";
import { register, getTeleport } from '@antv/x6-vue-shape'
import DeviceHistoryNode from "../../../graph/nodes/DeviceHistoryNode.vue";
import {registerDeviceHistoryEdge, registerDeviceHistoryNode} from "../../../graph/nodes/register.js";

registerDeviceHistoryEdge()
registerDeviceHistoryNode()

//getTeleport() — 获取一个特殊的容器组件，它内部会收集所有需要渲染的 Vue 节点
//<TeleportContainer/> — 放在模板中，它会监听 X6 图中所有使用 Vue 组件的节点，把它们统一渲染到自己内部
const TeleportContainer = getTeleport()

const props = defineProps({
  nodes: { type: Array, required: true },
  edges: { type: Array, required: true },
})

const {nodes,edges} = toRefs(props);

function init(){
  const data = {
    nodes:nodes.value,
    edges:edges.value
  }

  const graph = new Graph({
    container: document.getElementById('container'),
    autoResize: true,
    connecting: {
      allowBlank:false,
      allowPort: true,
      allowNode:false,
      allowEdge:false,
      allowMulti:false,
      allowLoop:false,
      snap: { radius: 20 },
      // 锚点定在连接桩中心
      anchor: 'center',
      // 连接点就使用锚点本身，不再偏移到边框
      connectionPoint: 'anchor',
    },

    mousewheel: {
      enabled: true,              // 开启
      zoomAtMousePosition: true,  // 以鼠标位置为中心缩放
      factor: 1.2,                // 缩放步长，默认 1.2
      minScale: 0.2,              // 最小缩放比
      maxScale: 3,                // 最大缩放比
      // modifiers: ['ctrl'],     // 按住 Ctrl
    },
    interacting: {
      nodeMovable: false,   // 禁止节点拖动
    },
    // 设置画布背景颜色
    background: {
      color: '#ffffff',
    },
  })

  // 鼠标进入节点时，显示该节点的所有连接桩
  // graph.on('cell:mouseenter', ({ cell }) => {
  //   if (cell.isNode()) {
  //     cell.getPorts().forEach(port => {
  //       cell.setPortProp(port.id, 'attrs/circle/style/visibility', 'visible');
  //     });
  //   }
  // });

  // 鼠标离开节点时，隐藏节点的连接桩
  // graph.on('cell:mouseleave', ({ cell }) => {
  //   if (cell.isNode()) {
  //     graph.getNodes().forEach(node => {
  //       node.getPorts().forEach(port => {
  //         node.setPortProp(port.id, 'attrs/circle/style/visibility', 'hidden');
  //       });
  //     });
  //   }
  // });

  graph.fromJSON(data) // 渲染元素
  graph.centerContent() // 居中显示
}



watch(nodes, () => {
  init()
})



</script>

<template>
  <div id="container"></div>
  <TeleportContainer/>
</template>

<style scoped>

</style>