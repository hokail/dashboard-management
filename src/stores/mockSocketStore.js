// board和dispatch公用的socket
// 在app中创建单个socket实例，在board和dispatch中分别使用addMessage添加消息监听

import {useWebSocket} from "../websocket/index.js";
import {defineStore} from "pinia";
import {ref} from 'vue'

export const socketStore = defineStore('socket', () =>{
    let ws = ref( null)
    let onMessageList = ref(new Map())
    function connectWebSocket() {
        if( !ws.value){
            ws.value = useWebSocket()

            ws.value.onOpen(() => {
                console.log('✅ WebSocket 连接成功')
            })

            ws.value.onMessage((event) => {
                try {
                    console.log('✅ WebSocket 消息获取成功')
                    onMessageList.value.forEach((callback,key) => {
                        callback(event)
                    })
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

            ws.value.onReconnect((attempts) => {

                console.log(`🔄 第 ${attempts} 次重连`)
            })

            ws.value.connect()
        }

    }

    function addOnMessage(key,callback){
        onMessageList.value.set(key,callback)
    }

    function removeOnMessage(key){
        onMessageList.value.delete(key)
    }

    function closeWebSocket(){
        if( ws.value){
            ws.value.close()
            ws.value = null
        }
    }

    return {
        connectWebSocket,
        closeWebSocket,
        addOnMessage,
        removeOnMessage,
    }

})


