<template>
  <div>
    <div ref="chartContainer" :style="{ width: width, height: height }"></div>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  defineProps,
  defineExpose,
} from "vue";
import * as echarts from "echarts";

// 通过 props 接收配置和大小
const props = defineProps({
  options: {
    type: Object,
    default: () => ({}),
  },
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "400px",
  },
});

let chartInstance = null;
const chartContainer = ref(null);

// 初始化图表
function initChart() {
  if (!chartContainer.value) {
    console.error("Chart container is not ready.");
    return;
  }
  chartInstance = echarts.init(chartContainer.value);

  // 如果父组件传来 options，就先设置一次
  if (Object.keys(props.options).length > 0) {
    chartInstance.setOption(props.options);
  }
}

// 暴露给父组件，以便父组件可直接拿到 chart 实例
defineExpose({
  getInstance: () => chartInstance,
});

// 监听 props.options 的变化，更新图表
watch(
  () => props.options,
  (newOptions) => {
    if (!chartInstance) return;
    if (newOptions && Object.keys(newOptions).length > 0) {
      chartInstance.setOption(newOptions, {
        notMerge: false,
        // 如果你想只替换 series 或其它，视情况加 replaceMerge: ['series'] 等
        replaceMerge: ["series"],
      });
    }
  },
  { deep: true }
);

onMounted(() => {
  initChart();
  // 可选：监听 resize
  window.addEventListener("resize", () => {
    chartInstance && chartInstance.resize();
  });
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>
