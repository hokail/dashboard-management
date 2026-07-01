<script setup>
import {ref, inject, onMounted} from 'vue'
import {WarningFilled,CheckCircleFilled,CloseSquareFilled,StopFilled} from '@ant-design/icons-vue'

//通过 inject 获取当前节点实例
const getNode = inject('getNode')

const deviceData = ref({})

onMounted(() => {
  const node = getNode()
  deviceData.value = node.getData().deviceData
})

const handleDispatch = () => {
  console.log('派单处理')
}

function getStatusText(status){
  const texts = {
    online: '运行',
    offline: '离线',
    error: '故障',
    warning: '警告'
  }
  return texts[status] || '未知'
}

</script>

<template>
  <div class="device-history-node">
    <div class="device-info">
      <div class="device-icon">
        <CheckCircleFilled v-if="deviceData.status === 'online'"  :style="{ fontSize: '30px', color: '#4fcf4f' }"  />
        <StopFilled v-else-if="deviceData.status === 'offline'"  :style="{ fontSize: '30px', color: 'gray' }" />
        <CloseSquareFilled v-else-if="deviceData.status === 'error'"  :style="{ fontSize: '30px', color: 'red' }" />
        <WarningFilled v-else-if="deviceData.status === 'warning'"  :style="{ fontSize: '30px', color: '#f9dd01' }"/>
      </div>
      <div class="device-content">
        <div class="device-time">{{ deviceData.startTime }}</div>
        <div class="device-status">{{ getStatusText(deviceData.status) }}</div>
        <div class="device-desc">{{ deviceData.errorDesc }}</div>
      </div>
    </div>
    <a-button v-if="deviceData.status === 'error' || deviceData.status === 'warning'" type="primary" @click="handleDispatch" class="dispatch-btn">派单处理</a-button>
<!--    <a-button type="primary" @click="handleDispatch" class="dispatch-btn">派单处理</a-button>-->
  </div>

</template>

<style scoped>
.dispatch-btn{
  width: 200px;
  height: 35px;
  margin: 18px 0;
}
.device-time{
  font-weight: 100;
  font-size: 18px;
  margin: 8px auto;
}
.device-status{
  font-size: 22px;
  font-weight: bold;
}
.device-icon{
  margin: 8px;
}
.device-info{
  display: flex;
  align-items: start;
  justify-content: start;
}
.device-history-node {
  width: 250px;
  height: 300px;
  font-size: 16px;
  color: #333;
  background-color: #ffffff;

}

</style>