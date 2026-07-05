<script setup>
import {computed, onMounted, ref} from "vue";
import {alarmHistoryListStore} from "../stores/alarmHistoryList.js";
import {storeToRefs} from "pinia";

import * as XLSX from 'xlsx'
import {debounce} from "../utils/index.js";

const useAlarmHistoryListStore = alarmHistoryListStore();

const {alarmHistoryList,userList} = storeToRefs(useAlarmHistoryListStore)
const {getAlarmHistoryList,getUserList} = useAlarmHistoryListStore

const alarmColumns = ref([
  { title: '', key: 'selection', width: 50, align: 'center' ,noExport:true},
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80, align: 'center' },
  { title: '派单状态', dataIndex: 'dispatchStatus', key: 'dispatchStatus', width: 100, align: 'center' },
  { title: '设备名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '故障代码', dataIndex: 'errorCode', key: 'errorCode', width: 100 },
  { title: '故障描述', dataIndex: 'errorDesc', key: 'errorDesc', ellipsis: true ,width: 500},
  { title: '位置', dataIndex: 'location', key: 'location', width: 100 },
  { title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: 150 },
  // { title: '持续时长', dataIndex: 'duration', key: 'duration', width: 100 },
  { title: '指派人', dataIndex: 'assignee', key: 'assignee', width: 100 },
  { title: '指派人电话', dataIndex: 'assigneePhone', key: 'assigneePhone', width: 120 },
  { title: '预期完成时间', dataIndex: 'expectedTime', key: 'expectedTime', width: 120 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 500 , ellipsis: true},
])

const selectedPriority = ref('')
const selectedStatus = ref('')
const searchDeviceName = ref('')

const exportLoading = ref(false)

const filteredAlarmList = computed(() => {
  let result = [...alarmHistoryList.value]

  if (selectedPriority.value) {
    result = result.filter(item => item.priority === selectedPriority.value)
  }

  if (selectedStatus.value) {
    result = result.filter(item => item.dispatchStatus === selectedStatus.value)
  }

  if (searchDeviceName.value) {
    result = result.filter(item =>
        item.name.includes(searchDeviceName.value)
    )
  }

  return result
})

function exportToExcel(data, columns, filename = '导出.xlsx') {
  exportLoading.value = true
  // 过滤出需要导出的列
  const exportColumns = columns.filter(c => !c.noExport)

  //表头
  const header = exportColumns.map(c => c.title)
  //列数据
  const keys = exportColumns.map(c => c.dataIndex)
  //数据行
  const rows = data.map(item => keys.map(key => {
    if(key === 'priority')
      return getPriorityConfig(item[key]).text
    else if(key === 'dispatchStatus')
      return getStatusConfig(item[key]).text
    else if(key === 'assignee')
      return getUserName(item[key])
    else
      return item[key] ?? ''
  }))
  //创建工作表
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])

  // 设置列宽：wch = 字符数，约等于 width(px) / 8
  ws['!cols'] = exportColumns.map(c => ({ wch: Math.max(Math.round((c.width || 100) / 8), 8) }))
  //创建工作簿
  const wb = XLSX.utils.book_new()
  //将工作表添加到工作簿
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, filename)
  exportLoading.value = false
}

function handleExport(){
  exportToExcel(alarmHistoryList.value, alarmColumns.value, '报警历史列表.xlsx')
}

const debouncedExport = debounce(handleExport, 1000)

const searchDeviceNameList = computed(() => alarmHistoryList.value.map(item => {
  return {
    label: item.name,
    value: item.name
  }
}))

function getPriorityConfig(priority) {
  const config = {
    high: { color: 'red', text: '高' },
    medium: { color: 'orange', text: '中' },
    low: { color: 'green', text: '低' }
  }
  return config[priority] || { color: 'default', text: priority }
}

function getStatusConfig(status) {
  const config = {
    unhandled: { color: 'red', text: '未处理' },
    processing: { color: 'blue', text: '处理中' },
    dispatched: { color: 'green', text: '已派单' }
  }
  return config[status] || { color: 'red', text: '未处理' }
}

function getUserName(userId){
  let user = userList.value.find(user => user.value === userId)
  return user ? user.label : userId
}

onMounted(() => {
  getUserList()
  getAlarmHistoryList()

})
</script>

<template>
  <div class="alarm-history-list-container">
    <div class="filter-toolbar">
      <div class="filter-left">
        <a-select
            v-model:value="selectedPriority"
            placeholder="优先级"
            style="width: 120px"
            allow-clear
        >
          <a-select-option value="high">高</a-select-option>
          <a-select-option value="medium">中</a-select-option>
          <a-select-option value="low">低</a-select-option>
        </a-select>

        <a-select
            v-model:value="selectedStatus"
            placeholder="状态"
            style="width: 120px"
            allow-clear
        >
          <a-select-option value="unhandled">未处理</a-select-option>
          <a-select-option value="processing">处理中</a-select-option>
          <a-select-option value="dispatched">已派单</a-select-option>
        </a-select>

        <a-select
            v-model:value="searchDeviceName"
            placeholder="搜索设备名称"
            style="width: 200px"
            allow-clear
            show-search
            :options="searchDeviceNameList"
        />
      </div>
      <div class="filter-right">
        <a-button
            type="primary"
            @click="debouncedExport"
            :loading="exportLoading"
        >
          导出
        </a-button>
      </div>
    </div>
    <!-- 表格区域 -->
    <a-card size="small" bordered class="table-card">
      <a-table
          :columns="alarmColumns"
          :data-source="filteredAlarmList"
          :virtual="true"
          :scroll="{ x: 1500, y: 600 }"
          :row-key="record => record.id"
      >
        <template #bodyCell="{column, record}">
          <template v-if="column.key === 'priority'">
            <a-tag :color="getPriorityConfig(record.priority).color">
              {{ getPriorityConfig(record.priority).text }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'dispatchStatus'">
            <a-tag :color="getStatusConfig(record.dispatchStatus).color">
              {{ getStatusConfig(record.dispatchStatus).text }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'assignee'">
            {{ getUserName(record.assignee) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>

</template>

<style scoped>
.alarm-history-list-container {
  width: 100%;
  height: 100%;
  padding: 16px;
  background: #f0f2f5;
  overflow-y: auto;
}

.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-left {
  display: flex;
  gap: 12px;
}

.table-card {
  background: white;
}

.form-section {
  margin-bottom: 16px;
}

.form-section:last-child {
  margin-bottom: 0;
}
</style>