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
          <span class="stats-label">离线</span>
          <span class="stats-value offline">{{ offlineCount }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">报警</span>
          <span class="stats-value alarm">{{ alarmCount }}</span>
        </div>
        <a-button @click="handleBack" class="back-btn" >
          返回2D
        </a-button>
      </div>
    </div>

    <div v-if="hoveredDevice" class="device-tooltip" :style="{ left: tooltipPosition.x + 15 + 'px', top: tooltipPosition.y + 15 + 'px' }">
      <div class="tooltip-title">{{ hoveredDevice.name }}</div>
      <div class="tooltip-info">
        <div class="info-row">
          <span class="label">ID:</span>
          <span class="value">{{ hoveredDevice.id }}</span>
        </div>
        <div class="info-row">
          <span class="label">类型:</span>
          <span class="value">{{ hoveredDevice.type }}</span>
        </div>
        <div class="info-row">
          <span class="label">状态:</span>
          <span class="value" :class="hoveredDevice.status">{{ getStatusText(hoveredDevice.status) }}</span>
        </div>
      </div>
    </div>

    <div v-if="selectedDevice" class="device-detail-panel">
      <div class="panel-header">
        <h3>{{ selectedDevice.name }}</h3>
        <button @click="selectedDevice = null" class="close-btn">×</button>
      </div>
      <div class="panel-content">
        <div class="detail-item">
          <span class="detail-label">设备编号</span>
          <span class="detail-value">{{ selectedDevice.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">设备类型</span>
          <span class="detail-value">{{ selectedDevice.type }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">运行状态</span>
          <span class="detail-value status-badge" :class="selectedDevice.status">
            {{ getStatusText(selectedDevice.status) }}
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">位置坐标</span>
          <span class="detail-value">({{ selectedDevice.originalX }}, {{ selectedDevice.originalY }})</span>
        </div>
      </div>
    </div>

    <div ref="container" class="three-container"></div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, toRefs, watch, computed} from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import CursorControl from '../three/cursorControl.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';



const props = defineProps({
  deviceList: Array,
  updateList: Array
})

const emit = defineEmits(['update:showDigitalBoard'])

const {deviceList, updateList} = toRefs(props)

const container = ref(null)
const currentTime = ref(new Date().toLocaleString('zh-CN'))

let scene, camera, renderer, controls,composer
let container_mesh
let renderList = []
let timeInterval = null
let cursorControl = null

const hoveredDevice = ref(null)
const selectedDevice = ref(null)
const tooltipPosition = ref({ x: 0, y: 0 })

// 创建一个时钟用于获取精确时间
const clock = new THREE.Clock();

// 模拟呼吸灯的参数（默认值）
const breathParams = {
  speedOfWarning: 10,        // 呼吸速度
  speedOfError: 15,        // 呼吸速度
  minIntensity: 3.5, // 最暗时的强度（必须高于阈值 0.85，否则辉光会消失）
  maxIntensity: 6.5, // 最亮时的强度
};

const onlineCount = computed(() => {
  return deviceList.value.filter(d => d.status === 'online').length || 0
})

const offlineCount = computed(() => {
  return deviceList.value.filter(d => d.status === 'offline').length || 0
})

const alarmCount = computed(() => {
  return deviceList.value.filter(d => d.status === 'error' || d.status === 'warning' ).length || 0
})

function handleBack() {
  emit('update:showDigitalBoard', false)
}

//设备状态颜色
function getStatusColor(status){
  switch (status) {
    case  'online':
      return 0x00ff88
    case 'warning':
      return 0xffff00
    case 'error':
      return 0xff0000
    case 'offline':
      return 0xffffff
    default:
      return 0xffffff
  }
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
  if (cursorControl) {
    cursorControl.dispose()
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

  renderer.toneMapping = THREE.ACESFilmicToneMapping; // 使用胶片色调映射，让高光更柔和
  renderer.toneMappingExposure = 1; // 控制整体曝光，保持画面明亮

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



  //设置辉光效果，原理：给物体设置自发光颜色和强度，UnrealBloomPass 会保留亮度值大于threshold的像素，所以让想要发光的物体的自发光强度大于threshold即可使该物体产生辉光效果
  //UnrealBloomPass不同颜色通过计算公式得出的值不同，因此可能需要设置不同的自发光强度，确保产生辉光效果
  composer = new EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);

  // 渲染通道（必须）
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 辉光通道（UnrealBloomPass）
  // 参数: (分辨率, strength, radius, threshold)
  const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.1,   // strength  - 辉光强度
      0.2,   // radius    - 辉光半径（扩散范围）
      0.5   // threshold - 亮度阈值（只有高于此值的像素发光）
  );
  composer.addPass(bloomPass);

  // 输出通道（色彩校正，保证显示正确）
  const outputPass = new OutputPass();
  composer.addPass(outputPass);
}

// 根据不同类型的设备，使用组合模型替代简单的正方体
function createMachineModel(type, status) {
  const group = new THREE.Group()

  const bodyColor = 0xffffff
  const lightColor = getStatusColor(status)
  const lightEmissiveIntensity = status === 'offline' ? 0 : 2.4

  // === 机台底座 ===
  const baseGeo = new THREE.BoxGeometry(2, 0.3, 1.8)
  const baseMat = new THREE.MeshPhysicalMaterial({
    color: 0x000000, metalness: 0.1, roughness: 0.1, emissive: 0x000000
  })
  const base = new THREE.Mesh(baseGeo, baseMat)
  base.position.y = 0.15
  group.add(base)

  // === 机身主体 ===
  const bodyGeo = new THREE.BoxGeometry(1.8, 1.2, 1.6)
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: bodyColor, metalness: 0.5, roughness: 0.4, emissive: 0x000000
  })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  body.position.y = 0.9
  group.add(body)

  // === 顶部结构（根据类型不同） ===
  if (type === 'CNC机床' || type === '冲压机') {

    const pillarGeo = new THREE.BoxGeometry(0.3, 1.0, 1.6)
    const pillarMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.6, roughness: 0.3,
    })
    const pillar = new THREE.Mesh(pillarGeo, pillarMat)
    pillar.position.set(0.75, 2.0, 0)
    group.add(pillar)

    // 横梁
    const beamGeo = new THREE.BoxGeometry(1.8, 0.25, 0.4)
    //材质不要使用同一个材质。否则在高亮操作时，修改A的材质变为高亮后，会导致B的“原始材质”一起变为高亮材质，导致B的原始材质丢失，无法重置高亮效果
    const beamMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.6, roughness: 0.3,
    })
    const beam = new THREE.Mesh(beamGeo, beamMat)
    beam.position.set(0, 1.75, 0)
    group.add(beam)
  } else if (type === '注塑机') {
    // 圆筒
    const barrelGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.6, 16)
    const barrelMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.7, roughness: 0.2,
    })
    const barrel = new THREE.Mesh(barrelGeo, barrelMat)
    barrel.rotation.z = Math.PI / 2
    barrel.position.set(0, 1.8, 0)
    group.add(barrel)
  } else if (type === '焊接机器人') {
    // 机械臂底座
    const armBaseGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.4, 16)
    const armBaseMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.7, roughness: 0.3,
    })
    const armBase = new THREE.Mesh(armBaseGeo, armBaseMat)
    armBase.position.set(0, 1.7, 0)
    group.add(armBase)

    // 机械臂第一段
    const arm1Geo = new THREE.BoxGeometry(0.25, 0.8, 0.25)
    const arm1Mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.7, roughness: 0.3,
    })
    const arm1 = new THREE.Mesh(arm1Geo, arm1Mat)
    arm1.position.set(0, 2.3, 0)
    group.add(arm1)

    // 机械臂第二段
    const arm2Geo = new THREE.BoxGeometry(0.8, 0.2, 0.2)
    const arm2Mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.7, roughness: 0.3,
    })
    const arm2 = new THREE.Mesh(arm2Geo, arm2Mat)
    arm2.position.set(0.3, 2.7, 0)
    group.add(arm2)
  } else {
    // 传送带结构
    const beltGeo = new THREE.BoxGeometry(2.2, 0.15, 0.8)
    const beltMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.3, roughness: 1, emissive: 0x000000
    })
    const belt = new THREE.Mesh(beltGeo, beltMat)
    belt.position.set(0, 1.55, 0)
    group.add(belt)
  }

  // === 操作面板（小屏幕） ===
  const screenGeo = new THREE.BoxGeometry(0.5, 0.4, 0.05)
  const screenMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0eff, emissive: 0x003366, emissiveIntensity: 5.5,
    metalness: 0.1, roughness: 0.1
  })
  const screen = new THREE.Mesh(screenGeo, screenMat)
  screen.position.set(0.5, 1.4, 0.82)
  group.add(screen)

  // === 状态指示灯 ===
  const lightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 16)
  //lightMat 将自发光强度设置成动态，模拟呼吸灯效果
  let lightMat = new THREE.MeshPhysicalMaterial({
    color: lightColor,
    emissive: lightColor,
    emissiveIntensity: lightEmissiveIntensity,//自发光强度
    roughness: 0.25,
    metalness: 0.4,
  })
  const lightMesh = new THREE.Mesh(lightGeo, lightMat)
  lightMesh.name = 'statusLight'
  lightMesh.position.set(-0.7, 1.7, -0.6)
  group.add(lightMesh)

  // === 指示灯底座 ===
  const lBaseGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16)
  const lBaseMat = new THREE.MeshPhysicalMaterial({
    color: 0x333333, metalness: 0.8, roughness: 0.2, emissive: 0x000000
  })
  const lBase = new THREE.Mesh(lBaseGeo, lBaseMat)
  lBase.position.set(-0.7, 1.53, -0.6)
  group.add(lBase)

  return group
}

function renderDeviceList(){

  renderList.forEach(mesh => {
    scene.remove(mesh)
  })
  renderList = []

  deviceList.value.forEach(device => {

    const mesh = createMachineModel(device.type, device.status)

    mesh.deviceData = {
      id: device.id,
      name: device.name,
      status: device.status,
      type: device.type,
      originalX: device.x,
      originalY: device.y,
    }

    mesh.position.set(device.x * 25 / 8 + 1.5, 0, device.y * 15 / 5 + 1.5)

    scene.add(mesh)
    renderList.push(mesh)
  })
}

function updateAlarmDevice(){
  updateList.value.forEach(device => {
    const mesh = renderList.find(mesh => mesh.deviceData.id === device.id)
    mesh.deviceData = {
      ...mesh.deviceData,
      status: device.status,

    }
    if (mesh) {
      const statusLight = mesh.getObjectByName('statusLight')
      statusLight.material.color.set(getStatusColor(device.status))
      statusLight.material.emissive.set(getStatusColor(device.status))
    }
  })
}


watch( deviceList,()=>{
  renderDeviceList()
  if (cursorControl) {
    cursorControl.dispose()
  }

  cursorControl = new CursorControl(camera, renderer, scene, renderList)

  cursorControl.addClickCallbacks( () => {
    selectedDevice.value = cursorControl.selectedModel.deviceData
  })

})

watch(updateList,()=>{
  updateAlarmDevice()
},{deep: true})

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)

  composer.render();

  // 获取从页面加载开始的总秒数
  const elapsedTime = clock.getElapsedTime();

  // ----- 核心呼吸算法 -----
  // 使用正弦波生成 -1 ~ 1 的值，再映射到 0 ~ 1 之间
  // 公式: (Math.sin(time * speed) + 1) / 2
  // 然后映射到 [minIntensity, maxIntensity] 区间
  // 将计算出的强度赋值给材质
  const tWarning = (Math.sin(elapsedTime * breathParams.speedOfWarning) + 1) / 2;
  const tError = (Math.sin(elapsedTime * breathParams.speedOfError) + 1) / 2;
  renderList.forEach(e=>{
    if(e.deviceData.status === 'warning' || e.deviceData.status === 'error'){
      const t = e.deviceData.status === 'warning' ? tWarning : tError
      const statusLight = e.getObjectByName('statusLight')
      statusLight.material.emissiveIntensity = breathParams.minIntensity + t * (breathParams.maxIntensity - breathParams.minIntensity);
    }
  })
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

function getStatusText(status) {
  const statusMap = {
    online: '在线',
    offline: '离线',
    warning: '警告',
    error: '故障'
  }
  return statusMap[status] || '未知'
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

.stats-value.offline {
  color: #828282;
  text-shadow: 0 0 10px rgba(156, 156, 156, 0.8);

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

.device-tooltip {
  position: fixed;
  z-index: 1000;
  background: rgba(10, 14, 39, 0.95);
  border: 1px solid rgba(0, 170, 255, 0.5);
  border-radius: 8px;
  padding: 12px 16px;
  min-width: 200px;
  box-shadow: 0 4px 20px rgba(0, 170, 255, 0.3);
  backdrop-filter: blur(10px);
  pointer-events: none;
}

.tooltip-title {
  font-size: 14px;
  font-weight: 700;
  color: #00ccff;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(0, 170, 255, 0.3);
  padding-bottom: 6px;
}

.tooltip-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.info-row .label {
  color: rgba(0, 204, 255, 0.6);
}

.info-row .value {
  color: #fff;
  font-weight: 600;
}

.info-row .value.online { color: #00ff88; }
.info-row .value.warning { color: #ffaa00; }
.info-row .value.error { color: #ff3366; }
.info-row .value.offline { color: #888888; }

.device-detail-panel {
  position: fixed;
  right: 20px;
  top: 100px;
  z-index: 1000;
  width: 300px;
  background: rgba(10, 14, 39, 0.95);
  border: 1px solid rgba(0, 170, 255, 0.5);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 170, 255, 0.3);
  backdrop-filter: blur(10px);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 170, 255, 0.3);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #00ccff;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(0, 204, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(0, 170, 255, 0.2);
  color: #00ccff;
}

.panel-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 11px;
  color: rgba(0, 204, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.detail-value {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.status-badge.online {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.5);
}

.status-badge.warning {
  background: rgba(255, 170, 0, 0.2);
  color: #ffaa00;
  border: 1px solid rgba(255, 170, 0, 0.5);
}

.status-badge.error {
  background: rgba(255, 51, 102, 0.2);
  color: #ff3366;
  border: 1px solid rgba(255, 51, 102, 0.5);
  animation: pulse 1.5s infinite;
}

.status-badge.offline {
  background: rgba(136, 136, 136, 0.2);
  color: #888888;
  border: 1px solid rgba(136, 136, 136, 0.5);
}

.three-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
}
</style>
