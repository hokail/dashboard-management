export default [
    {
        url: '/api/board/getTrendData',
        method: 'get',
        response: () => {
            return {
                code: 200,
                message: 'success',
                data: {
                    trendData: [2, 1, 3, 5, 4, 6, 3]
                }
            }

        }
    },
    {
        url: '/api/board/getKeyMetrics',
        method: 'get',
        response: () => {
            return {
                code: 200,
                message: 'success',
                data: {
                    keyMetrics: {
                        power:'1256',
                        activeAlarms:'7',
                        dailyProduction:'8956',
                        operatingHours:'18.5',
                        averageOEE: '98.5%',
                        cost:'3420'
                    }
                }
            }

        }
    },
    {
        url: '/api/board/getAbnormalDevices',
        method: 'get',
        response: () => {
            return {
                code: 200,
                message: 'success',
                data: {
                    abnormalDevices: [
                        { alarmId:'1',id: 'D003', name: 'CNC-03', type: 'CNC机床', status: 'error', location: '车间A-3', errorCode: 'E-301', errorDesc: '主轴温度过高', duration: '2小时15分', priority: 'medium' },
                        { alarmId:'2',id: 'D013', name: '注塑-05', type: '注塑机', status: 'error', location: '车间B-7', errorCode: 'W-102', errorDesc: '液压油压力异常', duration: '45分钟', priority: 'medium' },
                        { alarmId:'3',id: 'D023', name: '冲压-07', type: '冲压机', status: 'error', location: '车间A-9', errorCode: 'E-205', errorDesc: '模具卡死', duration: '1小时30分', priority: 'medium' },
                        { alarmId:'4',id: 'D035', name: '装配-03', type: '装配线', status: 'error', location: '车间B-4', errorCode: 'E-110', errorDesc: '传送带偏移', duration: '3小时', priority: 'medium' },
                        { alarmId:'5',id: 'D011', name: '注塑-03', type: '注塑机', status: 'warning', location: '车间C-5', errorCode: 'W-201', errorDesc: '包装材料不足', duration: '15分钟', priority: 'high' },
                        { alarmId:'6',id: 'D027', name: '焊接-03', type: '焊接机器人', status: 'warning', location: '车间C-2', errorCode: 'W-308', errorDesc: '焊丝送丝不畅', duration: '20分钟', priority: 'high' }
                    ],
                }
            }

        }
    },
    {
        url: '/api/board/getWorkshopDevices',
        method: 'get',
        response: () => {
            return {
                code: 200,
                message: 'success',
                data: {
                    workshopDevices: [
                        { id: 'D001', name: 'CNC-01', type: 'CNC机床', status: 'online', x: 0, y: 0 },
                        { id: 'D002', name: 'CNC-02', type: 'CNC机床', status: 'online', x: 1, y: 0 },
                        { id: 'D003', name: 'CNC-03', type: 'CNC机床', status: 'error', x: 2, y: 0 },
                        { id: 'D004', name: 'CNC-04', type: 'CNC机床', status: 'online', x: 3, y: 0 },
                        { id: 'D005', name: 'CNC-05', type: 'CNC机床', status: 'online', x: 4, y: 0 },
                        { id: 'D006', name: 'CNC-06', type: 'CNC机床', status: 'online', x: 5, y: 0 },
                        { id: 'D007', name: 'CNC-07', type: 'CNC机床', status: 'online', x: 6, y: 0 },
                        { id: 'D008', name: 'CNC-08', type: 'CNC机床', status: 'offline', x: 7, y: 0 },

                        { id: 'D009', name: '注塑-01', type: '注塑机', status: 'online', x: 0, y: 1 },
                        { id: 'D010', name: '注塑-02', type: '注塑机', status: 'online', x: 1, y: 1 },
                        { id: 'D011', name: '注塑-03', type: '注塑机', status: 'warning', x: 2, y: 1 },
                        { id: 'D012', name: '注塑-04', type: '注塑机', status: 'online', x: 3, y: 1 },
                        { id: 'D013', name: '注塑-05', type: '注塑机', status: 'error', x: 4, y: 1 },
                        { id: 'D014', name: '注塑-06', type: '注塑机', status: 'online', x: 5, y: 1 },
                        { id: 'D015', name: '注塑-07', type: '注塑机', status: 'online', x: 6, y: 1 },
                        { id: 'D016', name: '注塑-08', type: '注塑机', status: 'online', x: 7, y: 1 },

                        { id: 'D017', name: '冲压-01', type: '冲压机', status: 'online', x: 0, y: 2 },
                        { id: 'D018', name: '冲压-02', type: '冲压机', status: 'online', x: 1, y: 2 },
                        { id: 'D019', name: '冲压-03', type: '冲压机', status: 'online', x: 2, y: 2 },
                        { id: 'D020', name: '冲压-04', type: '冲压机', status: 'online', x: 3, y: 2 },
                        { id: 'D021', name: '冲压-05', type: '冲压机', status: 'online', x: 4, y: 2 },
                        { id: 'D022', name: '冲压-06', type: '冲压机', status: 'online', x: 5, y: 2 },
                        { id: 'D023', name: '冲压-07', type: '冲压机', status: 'error', x: 6, y: 2 },
                        { id: 'D024', name: '冲压-08', type: '冲压机', status: 'online', x: 7, y: 2 },

                        { id: 'D025', name: '焊接-01', type: '焊接机器人', status: 'online', x: 0, y: 3 },
                        { id: 'D026', name: '焊接-02', type: '焊接机器人', status: 'online', x: 1, y: 3 },
                        { id: 'D027', name: '焊接-03', type: '焊接机器人', status: 'warning', x: 2, y: 3 },
                        { id: 'D028', name: '焊接-04', type: '焊接机器人', status: 'online', x: 3, y: 3 },
                        { id: 'D029', name: '焊接-05', type: '焊接机器人', status: 'online', x: 4, y: 3 },
                        { id: 'D030', name: '焊接-06', type: '焊接机器人', status: 'online', x: 5, y: 3 },
                        { id: 'D031', name: '焊接-07', type: '焊接机器人', status: 'online', x: 6, y: 3 },
                        { id: 'D032', name: '焊接-08', type: '焊接机器人', status: 'offline', x: 7, y: 3 },

                        { id: 'D033', name: '装配-01', type: '装配线', status: 'online', x: 0, y: 4 },
                        { id: 'D034', name: '装配-02', type: '装配线', status: 'online', x: 1, y: 4 },
                        { id: 'D035', name: '装配-03', type: '装配线', status: 'error', x: 2, y: 4 },
                        { id: 'D036', name: '装配-04', type: '装配线', status: 'online', x: 3, y: 4 },
                        { id: 'D037', name: '装配-05', type: '装配线', status: 'online', x: 4, y: 4 },
                        { id: 'D038', name: '装配-06', type: '装配线', status: 'online', x: 5, y: 4 },
                        { id: 'D039', name: '装配-07', type: '装配线', status: 'online', x: 6, y: 4 },
                        { id: 'D040', name: '装配-08', type: '装配线', status: 'online', x: 7, y: 4 }
                    ],
                }
            }

        }
    },
    {
        url: '/api/board/getFaultTableData',
        method: 'get',
        response: () => {
            return {
                code: 200,
                message: 'success',
                data: {
                    faultTableData: [
                        { alarmId: '1', id: 'D003', name: 'CNC-03', deviceType: 'CNC机床', status: 'error', errorCode: 'E-301', errorDesc: '主轴温度过高', location: '车间A-3', startTime: '08:20:15', duration: '2小时15分', handleStatus: '处理中', priority: 'high' },
                        { alarmId: '2', id: 'D013', name: '注塑-05', deviceType: '注塑机', status: 'error', errorCode: 'W-102', errorDesc: '液压油压力异常', location: '车间B-7', startTime: '09:05:30', duration: '45分钟', handleStatus: '待维修', priority: 'high' },
                        { alarmId: '3', id: 'D023', name: '冲压-07', deviceType: '冲压机', status: 'error', errorCode: 'E-205', errorDesc: '模具卡死', location: '车间A-9', startTime: '10:15:20', duration: '1小时30分', handleStatus: '处理中', priority: 'medium' },
                        { alarmId: '4', id: 'D035', name: '装配-03', deviceType: '装配线', status: 'error', errorCode: 'E-110', errorDesc: '传送带偏移', location: '车间B-4', startTime: '07:35:45', duration: '3小时', handleStatus: '待备件', priority: 'medium' },
                        { alarmId: '5', id: 'D011', name: '注塑-03', deviceType: '注塑机', status: 'warning', errorCode: 'W-201', errorDesc: '包装材料不足', location: '车间C-5', startTime: '10:30:10', duration: '15分钟', handleStatus: '监控中', priority: 'low' },
                        { alarmId: '6', id: 'D027', name: '焊接-03', deviceType: '焊接机器人', status: 'warning', errorCode: 'W-308', errorDesc: '焊丝送丝不畅', location: '车间C-2', startTime: '10:35:25', duration: '20分钟', handleStatus: '监控中', priority: 'low' }
                    ],
                }
            }

        }
    },
    {
        url: '/api/board/getDeviceHistory',
        method: 'post',
        response: ({body}) => {
            const deviceInfoMap = {
                'D001': { name: 'CNC-01', type: 'CNC机床', locations: ['车间A-1', '车间A-2', '车间A-3'] },
                'D002': { name: 'CNC-02', type: 'CNC机床', locations: ['车间A-1', '车间A-2', '车间A-3'] },
                'D003': { name: 'CNC-03', type: 'CNC机床', locations: ['车间A-1', '车间A-2', '车间A-3'] },
                'D004': { name: 'CNC-04', type: 'CNC机床', locations: ['车间A-1', '车间A-2', '车间A-3'] },
                'D005': { name: 'CNC-05', type: 'CNC机床', locations: ['车间A-1', '车间A-2', '车间A-3'] },
                'D006': { name: 'CNC-06', type: 'CNC机床', locations: ['车间A-1', '车间A-2', '车间A-3'] },
                'D007': { name: 'CNC-07', type: 'CNC机床', locations: ['车间A-1', '车间A-2', '车间A-3'] },
                'D008': { name: 'CNC-08', type: 'CNC机床', locations: ['车间A-1', '车间A-2', '车间A-3'] },
                'D009': { name: '注塑-01', type: '注塑机', locations: ['车间B-1', '车间B-2', '车间B-3'] },
                'D010': { name: '注塑-02', type: '注塑机', locations: ['车间B-1', '车间B-2', '车间B-3'] },
                'D011': { name: '注塑-03', type: '注塑机', locations: ['车间B-1', '车间B-2', '车间B-3'] },
                'D012': { name: '注塑-04', type: '注塑机', locations: ['车间B-1', '车间B-2', '车间B-3'] },
                'D013': { name: '注塑-05', type: '注塑机', locations: ['车间B-1', '车间B-2', '车间B-3'] },
                'D014': { name: '注塑-06', type: '注塑机', locations: ['车间B-1', '车间B-2', '车间B-3'] },
                'D015': { name: '注塑-07', type: '注塑机', locations: ['车间B-1', '车间B-2', '车间B-3'] },
                'D016': { name: '注塑-08', type: '注塑机', locations: ['车间B-1', '车间B-2', '车间B-3'] },
                'D017': { name: '冲压-01', type: '冲压机', locations: ['车间C-1', '车间C-2', '车间C-3'] },
                'D018': { name: '冲压-02', type: '冲压机', locations: ['车间C-1', '车间C-2', '车间C-3'] },
                'D019': { name: '冲压-03', type: '冲压机', locations: ['车间C-1', '车间C-2', '车间C-3'] },
                'D020': { name: '冲压-04', type: '冲压机', locations: ['车间C-1', '车间C-2', '车间C-3'] },
                'D021': { name: '冲压-05', type: '冲压机', locations: ['车间C-1', '车间C-2', '车间C-3'] },
                'D022': { name: '冲压-06', type: '冲压机', locations: ['车间C-1', '车间C-2', '车间C-3'] },
                'D023': { name: '冲压-07', type: '冲压机', locations: ['车间C-1', '车间C-2', '车间C-3'] },
                'D024': { name: '冲压-08', type: '冲压机', locations: ['车间C-1', '车间C-2', '车间C-3'] },
                'D025': { name: '焊接-01', type: '焊接机器人', locations: ['车间D-1', '车间D-2', '车间D-3'] },
                'D026': { name: '焊接-02', type: '焊接机器人', locations: ['车间D-1', '车间D-2', '车间D-3'] },
                'D027': { name: '焊接-03', type: '焊接机器人', locations: ['车间D-1', '车间D-2', '车间D-3'] },
                'D028': { name: '焊接-04', type: '焊接机器人', locations: ['车间D-1', '车间D-2', '车间D-3'] },
                'D029': { name: '焊接-05', type: '焊接机器人', locations: ['车间D-1', '车间D-2', '车间D-3'] },
                'D030': { name: '焊接-06', type: '焊接机器人', locations: ['车间D-1', '车间D-2', '车间D-3'] },
                'D031': { name: '焊接-07', type: '焊接机器人', locations: ['车间D-1', '车间D-2', '车间D-3'] },
                'D032': { name: '焊接-08', type: '焊接机器人', locations: ['车间D-1', '车间D-2', '车间D-3'] },
                'D033': { name: '装配-01', type: '装配线', locations: ['车间E-1', '车间E-2', '车间E-3'] },
                'D034': { name: '装配-02', type: '装配线', locations: ['车间E-1', '车间E-2', '车间E-3'] },
                'D035': { name: '装配-03', type: '装配线', locations: ['车间E-1', '车间E-2', '车间E-3'] },
                'D036': { name: '装配-04', type: '装配线', locations: ['车间E-1', '车间E-2', '车间E-3'] },
                'D037': { name: '装配-05', type: '装配线', locations: ['车间E-1', '车间E-2', '车间E-3'] },
                'D038': { name: '装配-06', type: '装配线', locations: ['车间E-1', '车间E-2', '车间E-3'] },
                'D039': { name: '装配-07', type: '装配线', locations: ['车间E-1', '车间E-2', '车间E-3'] },
                'D040': { name: '装配-08', type: '装配线', locations: ['车间E-1', '车间E-2', '车间E-3'] },
            }

            const statusPool = ['online', 'online', 'warning', 'warning', 'error', 'offline']

            const errorPool = {
                'CNC机床': [
                    { errorCode: 'E-301', errorDesc: '主轴温度过高' },
                    { errorCode: 'E-302', errorDesc: '伺服电机过载' },
                    { errorCode: 'W-301', errorDesc: '刀具磨损预警' },
                    { errorCode: 'E-303', errorDesc: '冷却系统故障' },
                ],
                '注塑机': [
                    { errorCode: 'W-102', errorDesc: '液压油压力异常' },
                    { errorCode: 'E-103', errorDesc: '加热圈烧毁' },
                    { errorCode: 'W-104', errorDesc: '原料干燥度不足' },
                    { errorCode: 'E-105', errorDesc: '螺杆卡死' },
                ],
                '冲压机': [
                    { errorCode: 'E-205', errorDesc: '模具卡死' },
                    { errorCode: 'W-202', errorDesc: '冲压力度偏差' },
                    { errorCode: 'E-206', errorDesc: '离合器失灵' },
                    { errorCode: 'W-203', errorDesc: '润滑系统油位低' },
                ],
                '焊接机器人': [
                    { errorCode: 'W-308', errorDesc: '焊丝送丝不畅' },
                    { errorCode: 'E-309', errorDesc: '焊接电流异常' },
                    { errorCode: 'W-310', errorDesc: '保护气流量不足' },
                    { errorCode: 'E-311', errorDesc: '焊枪堵塞' },
                ],
                '装配线': [
                    { errorCode: 'E-110', errorDesc: '传送带偏移' },
                    { errorCode: 'W-111', errorDesc: '定位精度下降' },
                    { errorCode: 'E-112', errorDesc: '气动夹爪失效' },
                    { errorCode: 'W-113', errorDesc: '节拍超时' },
                ],
            }

            const handleStatusMap = {
                'online': ['已完成', '已恢复'],
                'warning': ['监控中', '已通知'],
                'error': ['处理中', '待维修', '待备件'],
                'offline': ['已停机', '待检修'],
            }

            const durationPool = ['10分钟', '25分钟', '45分钟', '1小时', '1小时30分', '2小时', '2小时15分', '3小时', '4小时', '30分钟']

            const priorityMap = {
                'online': 'low',
                'warning': ['low', 'medium'],
                'error': ['medium', 'high'],
                'offline': 'high',
            }

            const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)]

            const randomTime = (index) => {
                const month = Math.floor(Math.random() * 6) + 1
                const day = Math.floor(Math.random() * 28) + 1
                const baseHour = 6 + index * 2 + Math.floor(Math.random() * 2)
                const hour = baseHour % 24
                const minute = Math.floor(Math.random() * 60)
                const second = Math.floor(Math.random() * 60)
                return `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
            }

            const deviceId = body.deviceId

            const info = deviceInfoMap[deviceId]
            if (!info) {
                return { code: 404, message: '设备不存在', data: null }
            }

            const shuffledStatuses = [...statusPool].sort(() => Math.random() - 0.5).slice(0, 6)

            const historyList = shuffledStatuses.map((status, index) => {
                const record = {
                    id: `${deviceId}-${index + 1}`,
                    deviceId: deviceId,
                    name: info.name,
                    deviceType: info.type,
                    status,
                    location: randomPick(info.locations),
                    startTime: randomTime(index),
                    duration: randomPick(durationPool),
                    handleStatus: randomPick(handleStatusMap[status]),
                    priority: Array.isArray(priorityMap[status]) ? randomPick(priorityMap[status]) : priorityMap[status],
                }

                if (status === 'error' || status === 'warning') {
                    const fault = randomPick(errorPool[info.type])
                    record.errorCode = fault.errorCode
                    record.errorDesc = fault.errorDesc
                }

                return record
            })

            historyList.sort((a, b) => a.startTime.localeCompare(b.startTime))

            return {
                code: 200,
                message: 'success',
                data: {
                    deviceHistory: historyList
                }
            }
        }
    },
]
