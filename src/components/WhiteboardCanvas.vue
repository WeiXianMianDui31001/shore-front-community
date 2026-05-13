<template>
  <div class="page-container whiteboard">
    <div class="toolbar">
      <div class="tool-group">
        <span v-for="c in colors" :key="c"
          class="color-dot"
          :style="{ background: c }"
          :class="{ active: color === c && !isErasing }"
          @click="setColor(c)"
        />
      </div>
      <div class="tool-group">
        <span class="label">粗细</span>
        <input v-model.number="lineWidth" type="range" min="1" max="20" />
        <span class="label">{{ lineWidth }}px</span>
      </div>
      <button class="tool-btn" :class="{ active: isErasing }" @click="toggleErase">橡皮擦</button>
      <button class="tool-btn" @click="clearBoard">清空</button>
    </div>
    <div class="canvas-wrap" ref="wrapRef">
      <canvas ref="canvasRef" @mousedown="onDown" @mousemove="onMove" @mouseup="onUp" @mouseleave="onUp" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps({ initialOps: { type: Array, default: () => [] } })
const emit = defineEmits(['draw'])

const canvasRef = ref(null)
const wrapRef = ref(null)
const ctx = ref(null)

const colors = ['#000000', 'var(--danger)', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6']
const color = ref('#000000')
const lineWidth = ref(3)
const isErasing = ref(false)

let drawing = false
let points = []

onMounted(() => {
  nextTick(() => {
    initCanvas()
    redrawAll()
  })
})

watch(() => props.initialOps, () => {
  redrawAll()
}, { deep: true })

function initCanvas() {
  const canvas = canvasRef.value
  const wrap = wrapRef.value
  if (!canvas || !wrap) return

  const dpr = window.devicePixelRatio || 1
  const rect = wrap.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'

  const c = canvas.getContext('2d')
  c.scale(dpr, dpr)
  c.lineCap = 'round'
  c.lineJoin = 'round'
  ctx.value = c
}

function redrawAll() {
  if (!ctx.value) return
  const c = ctx.value
  const wrap = wrapRef.value
  c.clearRect(0, 0, wrap.clientWidth, wrap.clientHeight)
  for (const op of props.initialOps) {
    drawOp(op)
  }
}

function drawOp(op) {
  if (!ctx.value) return
  const c = ctx.value
  const data = typeof op.opData === 'string' ? JSON.parse(op.opData) : op.opData
  const pts = data.points || []
  if (pts.length < 2) return

  c.save()
  if (op.opType === 'ERASE') {
    c.strokeStyle = '#ffffff'
    c.lineWidth = data.lineWidth || 20
  } else {
    c.strokeStyle = data.color || '#000000'
    c.lineWidth = data.lineWidth || 3
  }

  c.beginPath()
  c.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) {
    c.lineTo(pts[i][0], pts[i][1])
  }
  c.stroke()
  c.restore()
}

function setColor(c) {
  color.value = c
  isErasing.value = false
}

function toggleErase() {
  isErasing.value = !isErasing.value
}

function getPos(e) {
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  return [e.clientX - rect.left, e.clientY - rect.top]
}

function onDown(e) {
  drawing = true
  points = [getPos(e)]
}

function onMove(e) {
  if (!drawing) return
  const pos = getPos(e)
  points.push(pos)

  const c = ctx.value
  c.save()
  if (isErasing.value) {
    c.strokeStyle = '#ffffff'
    c.lineWidth = lineWidth.value * 3
  } else {
    c.strokeStyle = color.value
    c.lineWidth = lineWidth.value
  }
  c.beginPath()
  c.moveTo(points[points.length - 2][0], points[points.length - 2][1])
  c.lineTo(pos[0], pos[1])
  c.stroke()
  c.restore()
}

function onUp() {
  if (!drawing) return
  drawing = false
  if (points.length < 2) return

  emit('draw', {
    opType: isErasing.value ? 'ERASE' : 'DRAW',
    opData: {
      color: color.value,
      lineWidth: isErasing.value ? lineWidth.value * 3 : lineWidth.value,
      points: points
    }
  })
  points = []
}

function clearBoard() {
  if (!ctx.value || !wrapRef.value) return
  ctx.value.clearRect(0, 0, wrapRef.value.clientWidth, wrapRef.value.clientHeight)
  emit('draw', { opType: 'CLEAR', opData: {} })
}

function applyRemoteOp(op) {
  drawOp(op)
}

defineExpose({ applyRemoteOp })
</script>

<style scoped>
.whiteboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  flex-wrap: wrap;
}
.tool-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.color-dot {
  width: 22px;
  height: 22px;
  border-radius: var(--radius-full);
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.15s;
}
.color-dot.active {
  border-color: var(--text-secondary);
  transform: scale(1.15);
}
.label {
  font-size: 12px;
  color: var(--text-secondary);
}
.tool-btn {
  padding: 5px 12px;
  border: 1px solid var(--border-hover);
  background: var(--surface);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
}
.tool-btn.active {
  background: var(--primary);
  color: var(--text-on-primary);
  border-color: var(--primary);
}
.canvas-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
}
canvas {
  display: block;
  background: var(--surface);
  cursor: crosshair;
}
</style>