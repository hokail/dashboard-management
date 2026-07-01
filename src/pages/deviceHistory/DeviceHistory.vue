<script setup>
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Graph from "./components/Graph.vue";
import {onMounted, ref, watch,toRefs} from "vue";
import {boardStore} from "../../stores/board.js";
import {storeToRefs} from "pinia";

dayjs.extend(duration)

const useBoardState = boardStore()
const {deviceHistory} = storeToRefs(useBoardState)

const props = defineProps({
  device:{type:Object}
})

const {device} = toRefs(props);

const nodeTypeCheckOptions = ref([
    {label:'故障',value:'error'},
    {label: '报警',value:'warning'}
])

const nodeTypeCheck = ref({
  checkedList: []
});

function getStatusText(status){
  const texts = {
    online: '运行',
    offline: '离线',
    error: '故障',
    warning: '警告'
  }
  return texts[status] || '未知'
}

const nodes = ref([]);
const edges = ref([]);

const baseX = 400
const baseY = 40

watch(deviceHistory, (newVal) => {
  nodes.value = deviceHistory.value.map((node, index) => {
    return {
      id: node.id,
      shape: 'device-history-node',
      x: baseX * index,
      y: baseY,
      data: {deviceData: {...node}},
    }
  })
  nodes.value.push({
    id: 'end',
    shape: 'end-node',
    x: baseX * (deviceHistory.value.length),
    y: baseY,
    data: {deviceData: {}},
  })

  edges.value = deviceHistory.value.map((node, index) => {
    const duration = index < deviceHistory.value.length-1 ? getTimeDiff(node.startTime, deviceHistory.value[index + 1].startTime) : null
    const label = duration ? duration.formatted : null
    return {
      shape: 'my-edge',
      id: node.id + 'edge',
      source: {cell:node,port:'right'},
      target:{cell:index < deviceHistory.value.length-1 ? deviceHistory.value[index + 1].id : 'end',port:'left'},
      label
    }
  })

  function getTimeDiff(startStr, endStr) {
    const diffMs = dayjs(endStr).diff(dayjs(startStr))
    const dur = dayjs.duration(diffMs)

    return {
      days: dur.asDays().toFixed(0),
      hours: dur.hours(),
      minutes: dur.minutes(),
      seconds: dur.seconds(),
      milliseconds: dur.milliseconds(),

      // 格式化输出
      formatted: `${dur.asDays().toFixed(0)}天${dur.hours()}小时${dur.minutes()}分钟${dur.seconds()}秒`
    }
  }
});

</script>

<template>
  <a-card>
    <template #title>
      <div class="device-title">设备历史</div>
      <div class="device-info">
        <span class="device-name">设备名称：{{ device.name }} </span>
        <span class="device-status">当前状态：{{ getStatusText(device.status) }}</span>
      </div>
    </template>
    <template #extra>

      <a-space>
        <div>
          只看：
          <a-space>
            <a-checkbox-group v-model:value="nodeTypeCheck.checkedList" name="checkboxgroup" :options="nodeTypeCheckOptions" />
          </a-space>
         </div>
        <div>
          时间范围：<a-time-range-picker />
        </div>

        <a-button>刷新</a-button>
        <a-button>导出</a-button>
        <a-button>全屏</a-button>
      </a-space>
    </template>
    <div class="graph-modal" >
      <Graph :nodes="nodes" :edges="edges"></Graph>
    </div>

  </a-card>
</template>

<style scoped>
.graph-modal{
  width: 100%;
  height: 900px;
}
.device-title{
  font-size: 20px;
  font-weight: bold;
}
.device-info{
  font-size: 14px;
  font-weight: 300;
}
</style>