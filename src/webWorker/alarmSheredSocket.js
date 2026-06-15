import {useWebSocket} from "../websocket/index.js";

let ws = null

function connectWebSocket() {
    ws = useWebSocket()

    ws.onOpen(() => {
        console.log('✅ WebSocket 连接成功')
    })

    ws.onMessage((event) => {
        try {
            const message = JSON.parse(event.data)

            if (message.type === 'device-status') {
                const updates = Array.isArray(message.data) ? message.data : [message.data]

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
    })

    ws.onClose(() => {

        console.log('❌ WebSocket 连接关闭')
    })

    ws.onError((error) => {
        console.error('WebSocket 错误:', error)
    })

    ws.onReconnect((attempts) => {

        console.log(`🔄 第 ${attempts} 次重连`)
    })

    ws.connect()
}