<script setup>
import {ref, computed, onMounted, onUnmounted, toRef} from 'vue'
import dayjs from 'dayjs'
import {reportStore} from '../stores/reportDispatch.js'
import {storeToRefs} from "pinia";
import {message} from "ant-design-vue";

const props = defineProps({
  alarmList:{
    type: Array,
    default: () => []
  }
})

const emits = defineEmits(['update:faultTableData'])

const alarmList = toRef(props,'alarmList')

const useReportStore = reportStore()

const {userList} = storeToRefs(useReportStore)

const {sendDispatchList,getUserList} = useReportStore

const dispatchColumns = ref([
  { title: '', key: 'selection', width: 50, align: 'center' },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80, align: 'center' },
  { title: '派单状态', dataIndex: 'dispatchStatus', key: 'dispatchStatus', width: 100, align: 'center' },
  { title: '设备名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '故障代码', dataIndex: 'errorCode', key: 'errorCode', width: 100 },
  { title: '故障描述', dataIndex: 'errorDesc', key: 'errorDesc', ellipsis: true ,width: 500},
  { title: '位置', dataIndex: 'location', key: 'location', width: 100 },
  { title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: 120 },
  // { title: '持续时长', dataIndex: 'duration', key: 'duration', width: 100 },
  { title: '指派人', dataIndex: 'assignee', key: 'assignee', width: 100 },
  { title: '指派人电话', dataIndex: 'assigneePhone', key: 'assigneePhone', width: 120 },
  { title: '预期完成时间', dataIndex: 'expectedTime', key: 'expectedTime', width: 120 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 500 , ellipsis: true},
  { title: '操作',dataIndex:'action', key: 'action', width: 100, fixed: 'right', align: 'center' }
])

let dispatchForm = ref({
  // 报警信息（从选中的记录中获取）
  alarmId: '',           // 报警ID
  deviceId: '',          // 设备ID
  deviceName: '',        // 设备名称
  errorDesc: '',         // 故障描述
  location: '',          // 设备位置

  // 工单信息
  workOrderId: '',       // 生成的工单号（可选，系统自动生成）

  // 派单相关信息
  assignee: '',          // 指派人/维修人员
  assigneePhone: '',     // 指派人联系电话
  priority: '',          // 优先级（high/medium/low）
  expectedTime: '',      // 预计完成时间
  remark: '',            // 备注说明

})

const dispatchFormRef = ref(null)

const dispatchFormRules = {
  assignee: [
    { required: true, message: '请选择指派人', trigger: 'change' }
  ],
  assigneePhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    // { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  expectedTime: [
    { required: true, message: '请选择预计完成时间', trigger: 'change' }
  ]
}

const dispatchVisible = ref(false)
const dispatchConfirmLoading = ref(false)

const currentTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const selectedPriority = ref('')
const selectedStatus = ref('')
const searchDeviceName = ref('')
const selectedRowKeys = ref([])

const totalAlarms = computed(() => alarmList.value.length)
const unhandledAlarms = computed(() => alarmList.value.filter(item => item.dispatchStatus === 'unhandled').length)
const dispatchedToday = computed(() => alarmList.value.filter(item => item.dispatchStatus === 'dispatched').length)
const processingAlarms = computed(() => alarmList.value.filter(item => item.dispatchStatus === 'processing').length)

const searchDeviceNameList = computed(() => alarmList.value.map(item => {
  return {
    label: item.name,
    value: item.name
  }
}))

const filteredAlarmList = computed(() => {
  let result = [...alarmList.value]

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

function closeDispatchModal(){
  dispatchVisible.value = false
}

async function confirmDispatch(){
  try {
    await dispatchFormRef.value.validate()

    console.log('派单信息:', dispatchForm.value)

    const index = alarmList.value.findIndex(item => item.id === dispatchForm.value.id)

    if (index !== -1) {
      dispatchConfirmLoading.value = true
      const result = await sendDispatchList([alarmList.value[index]])
      dispatchConfirmLoading.value = false

      if(result){
        const updatedItem = {
          ...alarmList.value[index],
          dispatchStatus: 'dispatched',
          workOrderId: dispatchForm.value.workOrderId,
          assignee: dispatchForm.value.assignee,
          assigneePhone: dispatchForm.value.assigneePhone,
          expectedTime: dispatchForm.value.expectedTime
              ? dayjs(dispatchForm.value.expectedTime).format('YYYY-MM-DD HH:mm:ss')
              : '',
          remark: dispatchForm.value.remark
        }
        debugger
        emits('update:faultTableData', [updatedItem])
      }

      dispatchVisible.value = false

    }else {
      message.error('未找到对应的报警信息')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
    message.error('表单验证失败')
    dispatchConfirmLoading.value = false
  }
}

function handleDispatch(record){
  dispatchVisible.value = true
  // 填充报警信息

  dispatchForm.value = {
    alarmId: record.alarmId,
    id: record.id,
    name: record.name,
    errorDesc: record.errorDesc,
    location: record.location,
    workOrderId: `WO${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.random()).substr(2, 3)}`,
    assignee: '',
    assigneePhone: '',
    priority: record.priority,
    expectedTime: '',
    remark: ''
  }

  console.log('handleDispatch', arguments)
}

function handleRefresh() {
  currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

function onSelectChange(keys) {
  selectedRowKeys.value = keys
}

function handleBatchDispatch() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要派单的记录')
    return
  }
  console.log('批量派单:', selectedRowKeys.value)
}

function getPriorityConfig(priority) {
  const config = {
    high: { color: 'red', text: '高' },
    medium: { color: 'orange', text: '中' },
    low: { color: 'green', text: '低' }
  }
  return config[priority] || { color: 'default', text: priority }
}

function getStatusConfig(dispatchStatus) {
  const config = {
    unhandled: { color: 'red', text: '未处理' },
    processing: { color: 'blue', text: '处理中' },
    dispatched: { color: 'green', text: '已派单' }
  }
  return config[dispatchStatus] || { color: 'red', text: '未处理' }
}

function getUserName(userId){
  let user = userList.value.find(user => user.value === userId)
  return user ? user.label : userId
}

</script>
<template>
  <div class="report-dispatch-container">
    <!-- 页面标题栏 -->

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <a-card class="stat-card">
        <a-statistic
          title="总报警数"
          :value="totalAlarms"
          :value-style="{ color: '#1890ff', fontSize: '24px' }"
        />
      </a-card>
      <a-card class="stat-card">
        <a-statistic
          title="未处理"
          :value="unhandledAlarms"
          :value-style="{ color: '#ff4d4f', fontSize: '24px' }"
        />
      </a-card>
      <a-card class="stat-card">
        <a-statistic
          title="处理中"
          :value="processingAlarms"
          :value-style="{ color: '#faad14', fontSize: '24px' }"
        />
      </a-card>
      <a-card class="stat-card">
        <a-statistic
          title="今日已派单"
          :value="dispatchedToday"
          :value-style="{ color: '#52c41a', fontSize: '24px' }"
        />
      </a-card>
    </div>

    <!-- 筛选工具栏 -->
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
          @click="handleBatchDispatch"
          :disabled="selectedRowKeys.length === 0"
        >
          批量派单
        </a-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <a-card size="small" bordered class="table-card">
      <a-table
        :columns="dispatchColumns"
        :data-source="filteredAlarmList"
        :pagination="{ pageSize: 10, showSizeChanger: true, showTotal: total => `共 ${total} 条` }"
        :scroll="{ x: 1500 }"
        :row-key="record => record.id"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      >
        <template #bodyCell="{column, record}">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button
                type="primary"
                size="small"
                @click="handleDispatch(record)"
                v-if="record.dispatchStatus === 'unhandled' || !record.dispatchStatus"
              >
                派单
              </a-button>
              <a-tag v-else color="green">已派单</a-tag>
            </a-space>
          </template>

          <template v-else-if="column.key === 'priority'">
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

    <!-- 派单对话框 -->
    <a-modal
      title="派单"
      :okText="'确认派单'"
      :cancelText="'取消'"
      v-model:open="dispatchVisible"
      @cancel="closeDispatchModal"
      @ok="confirmDispatch"
      width="1000px"
      :confirmLoading="dispatchConfirmLoading"
      :maskClosable="false"
    >
      <a-form
        ref="dispatchFormRef"
        :model="dispatchForm"
        :rules="dispatchFormRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        :confirmLoading="dispatchConfirmLoading"
      >
        <!-- 报警信息区域 -->
        <a-card size="small" title="报警信息" class="form-section">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="报警ID">
                <a-input v-model:value="dispatchForm.alarmId" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="设备ID">
                <a-input v-model:value="dispatchForm.id" disabled />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="设备名称">
                <a-input v-model:value="dispatchForm.name" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="位置">
                <a-input v-model:value="dispatchForm.location" disabled />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="故障描述" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
            <a-textarea v-model:value="dispatchForm.errorDesc" :rows="2" disabled />
          </a-form-item>
        </a-card>

        <!-- 工单信息区域 -->
        <a-card size="small" title="工单信息" class="form-section">
          <a-form-item label="工单号" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
            <a-input v-model:value="dispatchForm.workOrderId" disabled />
          </a-form-item>
        </a-card>

        <!-- 派单信息区域 -->
        <a-card size="small" title="派单信息" class="form-section">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="指派人" name="assignee">
                <a-select v-model:value="dispatchForm.assignee" placeholder="请选择指派人" :options="userList">
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="联系电话" name="assigneePhone">
                <a-input v-model:value="dispatchForm.assigneePhone" placeholder="请输入联系电话" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="优先级" name="priority">
                <a-select v-model:value="dispatchForm.priority" placeholder="请选择优先级">
                  <a-select-option value="high">
                    <a-tag color="red">高</a-tag>
                  </a-select-option>
                  <a-select-option value="medium">
                    <a-tag color="orange">中</a-tag>
                  </a-select-option>
                  <a-select-option value="low">
                    <a-tag color="green">低</a-tag>
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="预计完成时间" name="expectedTime">
                <a-date-picker
                  v-model:value="dispatchForm.expectedTime"
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择预计完成时间"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="备注说明" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
            <a-textarea
              v-model:value="dispatchForm.remark"
              placeholder="请输入备注说明"
              :rows="3"
            />
          </a-form-item>
        </a-card>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.report-dispatch-container {
  width: 100%;
  height: 100%;
  padding: 16px;
  background: #f0f2f5;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.current-time {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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