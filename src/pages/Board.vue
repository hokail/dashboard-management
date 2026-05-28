<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const lineChartRef = ref(null)
const barChartRef = ref(null)
const pieChartRef = ref(null)
const areaChartRef = ref(null)

let lineChart = null
let barChart = null
let pieChart = null
let areaChart = null

const initLineChart = () => {
  lineChart = echarts.init(lineChartRef.value)
  const option = {
    title: {
      text: '销售趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 500
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['销售额', '利润'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: [820, 932, 901, 1234, 1290, 1330, 1420],
        itemStyle: { color: '#667eea' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
          ])
        }
      },
      {
        name: '利润',
        type: 'line',
        smooth: true,
        data: [320, 432, 401, 534, 590, 630, 720],
        itemStyle: { color: '#764ba2' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(118, 75, 162, 0.3)' },
            { offset: 1, color: 'rgba(118, 75, 162, 0.05)' }
          ])
        }
      }
    ]
  }
  lineChart.setOption(option)
}

const initBarChart = () => {
  barChart = echarts.init(barChartRef.value)
  const option = {
    title: {
      text: '产品分类统计',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 500
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['电子产品', '服装', '食品', '家居', '图书', '运动']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: [320, 280, 250, 220, 180, 150],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        },
        barWidth: '50%'
      }
    ]
  }
  barChart.setOption(option)
}

const initPieChart = () => {
  pieChart = echarts.init(pieChartRef.value)
  const option = {
    title: {
      text: '用户分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 500
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '用户来源',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 335, name: '直接访问' },
          { value: 310, name: '邮件营销' },
          { value: 234, name: '联盟广告' },
          { value: 135, name: '视频广告' },
          { value: 1548, name: '搜索引擎' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  pieChart.setOption(option)
}

const initAreaChart = () => {
  areaChart = echarts.init(areaChartRef.value)
  const option = {
    title: {
      text: '访问量分析',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 500
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['日访问量', '周访问量'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '日访问量',
        type: 'line',
        stack: '总量',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '周访问量',
        type: 'line',
        stack: '总量',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [220, 182, 191, 234, 290, 330, 310],
        itemStyle: { color: '#1890ff' }
      }
    ]
  }
  areaChart.setOption(option)
}

onMounted(() => {
  initLineChart()
  initBarChart()
  initPieChart()
  initAreaChart()

  window.addEventListener('resize', () => {
    lineChart?.resize()
    barChart?.resize()
    pieChart?.resize()
    areaChart?.resize()
  })
})

onUnmounted(() => {
  lineChart?.dispose()
  barChart?.dispose()
  pieChart?.dispose()
  areaChart?.dispose()
})
</script>

<template>
  <div class="board">
    <header class="board-header">
      <h1 class="board-title">数据看板</h1>
      <p class="board-subtitle">实时数据分析与监控</p>
    </header>

    <div class="board-content">
      <div class="chart-row">
        <div class="chart-card large">
          <div ref="lineChartRef" class="chart-container"></div>
        </div>
      </div>

      <div class="chart-row">
        <div class="chart-card">
          <div ref="barChartRef" class="chart-container"></div>
        </div>
        <div class="chart-card">
          <div ref="pieChartRef" class="chart-container"></div>
        </div>
      </div>

      <div class="chart-row">
        <div class="chart-card full">
          <div ref="areaChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px;
}

.board-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.board-title {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.board-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.board-content {
  max-width: 1400px;
  margin: 0 auto;
}

.chart-row {
  display: grid;
  gap: 24px;
  margin-bottom: 24px;
}

.chart-row:first-child {
  grid-template-columns: 1fr;
}

.chart-row:nth-child(2) {
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.chart-row:nth-child(3) {
  grid-template-columns: 1fr;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.chart-container {
  width: 100%;
  height: 350px;
}

@media (max-width: 768px) {
  .board {
    padding: 16px;
  }

  .board-title {
    font-size: 24px;
  }

  .chart-row:nth-child(2) {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 300px;
  }
}
</style>
