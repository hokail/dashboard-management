/**
 * Mock WebSocket 服务器
 * 使用 mock-socket 库模拟真实的 WebSocket 服务端
 * 用于开发和测试环境，提供设备实时状态数据推送
 */

import { Server } from 'mock-socket'


const errorCodes = [
    { code: 'E-301', desc: '主轴温度过高' },
    { code: 'E-205', desc: '模具卡死' },
    { code: 'E-110', desc: '传送带偏移' },
    { code: 'E-402', desc: '刀片磨损严重' },
    { code: 'W-102', desc: '液压油压力异常' },
    { code: 'W-308', desc: '焊丝送丝不畅' },
    { code: 'W-201', desc: '包装材料不足' },
    { code: 'E-501', desc: '电机过载' },
    { code: 'E-603', desc: '传感器失灵' },
    { code: 'W-405', desc: '冷却液不足' }
]

class MockWebSocketServer {
    /**
     * 构造函数
     * @param {string} url - WebSocket 服务器地址，默认 ws://localhost:8080
     */
    constructor(url = 'ws://localhost:8080') {
        this.url = url
        this.server = null
        this.clients = new Set()

        // 模拟设备数据列表
        this.devices = [
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
        ]

        this.pushTimer = null
    }

    /**
     * 启动 Mock WebSocket 服务器
     * 创建服务器实例并监听连接事件
     */
    start() {
        if (this.server) {
            console.warn('Mock WebSocket 服务器已在运行')
            return
        }

        // 创建 WebSocket 服务器实例
        this.server = new Server(this.url)
        console.log(`✅ Mock WebSocket 服务器启动: ${this.url}`)

        // 监听客户端连接事件
        this.server.on('connection', (socket) => {
            this.handleConnection(socket)
        })
    }

    /**
     * 处理客户端连接
     * 发送初始数据、启动定时推送、注册消息和断开连接处理器
     * @param {Object} socket - WebSocket 套接字对象
     */
    handleConnection(socket) {
        const clientId = Date.now()
        console.log(`🔗 客户端 ${clientId} 已连接`)

        // 将客户端添加到集合中管理
        this.clients.add(socket)

        // 发送初始设备数据
        this.sendInitialData(socket)

        // 启动定时数据推送
        this.startPushingData(socket)

        // 注册消息接收处理器
        socket.on('message', (data) => {
            this.handleMessage(socket, data, clientId)
        })

        // 注册断开连接处理器
        socket.on('close', () => {
            console.log(`❌ 客户端 ${clientId} 已断开`)
            this.clients.delete(socket)
            this.stopPushingData(socket)
        })
    }

    /**
     * 发送初始设备数据给客户端
     * 包含所有设备的当前状态和统计信息
     * @param {Object} socket - WebSocket 套接字对象
     */
    sendInitialData(socket) {
        const message = JSON.stringify({
            type: 'init',
            timestamp: Date.now(),
            data: {
                total: this.devices.length,
                online: this.devices.filter(d => d.status === 'online').length,
                offline: this.devices.filter(d => d.status === 'offline').length,
                warning: this.devices.filter(d => d.status === 'warning').length,
                devices: JSON.parse(JSON.stringify(this.devices))
            }
        })

        socket.send(message)
        console.log('📤 已发送初始设备数据')
    }

    /**
     * 启动定时数据推送
     * 每 3 秒向客户端推送一次设备状态更新
     * @param {Object} socket - WebSocket 套接字对象
     */
    startPushingData(socket) {
        console.log('🚀 启动定时数据推送')
        // 设置定时器，每 3 秒推送一次
        const timer = setInterval(() => {
            this.pushDeviceUpdate(socket)
        }, 3000)

        // 将定时器保存到 socket 对象上，方便后续清理
        socket._pushTimer = timer
    }

    /**
     * 停止数据推送
     * 清除定时器，释放资源
     * @param {Object} socket - WebSocket 套接字对象
     */
    stopPushingData(socket) {
        if (socket._pushTimer) {
            clearInterval(socket._pushTimer)
            socket._pushTimer = null
        }
    }

    /**
     * 推送设备状态更新
     * 随机选择 1-3 个在线设备，模拟数值波动和状态变化
     * @param {Object} socket - WebSocket 套接字对象
     */
    pushDeviceUpdate(socket) {
        // 随机决定本次更新的设备数量（1-3 个）
        const updateCount = Math.floor(Math.random() * 3) + 1
        const updatedDevices = []

        for (let i = 0; i < updateCount; i++) {
            const deviceIndex = Math.floor(Math.random() * this.devices.length)
            const device = this.devices[deviceIndex]

            // 跳过离线设备，不推送其更新
            if (device.status === 'offline') continue


            // 小概率（5%）改变设备状态：在线/警告之间切换
            // if (Math.random() < 0.05) {
                const statuses = ['warning', 'error','online']
                device.status = statuses[Math.floor(Math.random() * statuses.length)]
                if (device.status === 'error' || device.status === 'warning') {
                    const randomFault = errorCodes[Math.floor(Math.random() * errorCodes.length)]
                    device.errorCode = randomFault.code
                    device.errorDesc = randomFault.desc
                    const now = new Date()
                    const hours = String(now.getHours()).padStart(2, '0')
                    const minutes = String(now.getMinutes()).padStart(2, '0')
                    const seconds = String(now.getSeconds()).padStart(2, '0')
                    device.startTime = `${hours}:${minutes}:${seconds}`
                    device.location = `车间${device.x}-${device.y}`
                } else {
                    // 如果状态恢复正常，清除错误信息
                    delete device.errorCode
                    delete device.errorDesc
                    delete device.startTime
                }
            // }

            // 深拷贝设备对象，避免引用问题
            updatedDevices.push(JSON.parse(JSON.stringify(device)))
        }

        // 如果有更新的设备，则推送给客户端
        if (updatedDevices.length > 0) {
            const message = JSON.stringify({
                type: 'device-status',
                timestamp: Date.now(),
                data: updatedDevices
            })

            try {
                socket.send(message)
            } catch (error) {
                console.error('发送消息失败:', error)
            }
        }
    }

    /**
     * 处理客户端发送的消息
     * 支持心跳响应、订阅/取消订阅等功能
     * @param {Object} socket - WebSocket 套接字对象
     * @param {*} data - 接收到的消息数据
     * @param {number} clientId - 客户端 ID
     */
    handleMessage(socket, data, clientId) {
        try {
            const message = JSON.parse(data)

            // 处理心跳请求：响应 pong
            if (message.type === 'ping') {
                socket.send(JSON.stringify({
                    type: 'pong',
                    timestamp: Date.now()
                }))
                return
            }

            // 其他消息类型，打印日志
            console.log(`收到客户端 ${clientId} 消息:`, message)
        } catch (error) {
            // 非 JSON 格式消息，直接打印原始内容
            console.log(`收到原始消息:`, data)
        }
    }

    /**
     * 停止 Mock WebSocket 服务器
     * 清理所有客户端连接、定时器和服务器资源
     */
    stop() {
        if (this.server) {
            // 清理所有客户端的定时器
            this.clients.forEach(socket => {
                this.stopPushingData(socket)
            })

            // 停止服务器
            this.server.stop()
            this.server = null
            this.clients.clear()

            console.log('🛑 Mock WebSocket 服务器已停止')
        }
    }
}

// 创建单例实例，确保整个应用只有一个 Mock 服务器
let mockServerInstance = null

/**
 * 创建或获取 Mock WebSocket 服务器单例
 * @param {string} url - WebSocket 服务器地址
 * @returns {MockWebSocketServer} MockWebSocketServer 实例
 */
export function createMockServer(url = 'ws://localhost:8080') {
    if (!mockServerInstance) {
        mockServerInstance = new MockWebSocketServer(url)
    }
    return mockServerInstance
}

export default MockWebSocketServer
