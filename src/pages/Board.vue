<script setup>
//24小时趋势图，关键指标为静态数据
import {ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent} from 'vue'
import echarts from '../plugins/echarts'

import {useWebSocket} from "../websocket/index.js";
import {boardStore} from "../stores/board";
import {storeToRefs} from "pinia";
import DigitalBoard from "./DigitalBoard.vue";

import {throttle} from "../utils/index.js";

//异步组件
const DeviceHistory = defineAsyncComponent(() => import("./deviceHistory/DeviceHistory.vue"))
// const DigitalBoard = defineAsyncComponent(() => import("./DigitalBoard.vue"))
const ReportDispatch = defineAsyncComponent(() => import("./ReportDispatch.vue"))

const useBoardState = boardStore()

const {abnormalDevices,workshopDevices,faultTableData,keyMetrics,trendData,deviceStatusData}= storeToRefs(useBoardState)

const {getBoardData,getDeviceHistoryData} = useBoardState

let ws = ref( null)
function connectWebSocket() {
  if( !ws.value){
    ws.value = useWebSocket()

    ws.value.onOpen(() => {
      console.log('✅ WebSocket 连接成功')
    })

    ws.value.onMessage((event) => {
      try {
        //业场景设备数据推送频率很高，可能每秒几十条消息，如果每条消息都触发 DOM 更新会导致页面卡顿。
        //用节流把 UI 更新频率控制在每秒2次，用户感知上仍然是实时的，但性能提升了很多。
        throttle(handleAlarmListUpdate(event), 500)
      } catch (error) {
        console.error('解析消息失败:', error)
      }
    })

    ws.value.onClose(() => {

      console.log('❌ WebSocket 连接关闭')
    })

    ws.value.onError((error) => {
      console.log('WebSocket 错误:', error)
    })

    ws.value.connect()
  }

}

const statusChartRef = ref(null)
const trendChartRef = ref(null)

//用于向digitalBoard传递更新数据
const updatesDeviceList = ref([])

let statusChart = null
let trendChart = null

const currentTime = ref(new Date().toLocaleString('zh-CN'))

const onlineCount = computed(() => {
  return workshopDevices.value.filter(d => d.status === 'online').length || 0
})

const offlineCount = computed(() => {
  return workshopDevices.value.filter(d => d.status === 'offline').length || 0
})

const alarmCount = computed(() => {
  return workshopDevices.value.filter(d => d.status === 'error' || d.status === 'warning' ).length || 0
})

const systemInfo = ref({
  version: 'v2.1.0',
  uptime: '45天12小时30分',
  cpuUsage: 32.5,
  memoryUsage: 68.2,
  networkStatus: '正常'
})

function handleAlarmListUpdate(event) {
  try {
    const message = JSON.parse(event.data)

    if (message.type === 'device-status') {
      const updates = Array.isArray(message.data) ? message.data : [message.data]

      updatesDeviceList.value = updates

      updates.forEach(update => {
        const index = workshopDevices.value.findIndex(d => d.id === update.id)
        if (index !== -1) {
          workshopDevices.value[index] = {
            ...update,
            lastUpdate: Date.now()
          }
        }
        const indexAbnormal = abnormalDevices.value.findIndex(d => d.id === update.id)
        if(update.status === 'online' ) {
          if (indexAbnormal !== -1) {
            abnormalDevices.value.splice(index, 1)
          }
        }
        else{
          if(indexAbnormal === -1){
            abnormalDevices.value.push({
              ...update,
              lastUpdate: Date.now()
            })
          }
          abnormalDevices.value[indexAbnormal] = {
            ...update,
            lastUpdate: Date.now()
          }
        }


        const indexFault = faultTableData.value.findIndex(d => d.id === update.id)
        if(update.status === 'online'){
          if (indexFault !== -1) {
            faultTableData.value.splice(indexFault, 1)
          }
        }else {
          if (indexFault === -1) {
            faultTableData.value.push({
              ...update,
              lastUpdate: Date.now()
            })
          } else {
            faultTableData.value[indexFault] = {
              ...update,
              lastUpdate: Date.now()
            }
          }
        }
      })
      console.log('设备状态更新成功')
    }
  } catch (error) {
    console.error('解析消息失败:', error)
  }
}
const totalDevices = computed(() => {
  return Object.values(deviceStatusData.value).reduce((sum, count) => sum + count, 0)
})

function initStatusChart() {
  statusChart = echarts.init(statusChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}台 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 11,
        color: '#000'
      }
    },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['55%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{c}',
          fontSize: 11,
          color: '#000'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: deviceStatusData.value.online, name: '在线', itemStyle: { color: '#52c41a' } },
          { value: deviceStatusData.value.offline, name: '离线', itemStyle: { color: '#8c8c8c' } },
          { value: deviceStatusData.value.error, name: '故障', itemStyle: { color: '#ff4d4f' } },
          { value: deviceStatusData.value.warning, name: '警告', itemStyle: { color: '#faad14' } }
        ]
      }
    ]
  }
  statusChart.setOption(option)
}

function initTrendChart(){
  trendChart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      axisLine: { lineStyle: { color: 'rgba(0,0,0,0.3)' } },
      axisLabel: { color: '#000', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: '故障数',
      nameTextStyle: { color: '#000', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(0,0,0,0.3)' } },
      axisLabel: { color: '#000', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(0,0,0,0.1)' } }
    },
    series: [
      {
        name: '故障趋势',
        type: 'line',
        smooth: true,
        data: trendData.value,
        itemStyle: { color: '#ff4d4f' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 77, 79, 0.4)' },
            { offset: 1, color: 'rgba(255, 77, 79, 0.1)' }
          ])
        },
        lineStyle: { width: 2 }
      }
    ]
  }
  trendChart.setOption(option)
}

function getStatusColor (status){
  const colors = {
    online: '#52c41a',
    offline: '#8c8c8c',
    error: '#ff4d4f',
    warning: '#faad14',
  }
  return colors[status] || '#8c8c8c'
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

function getPriorityTag(priority){
  const config = {
    '高': { color: 'red', text: '高' },
    '中': { color: 'orange', text: '中' },
    '低': { color: 'blue', text: '低' }
  }
  return config[priority] || { color: 'default', text: priority }
}

function handleRefresh(){
  currentTime.value = new Date().toLocaleString('zh-CN')
}

function getProgressColor(percent){
  if (percent < 50) return '#52c41a'
  if (percent < 80) return '#faad14'
  return '#ff4d4f'
}

const dispatchVisible = ref(false)

function openDispatchModal() {
    dispatchVisible.value = true
}

function handleFaultTableDataUpdate(records){
  records.forEach(item => {
    const index = faultTableData.value.findIndex(alarm => alarm.alarmId === item.alarmId)
    faultTableData.value[index] = item
  })
}

const selectedDevice = ref(null)
const deviceHistoryVisible = ref(false)



function showDeviceHistoryData(device){
  selectedDevice.value = device
  deviceHistoryVisible.value = true
  getDeviceHistoryData(device)
}

function closeDeviceHistoryData(){
  selectedDevice.value = ref({})
  deviceHistoryVisible.value = false
}

const deviceHistoryModalIsFull = ref(false)

function deviceHistoryModalFullScreen() {
  deviceHistoryModalIsFull.value = !deviceHistoryModalIsFull.value
}

let timeInterval = null

onMounted(() => {
  connectWebSocket()

  initStatusChart()
  initTrendChart()

  getBoardData()

  timeInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleString('zh-CN')
  }, 1000)


  // 监听窗口大小变化，自动调整图表大小,添加节流throttle
  window.addEventListener('resize', throttle(() => {
    statusChart.resize()
    trendChart.resize()
  }),200)
})



onUnmounted(() => {
  if( ws.value){
    ws.value.close()
    ws.value = null
  }

  statusChart.dispose()
  trendChart.dispose()

  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

watch( trendData ,(newData) => {
  initTrendChart()
}, { deep: true })

watch(deviceStatusData ,(newData) => {
  initStatusChart()
},{deep: true})

watch(workshopDevices,(newData) => {

}, {deep: true})

const showDigitalBoard = ref(false)
</script>

<template>
  <div v-show="!showDigitalBoard" class="dashboard-container">
    <div class="top-section">
      <div class="header-bar">
        <div class="title-area">
          <h1 class="main-title">⚙️ 智能设备监控中心</h1>
          <p class="sub-title">Smart Equipment Monitoring Center | {{ currentTime }}</p>
        </div>
        <div class="header-controls">

          <a-statistic title="设备总数" :value="totalDevices" :value-style="{ color: '#667eea', fontSize: '16px' }" />
          <a-statistic title="在线" :value="onlineCount" :value-style="{ color: '#71ea66', fontSize: '16px' }" />
          <a-statistic title="离线" :value="offlineCount" :value-style="{ color: '#9a9a9b', fontSize: '16px' }" />
          <a-statistic title="报警" :value="alarmCount" :value-style="{ color: '#ef0404', fontSize: '16px' }" />

          <a-button @click="handleRefresh" size="small">🔄 刷新</a-button>
          <a-button  @click="showDigitalBoard = true">3D</a-button>

        </div>
      </div>

      <div class="alarm-scroll-bar">
        <div class="alarm-scroll-content">
          <span v-for="(device, index) in abnormalDevices" :key="index" class="alarm-scroll-item">
            <span class="alarm-dot" :class="device.level"></span>
            <span class="alarm-device-name">{{ device.name }}</span>
            <span class="alarm-separator">|</span>
            <span class="alarm-error">{{ device.errorDesc }}</span>
            <span class="alarm-separator">|</span>
            <span class="alarm-duration">⏱ {{ device.duration }}</span>
          </span>
        </div>
      </div>
    </div>

    <div class="middle-section">
      <div class="left-panel">
        <div class="panel-card chart-panel">
          <h3 class="panel-title">📊 设备状态分布</h3>
          <div ref="statusChartRef" class="chart-area"></div>
        </div>

        <div class="panel-card stats-panel">
          <h3 class="panel-title">📈 关键指标</h3>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">总功率</div>
              <div class="stat-value">{{ keyMetrics.power }}<span class="unit">kW</span></div>
            </div>
            <div class="stat-box">
              <div class="stat-label">运行时长</div>
              <div class="stat-value">{{keyMetrics.operatingHours}}<span class="unit">h</span></div>
            </div>
            <div class="stat-box">
              <div class="stat-label">今日产量</div>
              <div class="stat-value success">{{ keyMetrics.dailyProduction }}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">活跃告警</div>
              <div class="stat-value danger">{{ keyMetrics.activeAlarms }}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">平均OEE</div>
              <div class="stat-value success">{{  keyMetrics.averageOEE }}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">能耗成本</div>
              <div class="stat-value">¥{{ keyMetrics.cost }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="center-panel">
        <div class="workshop-container">
          <div class="workshop-header">
            <h3 class="workshop-title">🏭 车间A - 设备实时监控</h3>
            <div class="legend">
              <span class="legend-item"><span class="legend-dot online"></span>运行</span>
              <span class="legend-item"><span class="legend-dot error"></span>故障</span>
              <span class="legend-item"><span class="legend-dot warning"></span>警告</span>
              <span class="legend-item"><span class="legend-dot offline"></span>离线</span>
            </div>
          </div>
          <div class="workshop-floor">
            <div
                v-for="device in workshopDevices"
                :key="device.id"
                class="machine-unit"
                :class="device.status"
                :style="{ gridColumnStart: device.x + 1, gridRowStart: device.y + 1 }"
                :title="`${device.name} - ${getStatusText(device.status)}`"
                @dblclick="showDeviceHistoryData(device)"
            >
              <div class="machine-indicator"></div>
              <div class="machine-name">{{ device.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="panel-card chart-panel">
          <h3 class="panel-title">📉 24小时故障趋势</h3>
          <div ref="trendChartRef" class="chart-area"></div>
        </div>

        <div class="panel-card alert-panel">
          <h3 class="panel-title">🚨 紧急告警</h3>
          <div class="alert-list">
            <div v-for="(device, index) in abnormalDevices.slice(0, 4)" :key="index" class="alert-item">
              <div class="alert-icon">🔴</div>
              <div class="alert-content">
                <div class="alert-title">{{ device.name }}</div>
                <div class="alert-desc">{{ device.errorDesc }}</div>
                <div class="alert-time">{{ device.duration }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-section">
      <div class="table-container">
        <div class="table-header">
          <h3 class="table-title">📋 设备故障信息列表</h3>
          <div class="table-actions">
            <a-button @click="openDispatchModal" type="primary">派单</a-button>
            <a-badge :count="faultTableData.length" :overflow-count="99" />
          </div>

        </div>
        <a-table
            :columns="[
            { title: '设备编号', dataIndex: 'id', key: 'deviceId', width: 100 },
            { title: '设备名称', dataIndex: 'name', key: 'deviceName', width: 120 },
            { title: '故障代码', dataIndex: 'errorCode', key: 'errorCode', width: 100 },
            { title: '故障描述', dataIndex: 'errorDesc', key: 'errorDesc', ellipsis: true },
            { title: '位置', dataIndex: 'location', key: 'location', width: 100 },
            { title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: 100 },
            // { title: '持续时间', dataIndex: 'duration', key: 'duration', width: 100 },
            {
              title: '优先级',
              dataIndex: 'priority',
              key: 'priority',
              width: 80,

            },
            { title: '状态', dataIndex: 'status', key: 'status', width: 100 }
          ]"
            :data-source="faultTableData"
            :pagination="false"
            size="small"
            :scroll="{ y: 250 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'priority'">
              <a-tag v-if="record.status === 'error'" color="red">
                高
              </a-tag>
              <a-tag v-else-if="record.status === 'warning'" color="orange">
                中
              </a-tag>
            </template>
            <template v-if="column.key === 'status'">
              <a-tag v-if="record.status === 'error'" color="red">
                故障
              </a-tag>
              <a-tag v-else-if="record.status === 'warning'" color="orange">
                警告
              </a-tag>
            </template>
          </template>
        </a-table>
      </div>

      <div class="footer-info">
        <div class="footer-left">
          <div class="info-item">
            <span class="info-label">系统版本:</span>
            <span class="info-value">{{ systemInfo.version }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">运行时长:</span>
            <span class="info-value">{{ systemInfo.uptime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">网络状态:</span>
            <span class="info-value status-normal">{{ systemInfo.networkStatus }}</span>
          </div>
        </div>

        <div class="footer-right">
          <div class="time-display">
            <div class="current-time">{{ currentTime }}</div>
            <div class="update-hint">数据实时更新中...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <DigitalBoard
    v-show="showDigitalBoard"
    :deviceList="workshopDevices"
    :updateList="updatesDeviceList"
    @update:showDigitalBoard="showDigitalBoard = $event"
  ></DigitalBoard>
  <a-modal v-model:open="dispatchVisible" title="📋 工单派单管理" width="80%" :footer="null" :maskClosable="false">
    <ReportDispatch :alarmList = "faultTableData" @update:faultTableData="handleFaultTableDataUpdate"></ReportDispatch>
  </a-modal>

  <!-- 对话框开启 destroyOnClose，保证关闭对话框后，销毁画布-->
  <a-modal
      class="device-history-modal"
      v-model:open="deviceHistoryVisible"
      title="📋 设备历史数据" width="80%"
      :footer="null"
      destroyOnClose
      :maskClosable="false"
      @cancel="closeDeviceHistoryData"
      :closable="!deviceHistoryModalIsFull "
  >
    <DeviceHistory  :device="selectedDevice" ref="deviceHistory"  @fullSreen="deviceHistoryModalFullScreen"></DeviceHistory>
  </a-modal>
</template>

<style scoped>
.dashboard-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 50%, #f0f2f5 100%);
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 12px;
}

.top-section {
  height: 10%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.title-area {
  flex: 1;
}

.main-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sub-title {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.5);
  margin: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-count {
  margin-left: 8px;
}

.alarm-scroll-bar {
  background: rgba(255, 77, 79, 0.05);
  border: 1px solid rgba(255, 77, 79, 0.15);
  border-radius: 6px;
  padding: 8px 0;
  overflow: hidden;
  position: relative;
}

.alarm-scroll-content {
  display: flex;
  animation: scroll 40s linear infinite;
  white-space: nowrap;
}

.alarm-scroll-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 60px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.85);
}

.alarm-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: blink 1.5s infinite;
}

.alarm-dot.error {
  background: #ff4d4f;
  box-shadow: 0 0 8px #ff4d4f;
}

.alarm-dot.high {
  background: #faad14;
  box-shadow: 0 0 8px #faad14;
}

@keyframes scroll {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.alarm-device-name {
  font-weight: 600;
  color: #000;
}

.alarm-separator {
  color: rgba(0, 0, 0, 0.3);
}

.alarm-error {
  color: #ff4d4f;
}

.alarm-duration {
  color: #faad14;
}

.middle-section {
  height: 65%;
  display: grid;
  grid-template-columns: 1fr 4fr 1fr;
  gap: 12px;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #000;
}

.chart-panel {
  flex: 1.2;
}

.stats-panel {
  flex: 0.8;
}

.alert-panel {
  flex: 1;
}

.chart-area {
  width: 100%;
  height: 100%;
  min-height: 150px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-box {
  background: rgba(0, 0, 0, 0.03);
  padding: 10px;
  border-radius: 6px;
  text-align: center;
}

.stat-label {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 6px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #000;
}

.stat-value .unit {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.5);
  margin-left: 2px;
}

.stat-value.success {
  color: #52c41a;
}

.stat-value.danger {
  color: #ff4d4f;
}

.center-panel {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.workshop-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.workshop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.workshop-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.legend {
  display: flex;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.7);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-dot.online { background: #52c41a; }
.legend-dot.error { background: #ff4d4f; }
.legend-dot.warning { background: #faad14; }
.legend-dot.offline { background: #8c8c8c; }

.workshop-floor {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 8px;
}

.machine-unit {
  background: rgba(0, 0, 0, 0.03);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.machine-unit:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.machine-unit.online {
  border-color: #52c41a;
  background: rgba(82, 196, 26, 0.08);
}

.machine-unit.error {
  border-color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
  animation: pulse-error 2s infinite;
}


.machine-unit.warning {
  border-color: #faad14;
  background: rgba(250, 173, 20, 0.08);
}

.machine-unit.offline {
  border-color: #8c8c8c;
  background: rgba(140, 140, 140, 0.08);
}

.machine-unit.warning {
  border-color: #faad14;
  background: rgba(250, 173, 20, 0.08);
}

@keyframes pulse-error {
  0%, 100% { box-shadow: 0 0 0 rgba(255, 77, 79, 0.3); }
  50% { box-shadow: 0 0 12px rgba(255, 77, 79, 0.6); }
}

.machine-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.machine-unit.online .machine-indicator { background: #52c41a; box-shadow: 0 0 8px #52c41a; }
.machine-unit.error .machine-indicator { background: #ff4d4f; box-shadow: 0 0 8px #ff4d4f; }
.machine-unit.warning .machine-indicator { background: #faad14; box-shadow: 0 0 8px #faad14; }
.machine-unit.offline .machine-indicator { background: #8c8c8c; }

.machine-name {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.8);
  font-weight: 500;
  text-align: center;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 77, 79, 0.05);
  border-radius: 6px;
  border-left: 3px solid #ff4d4f;
}

.alert-icon {
  font-size: 16px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 12px;
  font-weight: 600;
  color: #000;
  margin-bottom: 2px;
}

.alert-desc {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 2px;
}

.alert-time {
  font-size: 10px;
  color: #faad14;
}

.bottom-section {
  height: 30%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.table-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.table-actions{
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-top: auto;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.footer-left {
  display: flex;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.info-label {
  color: rgba(0, 0, 0, 0.5);
}

.info-value {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
}

.status-normal {
  color: #52c41a;
}

.footer-center {
  display: flex;
  justify-content: center;
}

.resource-monitor {
  display: flex;
  gap: 24px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-label {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}

.footer-right {
  text-align: right;
}

.time-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.current-time {
  font-size: 13px;
  font-weight: 600;
  color: #000;
  font-family: 'Courier New', monospace;
}

.update-hint {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.4);
}

:deep(.ant-table) {
  background: transparent;
  color: #000;
  font-size: 11px;
}

:deep(.ant-table-thead > tr > th) {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.85);
  font-weight: 600;
  padding: 6px 8px;
  font-size: 11px;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 6px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 11px;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(0, 0, 0, 0.04);
}

:deep(.ant-table-cell) {
  color: rgba(0, 0, 0, 0.85);
}

:deep(.ant-table-thead > tr > th::before) {
  background-color: transparent !important;
}

:deep(.ant-table-thead> tr > th) {
  border-bottom: 0 solid transparent !important;
}

:deep(.ant-table-tbody > tr > td) {
  border-top: 0 solid transparent !important;
}

:deep(.ant-table-tbody > tr:nth-child(odd)) {
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.ant-table-tbody > tr:nth-child(even)) {
  background-color: rgba(0, 0, 0, 0.04);
}

:deep(.ant-table-tbody > tr:nth-child(odd):hover > td) {
  background-color: rgba(102, 126, 234, 0.12) !important;
}



:deep(.ant-table-tbody > tr:nth-child(even):hover > td) {
  background-color: rgba(118, 75, 162, 0.12) !important;
}


:deep(.ant-table-wrapper .ant-table-cell-scrollbar) {
  box-shadow: 0 0 !important;
}

:deep(.ant-table-wrapper .ant-table-cell-scrollbar) {
  box-shadow: 0 0 !important;
}

:deep(.ant-table-body)::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

:deep(.ant-table-body)::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.4);
  border-radius: 3px;
}

:deep(.ant-table-body)::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.6);
}

:deep(.ant-table-body)::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

:deep( .ant-table-tbody >tr:last-child>td){
  border-bottom: 0 !important;
}

@media (max-width: 1400px) {
  .main-title {
    font-size: 18px;
  }

  .machine-name {
    font-size: 9px;
  }
}
</style>
