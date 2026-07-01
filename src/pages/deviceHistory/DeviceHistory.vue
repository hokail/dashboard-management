<script setup>
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Graph from "./components/Graph.vue";
import {onMounted, ref, watch,toRefs} from "vue";
import {boardStore} from "../../stores/board.js";
import {storeToRefs} from "pinia";
dayjs.locale('zh-cn')
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

function setGraphData(originNodes){
  nodes.value = originNodes.map((node, index) => {
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
    x: baseX * (originNodes.length),
    y: baseY,
    data: {deviceData: {}},
  })

  edges.value = originNodes.map((node, index) => {
    const duration = index < originNodes.length-1 ? getTimeDiff(node.startTime, originNodes[index + 1].startTime) : null
    const label = duration ? duration.formatted : null
    return {
      shape: 'my-edge',
      id: node.id + 'edge',
      source: {cell:node,port:'right'},
      target:{cell:index < originNodes.length-1 ? originNodes[index + 1].id : 'end',port:'left'},
      label
    }
  })
}

watch(deviceHistory, (newVal) => {
  setGraphData(newVal)
});

//格式化时间间隔
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

// 判断时间是否在范围内
function isInRange(target, start, end) {
  if (!start || !end) return true
  return (
      (target.isAfter(start) || target.isSame(start)) &&
      (target.isBefore(end) || target.isSame(end))
  )
}

function handleSelectedConditionChange() {
  let filteredNodes = []
  if(nodeTypeCheck.value.checkedList.length > 0){
    filteredNodes = deviceHistory.value.filter(node => nodeTypeCheck.value.checkedList.includes(node.status))
  }else{
    filteredNodes = deviceHistory.value
  }

  if(selectedDate.value && selectedDate.value.length > 0){
    filteredNodes = filteredNodes.filter(node => isInRange(dayjs(node.startTime), selectedDate.value[0], selectedDate.value[1]))//包含时间范围的边界
  }
  setGraphData(filteredNodes)
}

const selectedDate = ref([])

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
            <a-checkbox-group v-model:value="nodeTypeCheck.checkedList" name="checkboxgroup" :options="nodeTypeCheckOptions" @change="handleSelectedConditionChange"/>
          </a-space>
         </div>
        <div>
          时间范围：<a-range-picker v-model:value="selectedDate"  allowClaer  @change="handleSelectedConditionChange" />
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