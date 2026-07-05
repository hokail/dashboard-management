const deviceNames = [
    'CNC-01', 'CNC-02', 'CNC-03', 'CNC-04', 'CNC-05',
    '注塑-01', '注塑-02', '注塑-03', '注塑-04', '注塑-05',
    '冲压-01', '冲压-02', '冲压-03', '冲压-04', '冲压-05',
    '装配-01', '装配-02', '装配-03', '装配-04', '装配-05',
    '焊接-01', '焊接-02', '焊接-03', '焊接-04', '焊接-05',
    '切割-01', '切割-02', '切割-03', '切割-04', '切割-05',
    '打磨-01', '打磨-02', '打磨-03', '打磨-04', '打磨-05',
    '包装-01', '包装-02', '包装-03', '包装-04', '包装-05',
]

const errorCodes = ['E-101', 'E-205', 'E-301', 'E-110', 'W-102', 'W-201', 'W-308', 'E-405', 'W-501', 'E-602']
const errorDescs = [
    '主轴温度过高', '液压油压力异常', '模具卡死', '传送带偏移',
    '包装材料不足', '焊丝送丝不畅', '伺服电机过载', '冷却液泄漏',
    '气压传感器故障', '刀具磨损超标', '润滑油温度异常', '编码器信号丢失',
]
const locations = [
    '车间A-1', '车间A-2', '车间A-3', '车间A-4', '车间A-5',
    '车间B-1', '车间B-2', '车间B-3', '车间B-4', '车间B-5',
    '车间C-1', '车间C-2', '车间C-3', '车间C-4', '车间C-5',
]
const priorities = ['high', 'medium', 'low']
const dispatchStatuses = ['unhandled', 'processing', 'dispatched']
const userIds = ['zhangsan', 'lisi', 'wangwu', 'zhaoliu', 'liqi']

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function generateAlarmList(count) {
    const list = []
    for (let i = 0; i < count; i++) {
        const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0')
        const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0')
        const second = String(Math.floor(Math.random() * 60)).padStart(2, '0')
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')

        list.push({
            id: `ALM-${String(i + 1).padStart(5, '0')}`,
            priority: randomItem(priorities),
            dispatchStatus: randomItem(dispatchStatuses),
            name: randomItem(deviceNames),
            errorCode: randomItem(errorCodes),
            errorDesc: randomItem(errorDescs),
            location: randomItem(locations),
            startTime: `2026-${month}-${day} ${hour}:${minute}:${second}`,
            assignee: `${userIds[Math.floor(Math.random() * userIds.length)]}`,
            assigneePhone: Math.random() > 0.3 ? `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}` : '',
            expectedTime: Math.random() > 0.3 ? `2026-${month}-${String(Math.min(28, parseInt(day) + Math.floor(Math.random() * 7) + 1)).padStart(2, '0')}` : '',
            remark: Math.random() > 0.5 ? `设备${randomItem(deviceNames)}需要定期维护检查，注意观察运行状态` : '',
        })
    }
    return list
}

const alarmData = generateAlarmList(2000)

export default [
    {
        url: '/api/alarmHistoryList/getAlarmHistoryList',
        method: 'get',
        response: () => {
            return {
                code: 200,
                message: 'success',
                data: alarmData,
            }
        },
    }
]