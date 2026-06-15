import { ref } from 'vue'

const WS_URL = import.meta.env.DEV && import.meta.env.VITE_USE_WEBSOCKET_MOCK === 'true'
    ? 'ws://localhost:8080'
    : import.meta.env.VITE_WS_URL || 'ws://your-production-ws-server.com'

class HeartbeatWebSocket {
  constructor(url = WS_URL, options = {}) {
    this.url = url
    this.ws = null
    this.heartbeatTimer = null
    this.reconnectTimer = null

    this.heartbeatInterval = options.heartbeatInterval || 30000
    this.reconnectInterval = options.reconnectInterval || 5000
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10
    this.heartbeatTimeout = options.heartbeatTimeout || 10000

    this.isConnected = false
    this.reconnectAttempts = 0
    this.isManualClose = false
    this.heartbeatPongReceived = true

    this.onMessageCallback = null
    this.onOpenCallback = null
    this.onCloseCallback = null
    this.onErrorCallback = null
    this.onReconnectCallback = null
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      console.warn('WebSocket 已连接或正在连接中')
      return
    }

    this.isManualClose = false

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = (event) => {
        console.log('WebSocket 连接成功')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.startHeartbeat()

        if (this.onOpenCallback) {
          this.onOpenCallback(event)
        }
      }

      this.ws.onmessage = (event) => {
        const data = event.data

        if (data === 'pong' || data === '{"type":"pong"}') {
          this.heartbeatPongReceived = true
          return
        }

        if (this.onMessageCallback) {
          this.onMessageCallback(event)
        }
      }

      this.ws.onclose = (event) => {
        console.log('WebSocket 连接关闭', event.code, event.reason)
        this.isConnected = false
        this.stopHeartbeat()

        if (this.onCloseCallback) {
          this.onCloseCallback(event)
        }

        if (!this.isManualClose) {
          this.attemptReconnect()
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket 错误', error)

        if (this.onErrorCallback) {
          this.onErrorCallback(error)
        }
      }
    } catch (error) {
      console.error('WebSocket 连接失败', error)
      this.attemptReconnect()
    }
  }

  startHeartbeat() {
    this.stopHeartbeat()

    this.heartbeatTimer = setInterval(() => {
      if (!this.isConnected) {
        this.stopHeartbeat()
        return
      }

      if (!this.heartbeatPongReceived) {
        console.warn('心跳超时，未收到服务端响应')
        this.ws.close()
        return
      }

      this.heartbeatPongReceived = false
      this.sendHeartbeat()
    }, this.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  sendHeartbeat() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const heartbeatData = JSON.stringify({ type: 'ping', timestamp: Date.now() })
      this.ws.send(heartbeatData)
    }
  }

  attemptReconnect() {
    if (this.isManualClose) {
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('达到最大重连次数，停止重连')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectInterval * Math.pow(2, Math.min(this.reconnectAttempts - 1, 5))

    console.log(`准备第 ${this.reconnectAttempts} 次重连，${Math.round(delay / 1000)} 秒后重试...`)

    this.reconnectTimer = setTimeout(() => {
      if (this.onReconnectCallback) {
        this.onReconnectCallback(this.reconnectAttempts)
      }
      this.connect()
    }, delay)
  }

  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket 未连接，无法发送消息')
      return false
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      this.ws.send(message)
      return true
    } catch (error) {
      console.error('发送消息失败', error)
      return false
    }
  }

  close() {
    this.isManualClose = true
    this.stopHeartbeat()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  getState() {
    if (!this.ws) return 'CLOSED'

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING'
      case WebSocket.OPEN:
        return 'OPEN'
      case WebSocket.CLOSING:
        return 'CLOSING'
      case WebSocket.CLOSED:
        return 'CLOSED'
      default:
        return 'UNKNOWN'
    }
  }

  onMessage(callback) {
    this.onMessageCallback = callback
    return this
  }

  onOpen(callback) {
    this.onOpenCallback = callback
    return this
  }

  onClose(callback) {
    this.onCloseCallback = callback
    return this
  }

  onError(callback) {
    this.onErrorCallback = callback
    return this
  }

  onReconnect(callback) {
    this.onReconnectCallback = callback
    return this
  }
}

let wsInstance = null

export function useWebSocket(url = WS_URL, options = {}) {
  if (!wsInstance) {
    wsInstance = new HeartbeatWebSocket(url, options)
  }
  return wsInstance
}

//导出类，方便创造多个ws实例，开启多个ws连接
export { HeartbeatWebSocket }
