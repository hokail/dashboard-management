import {defineStore} from "pinia";
import {ref} from 'vue'
import {message} from "ant-design-vue";

export const boardStore =  defineStore('board', () => {
    const board = ref([])
    const boardLoading = ref(false)
    const boardError = ref(null)

    const abnormalDevices = ref([])
    const workshopDevices = ref([])
    const faultTableData = ref([])

    const deviceHistory = ref([])

    const keyMetrics = ref({
        power:'',
        activeAlarms:'',
        dailyProduction:'',
        operatingHours:'',
        averageOEE: '',
        cost:''
    })

    const deviceStatusData = ref({
        online: '',
        offline: '',
        error: '',
        standby: ''
    })

    const trendData = ref([])

    async function getTrendData() {
        try {
            const response = await fetch('/api/board/getTrendData')
            const result = await response.json()
            if (result.code === 200){
                trendData.value = result.data.trendData
                console.log(result.data.trendData,'趋势数据')
            }else {
                message.error('获取趋势数据失败')
            }

        } catch (error) {
            console.log( error)
        }
    }

    async function getKeyMetrics() {
        try {
            const response = await fetch('/api/board/getKeyMetrics')
            const result = await response.json()
            if (result.code === 200){
                keyMetrics.value = result.data.keyMetrics
            }else {
                message.error('获取关键指标数据失败')
            }

        } catch (error) {
            console.log( error)
        }
    }

    async function getAbnormalDevices() {
        try {
            const response = await fetch('/api/board/getAbnormalDevices')
            const result = await response.json()
            if (result.code === 200){
                abnormalDevices.value = result.data.abnormalDevices
            }else {
                message.error('获取异常设备失败')
            }

        } catch (error) {
            console.log( error)
        }
    }

    async function getDeviceHistoryData(device) {
        deviceHistory.value = []
        try {
            const response = await fetch('/api/board/getDeviceHistory',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deviceId:device.id

                })
            })

            const result = await response.json()
            if (result.code === 200){
                deviceHistory.value = result.data.deviceHistory
            }else {
                message.error('获取异常设备失败')
            }

        } catch (error) {
            console.log( error)
        }
    }

    async function getWorkshopDevices() {
        try {
            const response = await fetch('/api/board/getWorkshopDevices')
            const result = await response.json()
            if (result.code === 200){
                workshopDevices.value = result.data.workshopDevices
                deviceStatusData.value = {
                    online: workshopDevices.value.filter(device => device.status === 'online').length,
                    offline: workshopDevices.value.filter(device => device.status === 'offline').length,
                    error: workshopDevices.value.filter(device => device.status === 'error').length,
                    standby: workshopDevices.value.filter(device => device.status === 'standby').length
                }

            }else {
                message.error('获取工位设备失败')
            }

        } catch (error) {
            console.log( error)
        }
    }

    async function getFaultTableData() {
        try {
            const response = await fetch('/api/board/getFaultTableData')
            const result = await response.json()
            if (result.code === 200){
                faultTableData.value = result.data.faultTableData
            }else {
                message.error('获取故障数据失败')
            }

        } catch (error) {
            console.log( error)
        }
    }
    function getBoardData() {
        console.log('获取设备信息')
        getAbnormalDevices()
        getWorkshopDevices()
        getFaultTableData()
        getKeyMetrics()
        getTrendData()
    }

    return {
        board,
        boardLoading,
        boardError,
        abnormalDevices,
        workshopDevices,
        faultTableData,
        keyMetrics,
        trendData,
        deviceStatusData,
        deviceHistory,
        getDeviceHistoryData,
        getAbnormalDevices,
        getWorkshopDevices,
        getFaultTableData,
        getBoardData
    }
})