export default [
    {
        url: '/api/report/getAlarmList',
        method: 'get',
        response: () => {
            return {
                code: 200,
                message: 'success',
                data: {
                    alarmList: [
                        { alarmId: '1', id: 'D003', name: 'CNC-03', deviceType: 'CNC机床', status: 'error', errorCode: 'E-301', errorDesc: '主轴温度过高', location: '车间A-3', startTime: '08:20:15', duration: '2小时15分', handleStatus: '处理中', priority: 'high' },
                        { alarmId: '2', id: 'D013', name: '注塑-05', deviceType: '注塑机', status: 'error', errorCode: 'W-102', errorDesc: '液压油压力异常', location: '车间B-7', startTime: '09:05:30', duration: '45分钟', handleStatus: '待维修', priority: 'high' },
                        { alarmId: '3', id: 'D023', name: '冲压-07', deviceType: '冲压机', status: 'error', errorCode: 'E-205', errorDesc: '模具卡死', location: '车间A-9', startTime: '10:15:20', duration: '1小时30分', handleStatus: '处理中', priority: 'medium' },
                        { alarmId: '4', id: 'D035', name: '装配-03', deviceType: '装配线', status: 'error', errorCode: 'E-110', errorDesc: '传送带偏移', location: '车间B-4', startTime: '07:35:45', duration: '3小时', handleStatus: '待备件', priority: 'medium' },
                        { alarmId: '5', id: 'D011', name: '注塑-03', deviceType: '注塑机', status: 'warning', errorCode: 'W-201', errorDesc: '包装材料不足', location: '车间C-5', startTime: '10:30:10', duration: '15分钟', handleStatus: '监控中', priority: 'low' },
                        { alarmId: '6', id: 'D027', name: '焊接-03', deviceType: '焊接机器人', status: 'warning', errorCode: 'W-308', errorDesc: '焊丝送丝不畅', location: '车间C-2', startTime: '10:35:25', duration: '20分钟', handleStatus: '监控中', priority: 'low' }
                    ]
                }
            }
        }
    },
    {
        url: '/api/report/sendDispatch',
        method: 'post',
        response: ({ body }) => {
            const { list } = body
            if (list[0]) {
                return {
                    code: 200,
                    message: '登录成功',
                    data: {
                        dispatchList: list.map(e =>{
                            return {
                                ...e,
                                status: 'dispatched',
                            }
                        })
                    }
                }
            } else {
                return {
                    code: 401,
                    message: '派单数据错误',
                    data: null
                }
            }
        }
    },
]