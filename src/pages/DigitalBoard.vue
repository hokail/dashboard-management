<template>
  <div class="digital-board-wrapper">
    <div class="tech-header">
      <div class="header-left">
        <div class="logo-icon">⚙️</div>
        <div class="title-group">
          <h1 class="main-title">智能设备监控中心</h1>
          <p class="sub-title">Digital Twin Monitoring System</p>
        </div>
      </div>

      <div class="header-center">
        <div class="time-display">
          <span class="time-icon">🕐</span>
          <span class="current-time">{{ currentTime }}</span>
        </div>
      </div>

      <div class="header-right">
        <div class="stats-item">
          <span class="stats-label">设备总数</span>
          <span class="stats-value primary">{{ deviceList.length || 0 }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">在线</span>
          <span class="stats-value online">{{ onlineCount }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">告警</span>
          <span class="stats-value alarm">{{ alarmCount }}</span>
        </div>
        <a-button @click="handleBack" class="back-btn" >
          ← 返回2D
        </a-button>
      </div>
    </div>

    <div ref="container" class="three-container"></div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, toRefs, watch, computed} from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {boardStore} from "../stores/board.js";
import {storeToRefs} from "pinia";

const props = defineProps({
  deviceList: Array,
  alarmList: Array
})

const emit = defineEmits(['update:showDigitalBoard'])

const {deviceList, alarmList} = toRefs(props)

const container = ref(null)
const currentTime = ref(new Date().toLocaleString('zh-CN'))

let scene, camera, renderer, controls
let container_mesh
let renderList = []
let timeInterval = null

const onlineCount = computed(() => {
  return deviceList.value.filter(d => d.status === 'online').length || 0
})

const alarmCount = computed(() => {
  return deviceList.value.filter(d => d.status === 'error' || d.status === 'warning').length || 0
})

function handleBack() {
  emit('update:showDigitalBoard', false)
}

onMounted(() => {
  init()
  animate()

  timeInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleString('zh-CN')
  }, 1000)
})

onUnmounted(() => {
  cleanup()
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

async function init() {
  // 1. 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0e27)

  // 2. 创建相机
  camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
  )
  camera.position.set(12.5, 10, 17.5)

  // 3. 创建渲染器
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.value.appendChild(renderer.domElement)

  // 4. 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.target.set(12.5, 0, 7.5)

  // 5. 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 20, 10)
  scene.add(directionalLight)

  // 6. 创建透明容器（长方体）
  const containerWidth = 25
  const containerHeight = 1
  const containerDepth = 15

  // 创建透明材质
  const transparentMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0066ff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,

  })

  // 创建顶部透明材质（完全透明）
  const invisibleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0066ff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false
  })

  // 创建一个长方体作为容器（6个面使用不同材质）
  // BoxGeometry 的面顺序：右、左、上、下、前、后
  const containerGeometry = new THREE.BoxGeometry(containerWidth, containerHeight, containerDepth)

  // 为每个面指定材质索引
  const materials = [
    transparentMaterial,  // 右面
    transparentMaterial,  // 左面
    invisibleMaterial,    // 顶面（透明）
    transparentMaterial,  // 底面（地面）
    transparentMaterial,  // 前面
    transparentMaterial   // 后面
  ]

  const containerMesh = new THREE.Mesh(containerGeometry, materials)
  containerMesh.position.set(containerWidth / 2, containerHeight / 2, containerDepth / 2)
  scene.add(containerMesh)

  //添加网格（同步移动）
  const gridHelper = new THREE.GridHelper(containerWidth, containerWidth , 0x0044aa, 0x0044aa)
  gridHelper.position.set(containerWidth / 2, 0.01, containerDepth / 2)
  gridHelper.scale.z = containerDepth / containerWidth
  scene.add(gridHelper)

  // 添加墙的边框线（同步移动）
  const edgesGeometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(containerWidth, containerHeight, containerDepth)
  )
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.6
  })
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
  edges.position.set(containerWidth / 2, containerHeight / 2, containerDepth / 2)
  scene.add(edges)

  // 7. 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

function renderDeviceList(){

  renderList.forEach(mesh => {
    scene.remove(mesh)
  })
  renderList = []

  deviceList.value.forEach(device => {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshPhysicalMaterial({
          color: device.status === 'online' ? 0x00ff00 : 0xff0000,
          transparent: false,
          opacity: 1,
          side: THREE.DoubleSide,
          roughness: 0.1,
          metalness: 0.1,
        })
    )

    mesh.deviceData = {
      id: device.id,
      name: device.name,
      status: device.status,
      type: device.type,
      originalX: device.x,
      originalY: device.y,
    }

    mesh.position.set(device.x *25/8 + 1.5, 1, device.y * 15/5 + 1.5)

    scene.add(mesh)
    renderList.push(mesh)
  })
}

function updateAlarmDevice(){
  alarmList.value.forEach(alarm => {
    const mesh = renderList.find(mesh => mesh.deviceData.id === alarm.id)
    if (mesh) {
      if(alarm.status === 'online'){
        mesh.material.color.set(0x00ff00)
      }else if(alarm.status === 'warning'){
        mesh.material.color.set(0xffff00)
      }else if(alarm.status === 'error'){
        mesh.material.color.set(0xff0000)
      }
    }
  })
}

watch( deviceList,()=>{
  renderDeviceList()
})

watch(alarmList,()=>{
  updateAlarmDevice()
},{deep: true})

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function cleanup() {
  window.removeEventListener('resize', handleResize)

  if (renderer) {
    renderer.dispose()
    container.value.removeChild(renderer.domElement)
  }

  // 清理场景资源
  scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose()
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(m => m.dispose())
      } else {
        object.material.dispose()
      }
    }
  })
}
</script>

<style scoped>
.digital-board-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.tech-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 30px;
  background: linear-gradient(180deg,
    rgba(10, 14, 39, 0.95) 0%,
    rgba(10, 14, 39, 0.7) 60%,
    transparent 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 170, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 170, 255, 0.15);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  font-size: 32px;
  animation: rotate 10s linear infinite;
  filter: drop-shadow(0 0 10px rgba(0, 170, 255, 0.8));
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.main-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #00aaff 0%, #0066ff 50%, #00ccff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(0, 170, 255, 0.5);
  letter-spacing: 2px;
}

.sub-title {
  font-size: 11px;
  color: rgba(0, 204, 255, 0.7);
  margin: 0;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.header-center {
  display: flex;
  align-items: center;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(0, 170, 255, 0.1);
  border: 1px solid rgba(0, 170, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 170, 255, 0.2),
              inset 0 0 15px rgba(0, 170, 255, 0.05);
}

.time-icon {
  font-size: 18px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.current-time {
  font-size: 14px;
  color: #00ccff;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 170, 255, 0.2);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.stats-item:hover {
  background: rgba(0, 170, 255, 0.1);
  border-color: rgba(0, 170, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 170, 255, 0.3);
  transform: translateY(-2px);
}

.stats-label {
  font-size: 10px;
  color: rgba(0, 204, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stats-value {
  font-size: 20px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.stats-value.primary {
  color: #00aaff;
  text-shadow: 0 0 10px rgba(0, 170, 255, 0.8);
}

.stats-value.online {
  color: #00ff00;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
}

.stats-value.alarm {
  color: #ff4d4f;
  text-shadow: 0 0 10px rgba(255, 77, 79, 0.8);
  animation: blink 1.5s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.back-btn {
  background: linear-gradient(135deg, rgba(0, 170, 255, 0.2) 0%, rgba(0, 102, 255, 0.2) 100%);
  border: 1px solid rgba(0, 170, 255, 0.5);
  color: #00ccff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 1px;
}

.back-btn:hover {
  background: linear-gradient(135deg, rgba(0, 170, 255, 0.4) 0%, rgba(0, 102, 255, 0.4) 100%);
  border-color: #00ccff;
  box-shadow: 0 0 20px rgba(0, 170, 255, 0.5);
  transform: translateX(-3px);
}

.three-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
}
</style>
