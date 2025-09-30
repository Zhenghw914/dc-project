<template>
  <div style="position: relative; display: flex">
    <!-- Time Axis -->
    <div
      style="
        width: 28px;
        display: flex;
        flex-direction: column;
        position: relative;
        border-right: 1px solid #35a0f2;
      "
    >
      <!-- Display unit at the top -->
      <div
        style="
          position: absolute;
          top: 5px;
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          width: 100%;
          color: #35a0f2;
        "
      >
        {{ timeUnit }}
      </div>

      <!-- Time Labels -->
      <div
        v-for="(label, index) in timeLabels"
        :key="index"
        style="
          flex: 1;
          font-size: 12px;
          color: #35a0f2;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 5px;
        "
      >
        {{ label }}
      </div>
    </div>

    <!-- Canvas -->
    <canvas ref="canvasRef"></canvas>

    <!-- Color Scale (Right) -->
    <div
      style="
        width: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-left: 3px;
        position: relative;
      "
    >
      <!-- Gradient Bar -->
      <canvas ref="gradientCanvasRef" style="width: 5px; height: 100%"></canvas>
      <!-- Labels -->
      <div
        v-for="(label, index) in gradientLabels"
        :key="index"
        :style="{
          position: 'absolute',
          top: `${label.position}px`,
          fontSize: '10px',
          color: '#35a0f2',
          left: '18px',
          textAlign: 'left',
        }"
      >
        {{ label.value }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";

// Props: Receive parameters from the parent component
const props = defineProps({
  width: { type: Number, default: 800 }, // Canvas width
  height: { type: Number, default: 500 }, // Canvas height
  columnWidth: { type: Number, default: 5 }, // Width of each data point
  rowHeight: { type: Number, default: 1 }, // Height of each row
  dataRow: { type: Array, default: () => [] }, // Data passed every second
});
// Expose the method to parent
const clearData = () => {
  ctx.clearRect(0, 0, props.width, props.height);
  data = [];
};
defineExpose({ clearData });

// Canvas-related references
const canvasRef = ref(null);
const gradientCanvasRef = ref(null); // Reference for the gradient color bar
let ctx = null;
let gradientCtx = null; // Context for the gradient bar
let data = []; // Store all data rows

// Time Axis Labels
const timeLabels = ref([]); // Store time axis labels (e.g., 10, 20, 30)
const timeUnit = ref("s"); // Default unit is 's'

// Gradient Labels
const gradientLabels = ref([]); // Store gradient labels (e.g., 0, -30, -60, -90, -120, -150)

// Colors for the gradient
const colorStops = [
  { offset: 0, color: "#2196f3" }, // Blue (0)
  { offset: 0.25, color: "#0f0" }, // Green
  { offset: 0.5, color: "#ff0" }, // Yellow
  { offset: 0.75, color: "#f90" }, // Orange
  { offset: 1, color: "#f00" }, // Red (-150)
];

// Initialize Canvas
const initCanvas = () => {
  const canvas = canvasRef.value;
  ctx = canvas.getContext("2d");
  canvas.width = props.width;
  canvas.height = props.height;

  // Initialize gradient canvas
  const gradientCanvas = gradientCanvasRef.value;
  gradientCtx = gradientCanvas.getContext("2d");
  gradientCanvas.width = 20; // Fixed width for the gradient bar
  gradientCanvas.height = props.height;

  drawGradientBar();
  generateGradientLabels(); // Generate gradient labels
};

// Draw the gradient color bar
const drawGradientBar = () => {
  const segments = [
    { color: "#2196f3", range: 0.2 }, // 蓝色，占 20%
    { color: "#0f0", range: 0.2 }, // 绿色，占 20%
    { color: "#ff0", range: 0.2 }, // 黄色，占 20%
    { color: "#7232dd", range: 0.2 }, // 紫色 20%
    { color: "#f00", range: 0.2 }, // 红色，占 20%
  ];

  let startY = 0;

  segments.forEach((segment) => {
    const segmentHeight = props.height * segment.range; // 每段的高度
    gradientCtx.fillStyle = segment.color;
    gradientCtx.fillRect(0, startY, 20, segmentHeight); // 绘制每段颜色条
    startY += segmentHeight; // 更新起点位置
  });
};

const generateGradientLabels = () => {
  const maxValue = 0; // Top scale value
  const minValue = -150; // Bottom scale value
  const totalLabels = 6; // Show 6 scales, including 0 and -150
  const labelInterval = (maxValue - minValue) / (totalLabels - 1); // Calculate the interval for each scale

  gradientLabels.value = [];
  for (let i = 0; i < totalLabels; i++) {
    const value = Math.round(maxValue - i * labelInterval); // Calculate the value of each scale
    const position = (props.height / (totalLabels - 1)) * (totalLabels - 1 - i); // Calculate the vertical position of each scale on the color bar
    gradientLabels.value.unshift({ value, position });
  }
};

// Generate time axis labels
const generateTimeLabels = () => {
  const totalRows = Math.floor(props.height / props.rowHeight); // Total rows represented by the canvas
  const totalSeconds = totalRows; // Assume each row represents 1 second
  const totalMinutes = Math.floor(totalSeconds / 60); // Convert to minutes if needed

  timeLabels.value = [];

  if (totalSeconds <= 60) {
    // Display in seconds
    timeUnit.value = "s";
    const interval = Math.max(1, Math.ceil(totalSeconds / 10)); // Dynamic interval
    for (let i = interval; i <= totalSeconds; i += interval) {
      timeLabels.value.push(`${i}`); // Skip 0 and start from the first interval
    }
  } else {
    // Display in minutes
    timeUnit.value = "min";
    const interval = Math.max(1, Math.ceil(totalMinutes / 10)); // Dynamic interval
    for (let i = interval; i <= totalMinutes; i += interval) {
      timeLabels.value.push(`${i}`); // Skip 0 and start from the first interval
    }
  }
};

// Generate color based on data value
const getColor = (value) => {
  const normalized = Math.floor(((value + 150) / 150) * 255); // Map [-150, 0] to [0, 255]
  return `rgb(${normalized}, ${255 - normalized}, ${255 - normalized})`;
};

// Add a new data row to the top
const addRow = (newRow) => {
  // Get the current image data of the canvas
  const imageData = ctx.getImageData(0, 0, props.width, props.height);

  // Clear the canvas to make space for the new row at the top
  ctx.clearRect(0, 0, props.width, props.height);

  // Move the current data down by one row (copy image data)
  ctx.putImageData(imageData, 0, props.rowHeight); // Move down by rowHeight

  // Draw the new row at the top
  newRow.forEach((value, columnIndex) => {
    ctx.fillStyle = getColor(value);
    const x = columnIndex * props.columnWidth;
    const y = 0; // New row at the top
    ctx.fillRect(x, y, props.columnWidth, props.rowHeight);
  });

  // Now push the new row to the data and update it
  data.unshift(newRow);

  // If the data exceeds the height, remove the last row
  if (data.length > Math.floor(props.height / props.rowHeight)) {
    data.pop();
  }
};

// Watch for changes in dataRow
watch(
  () => props.dataRow,
  (newRow) => {
    if (newRow.length > 0) {
      addRow(newRow); // Add new data row
    }
  }
);

// Watch for changes in canvas size and rowHeight
watch(
  () => [props.width, props.height, props.rowHeight],
  ([newWidth, newHeight, newRowHeight]) => {
    const canvas = canvasRef.value;
    canvas.width = newWidth;
    canvas.height = newHeight;

    if (newRowHeight !== props.rowHeight || newHeight !== props.height) {
      generateTimeLabels(); // Recalculate time labels
      generateGradientLabels(); // Recalculate gradient labels
    }

    // Redraw gradient bar
    const gradientCanvas = gradientCanvasRef.value;
    gradientCanvas.height = newHeight;
    drawGradientBar();

    draw(); // Redraw to fit new size
  }
);

// Initialize
onMounted(() => {
  initCanvas();
  generateTimeLabels(); // Generate time labels at start
});
</script>

<style scoped>
canvas {
  display: block;
  background-color: #fff;
}
</style>
