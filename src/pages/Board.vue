<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const statusChartRef = ref(null)
const trendChartRef = ref(null)
let statusChart = null
let trendChart = null

const currentTime = ref(new Date().toLocaleString('zh-CN'))
const selectedTimeRange = ref('today')

const systemInfo = ref({
  version: 'v2.1.0',
  uptime: '45天12小时30分',
  cpuUsage: 32.5,
  memoryUsage: 68.2,
  networkStatus: '正常'
})

const deviceStatusData = ref({
  online: 45,
  offline: 8,
  fault: 3,
  standby: 12
})

const abnormalDevices = ref([
  { id: 'DEV001', name: 'CNC机床-01', location: '车间A-3', errorCode: 'E-301', errorDesc: '主轴温度过高', duration: '2小时15分', level: 'fault' },
  { id: 'DEV002', name: '注塑机-05', location: '车间B-7', errorCode: 'W-102', errorDesc: '液压油压力异常', duration: '45分钟', level: 'high' },
  { id: 'DEV003', name: '冲压机-12', location: '车间A-9', errorCode: 'E-205', errorDesc: '模具卡死', duration: '1小时30分', level: 'fault' },
  { id: 'DEV004', name: '焊接机器人-03', location: '车间C-2', errorCode: 'W-308', errorDesc: '焊丝送丝不畅', duration: '20分钟', level: 'high' },
  { id: 'DEV005', name: '装配线-08', location: '车间B-4', errorCode: 'E-110', errorDesc: '传送带偏移', duration: '3小时', level: 'fault' },
  { id: 'DEV006', name: '包装机-02', location: '车间A-11', errorCode: 'W-201', errorDesc: '包装材料不足', duration: '15分钟', level: 'high' },
  { id: 'DEV007', name: '切割机-06', location: '车间C-5', errorCode: 'E-402', errorDesc: '刀片磨损严重', duration: '50分钟', level: 'fault' }
])

const workshopDevices = ref([
  { id: 'D001', name: 'CNC-01', status: 'online', x: 0, y: 0 },
  { id: 'D002', name: 'CNC-02', status: 'online', x: 1, y: 0 },
  { id: 'D003', name: 'CNC-03', status: 'fault', x: 2, y: 0 },
  { id: 'D004', name: 'CNC-04', status: 'online', x: 3, y: 0 },
  { id: 'D005', name: 'CNC-05', status: 'standby', x: 4, y: 0 },
  { id: 'D006', name: 'CNC-06', status: 'online', x: 5, y: 0 },
  { id: 'D007', name: 'CNC-07', status: 'online', x: 6, y: 0 },
  { id: 'D008', name: 'CNC-08', status: 'offline', x: 7, y: 0 },

  { id: 'D009', name: '注塑-01', status: 'online', x: 0, y: 1 },
  { id: 'D010', name: '注塑-02', status: 'online', x: 1, y: 1 },
  { id: 'D011', name: '注塑-03', status: 'warning', x: 2, y: 1 },
  { id: 'D012', name: '注塑-04', status: 'online', x: 3, y: 1 },
  { id: 'D013', name: '注塑-05', status: 'fault', x: 4, y: 1 },
  { id: 'D014', name: '注塑-06', status: 'online', x: 5, y: 1 },
  { id: 'D015', name: '注塑-07', status: 'online', x: 6, y: 1 },
  { id: 'D016', name: '注塑-08', status: 'online', x: 7, y: 1 },

  { id: 'D017', name: '冲压-01', status: 'online', x: 0, y: 2 },
  { id: 'D018', name: '冲压-02', status: 'online', x: 1, y: 2 },
  { id: 'D019', name: '冲压-03', status: 'online', x: 2, y: 2 },
  { id: 'D020', name: '冲压-04', status: 'standby', x: 3, y: 2 },
  { id: 'D021', name: '冲压-05', status: 'online', x: 4, y: 2 },
  { id: 'D022', name: '冲压-06', status: 'online', x: 5, y: 2 },
  { id: 'D023', name: '冲压-07', status: 'fault', x: 6, y: 2 },
  { id: 'D024', name: '冲压-08', status: 'online', x: 7, y: 2 },

  { id: 'D025', name: '焊接-01', status: 'online', x: 0, y: 3 },
  { id: 'D026', name: '焊接-02', status: 'online', x: 1, y: 3 },
  { id: 'D027', name: '焊接-03', status: 'warning', x: 2, y: 3 },
  { id: 'D028', name: '焊接-04', status: 'online', x: 3, y: 3 },
  { id: 'D029', name: '焊接-05', status: 'online', x: 4, y: 3 },
  { id: 'D030', name: '焊接-06', status: 'online', x: 5, y: 3 },
  { id: 'D031', name: '焊接-07', status: 'online', x: 6, y: 3 },
  { id: 'D032', name: '焊接-08', status: 'offline', x: 7, y: 3 },

  { id: 'D033', name: '装配-01', status: 'online', x: 0, y: 4 },
  { id: 'D034', name: '装配-02', status: 'online', x: 1, y: 4 },
  { id: 'D035', name: '装配-03', status: 'fault', x: 2, y: 4 },
  { id: 'D036', name: '装配-04', status: 'online', x: 3, y: 4 },
  { id: 'D037', name: '装配-05', status: 'online', x: 4, y: 4 },
  { id: 'D038', name: '装配-06', status: 'standby', x: 5, y: 4 },
  { id: 'D039', name: '装配-07', status: 'online', x: 6, y: 4 },
  { id: 'D040', name: '装配-08', status: 'online', x: 7, y: 4 }
])

const faultTableData = ref([
  { key: '1', deviceId: 'DEV001', deviceName: 'CNC机床-01', faultCode: 'E-301', faultDesc: '主轴温度过高', location: '车间A-3', startTime: '08:20:15', duration: '2小时15分', status: '处理中', priority: '高' },
  { key: '2', deviceId: 'DEV003', deviceName: '冲压机-12', faultCode: 'E-205', faultDesc: '模具卡死', location: '车间A-9', startTime: '09:05:30', duration: '1小时30分', status: '待维修', priority: '高' },
  { key: '3', deviceId: 'DEV005', deviceName: '装配线-08', faultCode: 'E-110', faultDesc: '传送带偏移', location: '车间B-4', startTime: '07:35:45', duration: '3小时', status: '处理中', priority: '中' },
  { key: '4', deviceId: 'DEV007', deviceName: '切割机-06', faultCode: 'E-402', faultDesc: '刀片磨损严重', location: '车间C-5', startTime: '09:45:20', duration: '50分钟', status: '待备件', priority: '中' },
  { key: '5', deviceId: 'DEV002', deviceName: '注塑机-05', faultCode: 'W-102', faultDesc: '液压油压力异常', location: '车间B-7', startTime: '10:10:10', duration: '45分钟', status: '监控中', priority: '低' },
  { key: '6', deviceId: 'DEV004', deviceName: '焊接机器人-03', faultCode: 'W-308', faultDesc: '焊丝送丝不畅', location: '车间C-2', startTime: '10:35:25', duration: '20分钟', status: '监控中', priority: '低' }
])

const totalDevices = computed(() => {
  return Object.values(deviceStatusData.value).reduce((sum, count) => sum + count, 0)
})

const initStatusChart = () => {
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
        color: '#fff'
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
          color: '#fff'
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
          { value: deviceStatusData.value.fault, name: '故障', itemStyle: { color: '#ff4d4f' } },
          { value: deviceStatusData.value.standby, name: '待机', itemStyle: { color: '#faad14' } }
        ]
      }
    ]
  }
  statusChart.setOption(option)
}

const initTrendChart = () => {
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
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
      axisLabel: { color: '#fff', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: '故障数',
      nameTextStyle: { color: '#fff', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
      axisLabel: { color: '#fff', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [
      {
        name: '故障趋势',
        type: 'line',
        smooth: true,
        data: [2, 1, 3, 5, 4, 6, 3],
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

const getStatusColor = (status) => {
  const colors = {
    online: '#52c41a',
    offline: '#8c8c8c',
    fault: '#ff4d4f',
    standby: '#faad14',
    warning: '#faad14'
  }
  return colors[status] || '#8c8c8c'
}

const getStatusText = (status) => {
  const texts = {
    online: '运行',
    offline: '离线',
    fault: '故障',
    standby: '待机',
    warning: '警告'
  }
  return texts[status] || '未知'
}

const getPriorityTag = (priority) => {
  const config = {
    '高': { color: 'red', text: '高' },
    '中': { color: 'orange', text: '中' },
    '低': { color: 'blue', text: '低' }
  }
  return config[priority] || { color: 'default', text: priority }
}

const handleRefresh = () => {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

const getProgressColor = (percent) => {
  if (percent < 50) return '#52c41a'
  if (percent < 80) return '#faad14'
  return '#ff4d4f'
}

let timeInterval = null

onMounted(() => {
  initStatusChart()
  initTrendChart()

  timeInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleString('zh-CN')
  }, 1000)

  window.addEventListener('resize', () => {
    statusChart.resize()
    trendChart.resize()
  })
})

onUnmounted(() => {
  statusChart.dispose()
  trendChart.dispose()

  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<template>
  <div class="dashboard-container">
    <div class="top-section">
      <div class="header-bar">
        <div class="title-area">
          <h1 class="main-title">⚙️ 智能设备监控中心</h1>
          <p class="sub-title">Smart Equipment Monitoring Center | {{ currentTime }}</p>
        </div>
        <div class="header-controls">
          <a-select v-model:value="selectedTimeRange" style="width: 100px">
            <a-select-option value="today">今日</a-select-option>
            <a-select-option value="week">本周</a-select-option>
            <a-select-option value="month">本月</a-select-option>
          </a-select>
          <a-button @click="handleRefresh" size="small">🔄 刷新</a-button>
          <div class="device-count">
            <a-statistic title="设备总数" :value="totalDevices" :value-style="{ color: '#667eea', fontSize: '16px' }" />
          </div>
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
              <div class="stat-value">1256<span class="unit">kW</span></div>
            </div>
            <div class="stat-box">
              <div class="stat-label">运行时长</div>
              <div class="stat-value">18.5<span class="unit">h</span></div>
            </div>
            <div class="stat-box">
              <div class="stat-label">今日产量</div>
              <div class="stat-value success">8956</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">活跃告警</div>
              <div class="stat-value danger">7</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">平均OEE</div>
              <div class="stat-value success">82.3%</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">能耗成本</div>
              <div class="stat-value">¥3420</div>
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
              <span class="legend-item"><span class="legend-dot fault"></span>故障</span>
              <span class="legend-item"><span class="legend-dot standby"></span>待机</span>
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
          <a-badge :count="faultTableData.length" :overflow-count="99" />
        </div>
        <a-table
            :columns="[
            { title: '设备编号', dataIndex: 'deviceId', key: 'deviceId', width: 100 },
            { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 120 },
            { title: '故障代码', dataIndex: 'faultCode', key: 'faultCode', width: 100 },
            { title: '故障描述', dataIndex: 'faultDesc', key: 'faultDesc', ellipsis: true },
            { title: '位置', dataIndex: 'location', key: 'location', width: 100 },
            { title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: 100 },
            { title: '持续时间', dataIndex: 'duration', key: 'duration', width: 100 },
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
            :scroll="{ y: 280 }"
        />
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
        <div class="footer-center">
          <div class="resource-monitor">
            <div class="resource-item">
              <span class="resource-label">CPU使用率</span>
              <a-progress :percent="systemInfo.cpuUsage" :stroke-color="getProgressColor(systemInfo.cpuUsage)" size="small" style="width: 120px" />
            </div>
            <div class="resource-item">
              <span class="resource-label">内存使用率</span>
              <a-progress :percent="systemInfo.memoryUsage" :stroke-color="getProgressColor(systemInfo.memoryUsage)" size="small" style="width: 120px" />
            </div>
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
</template>

<style scoped>
.dashboard-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1428 100%);
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
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  color: rgba(255, 255, 255, 0.5);
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
  background: rgba(255, 77, 79, 0.08);
  border: 1px solid rgba(255, 77, 79, 0.2);
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
  color: rgba(255, 255, 255, 0.9);
}

.alarm-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: blink 1.5s infinite;
}

.alarm-dot.fault {
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
  color: #fff;
}

.alarm-separator {
  color: rgba(255, 255, 255, 0.3);
}

.alarm-error {
  color: #ff7875;
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
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #fff;
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
  background: rgba(255, 255, 255, 0.03);
  padding: 10px;
  border-radius: 6px;
  text-align: center;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 6px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.stat-value .unit {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 2px;
}

.stat-value.success {
  color: #52c41a;
}

.stat-value.danger {
  color: #ff4d4f;
}

.center-panel {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 12px;
  display: flex;
  flex-direction: column;
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
  color: #fff;
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
  color: rgba(255, 255, 255, 0.7);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-dot.online { background: #52c41a; }
.legend-dot.fault { background: #ff4d4f; }
.legend-dot.standby { background: #faad14; }
.legend-dot.offline { background: #8c8c8c; }

.workshop-floor {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 8px;
}

.machine-unit {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.machine-unit.online {
  border-color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
}

.machine-unit.fault {
  border-color: #ff4d4f;
  background: rgba(255, 77, 79, 0.15);
  animation: pulse-fault 2s infinite;
}

.machine-unit.standby {
  border-color: #faad14;
  background: rgba(250, 173, 20, 0.1);
}

.machine-unit.offline {
  border-color: #8c8c8c;
  background: rgba(140, 140, 140, 0.1);
}

.machine-unit.warning {
  border-color: #faad14;
  background: rgba(250, 173, 20, 0.1);
}

@keyframes pulse-fault {
  0%, 100% { box-shadow: 0 0 0 rgba(255, 77, 79, 0.4); }
  50% { box-shadow: 0 0 12px rgba(255, 77, 79, 0.8); }
}

.machine-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.machine-unit.online .machine-indicator { background: #52c41a; box-shadow: 0 0 8px #52c41a; }
.machine-unit.fault .machine-indicator { background: #ff4d4f; box-shadow: 0 0 8px #ff4d4f; }
.machine-unit.standby .machine-indicator { background: #faad14; box-shadow: 0 0 8px #faad14; }
.machine-unit.offline .machine-indicator { background: #8c8c8c; }

.machine-name {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
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
  background: rgba(255, 77, 79, 0.08);
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
  color: #fff;
  margin-bottom: 2px;
}

.alert-desc {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2px;
}

.alert-time {
  font-size: 10px;
  color: #faad14;
}

.bottom-section {
  height: 30%;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 12px;
  display: flex;
  flex-direction: column;
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
  color: #fff;
}

.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-top: auto;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.06);
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
  color: rgba(255, 255, 255, 0.5);
}

.info-value {
  color: rgba(255, 255, 255, 0.9);
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
  color: rgba(255, 255, 255, 0.6);
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
  color: #fff;
  font-family: 'Courier New', monospace;
}

.update-hint {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

:deep(.ant-table) {
  background: transparent;
  color: #fff;
  font-size: 11px;
}

:deep(.ant-table-thead > tr > th) {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  padding: 6px 8px;
  font-size: 11px;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 11px;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(255, 255, 255, 0.08);
}

:deep(.ant-table-cell) {
  color: rgba(255, 255, 255, 0.85);
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
  background-color: rgba(255, 255, 255, 0.02);
}

:deep(.ant-table-tbody > tr:nth-child(even)) {
  background-color: rgba(255, 255, 255, 0.04);
}

:deep(.ant-table-tbody > tr:nth-child(odd):hover > td) {
  background-color: rgba(102, 126, 234, 0.15) !important;
}



:deep(.ant-table-tbody > tr:nth-child(even):hover > td) {
  background-color: rgba(118, 75, 162, 0.15) !important;
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
  background: rgba(255, 255, 255, 0.05);
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
