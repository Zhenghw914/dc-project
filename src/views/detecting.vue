<template>
  <div class="container">
    <div style="font-weight: bold; font-size: 20px">
      频谱实测({{ Math.floor(varxAxis.xMin * 100) / 100 }}~{{
        Math.floor(varxAxis.xMax * 100) / 100
      }}GHZ)
    </div>
    <div class="checkbox-group-container">
      <van-checkbox-group
        v-model="checkedTypes"
        direction="horizontal"
        @change="changeType"
      >
        <!-- <van-checkbox name="current" class="custom-checkbox">当前频谱</van-checkbox> -->
        <van-checkbox name="max" class="custom-checkbox"
          >最大值频谱</van-checkbox
        >
        <van-checkbox name="min" class="custom-checkbox"
          >最小值频谱</van-checkbox
        >
        <van-checkbox name="avg" class="custom-checkbox"
          >平均值频谱</van-checkbox
        >
      </van-checkbox-group>
    </div>
    <BaseChart
      ref="baseChartRef"
      :options="option"
      width="100%"
      height="300px"
    />
    <div style="width: 100%; display: flex; justify-content: center">
      <WaterfallChart
        ref="warterfallchart"
        :width="800"
        :height="200"
        :columnWidth="1.6"
        :rowHeight="1"
        :dataRow="dataRow"
      />
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: "detecting",
});
import { ref, onMounted, computed, watch } from "vue";
import { useStore } from "vuex";
import { useAndroidResponse } from "@/composables/useAndroidResponse";
import { useRoute } from "vue-router";
import BaseChart from "@/components/BaseChart.vue";
import WaterfallChart from "@/components/WaterfallChart.vue";
import { debounce } from "lodash-es";
// import data from "@/assets/test.js";
import { setBgnAndEndFreq } from "@/utils/webviewApi";
import { showToast } from "vant";
const store = useStore();
const route = useRoute();

let init = false;
// 计算属性，获取 Vuex 中的频谱数据
const spectrumData = computed(() => store.state.spectrumData.spectrumData);
const minDifference = computed(() => store.state.minDifference);
// 监听参数变化
watch(
  () => route.query,
  ({ ulFreq, uiBand }) => {
    if (ulFreq || uiBand) {
      const startValue = (ulFreq - uiBand) / 1e9;
      const endValue = (Number(ulFreq) + Number(uiBand)) / 1e9;
      varxAxis.value.xMin = startValue;
      varxAxis.value.xMax = endValue;
      option.value.dataZoom = [
        {
          ...option.value.dataZoom[0],
          startValue,
          endValue,
        },
      ];
      clearCanvas();
      // setBgnAndEndFreq(
      //   Math.round(startValue * Math.pow(10, 9)),
      //   Math.round(endValue * Math.pow(10, 9))
      // );
    }
  }
);

// 监听 spectrumData 变化
watch(
  spectrumData,
  (newData) => {
    if (init === false && !route.query.uiBand) {
      // constxAxis.value.xMin = data.data.ulBgnFreq / 1e9;
      // constxAxis.value.xMax = data.data.ulEndFreq / 1e9;
      varxAxis.value.xMin = newData.ulBgnFreq / 1e9;
      varxAxis.value.xMax = newData.ulEndFreq / 1e9;
      option.value.dataZoom = [
        {
          ...option.value.dataZoom[0],
          startValue: varxAxis.value.xMin,
          endValue: varxAxis.value.xMax,
        },
      ];
      // option.value.xAxis.min = constxAxis.value.xMin;
      // option.value.xAxis.max = constxAxis.value.xMax;
      init = true;
    }
    const { maxFreq, minFreq, averageFreq, currentFreq } = newData;
    // 更新频谱数据
    dataRow.value = currentFreq.map((point) => point.y);
    seriesMap.max.data = processData(maxFreq).map((point) => [
      point.x,
      point.y,
    ]);
    seriesMap.min.data = processData(minFreq).map((point) => [
      point.x,
      point.y,
    ]);
    seriesMap.avg.data = processData(averageFreq).map((point) => [
      point.x,
      point.y,
    ]);
    seriesMap.current.data = processData(currentFreq).map((point) => [
      point.x,
      point.y,
    ]);
    // 调用更新图表的函数，重新渲染图表
    changeData(); // 你需要在 `changeData` 函数中更新图表的 series 和 xAxis
  },
  { deep: true }
);
const baseChartRef = ref(null);
const warterfallchart = ref(null);
const checkedTypes = ref([]); // 用于存储选中的频谱类型
const constxAxis = ref({
  xMin: 0.07,
  xMax: 6,
});
const varxAxis = ref({
  xMin: "",
  xMax: "",
});

// const minDifference = 0.0125; // 最小差值阈值
// 封装修改数据的函数
const processData = (rawData) => {
  return rawData.map((point) => ({
    x: point.x / 1000000000, // 转换频率为 MHz
    y: point.y, // 信号强度不做修改
  }));
};
const dataRow = ref([]);
const clearCanvas = () => {
  warterfallchart.value.clearData();
};
// 折线图配置项
const option = ref({
  animation: false,
  xAxis: {
    type: "value", // 这里用 value 类型，而不是 category 类型
    // data: ["0", "1", "2", "3", "4", "5", "6", "7"], // 固定的x轴刻度，0-7.
    min: constxAxis.value.xMin, // 最小值
    max: constxAxis.value.xMax, // 最大值
    name: "GHz", // 在坐标轴末端显示单位
    splitNumber: 6, // 固定显示的刻度数量
    axisLabel: {
      formatter: (value) => {
        return value;
      },
    },
    axisTick: {
      show: false,
    },
    axisLine: {
      show: false,
      onZero: false,
    },
  },
  yAxis: {
    type: "value",
    name: "dBm", // 在坐标轴末端显示单位
    max: 0, // 最大值
    min: -150,
    axisLine: {
      show: false,
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: "#d3d3d3",
        width: 1,
        type: "dashed",
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      formatter: (value) => {
        return value;
      },
    },
    inverse: false,
  },
  series: [
    {
      data: [],
      type: "line",
      smooth: true,
      lineStyle: {
        color: "#3e8ef7",
      },
      itemStyle: {
        color: "#3e8ef7",
      },
      areaStyle: {
        color: "rgba(62, 142, 247, 0.3)",
        origin: "start",
      },
    },
  ],
  tooltip: {
    trigger: "axis",
    formatter: (params) => {
      const data = params[0];
      return `频率:${data.axisValue} <br> 幅值: ${data.data[1]}`;
    },
  },

  dataZoom: [
    {
      type: "inside",
      zoomOnMouseWheel: true,
      moveOnMouseMove: true,
      moveOnMouseWheel: true,
      startValue: varxAxis.value.xMin, // 设置起始值为 2
      endValue: varxAxis.value.xMax, // 设置结束值为 5
    },
  ],
});
// 全部频谱的series配置
const seriesMap = {
  max: {
    name: "最大值频谱",
    data: [],
    type: "line",
    smooth: true,
    lineStyle: { color: "#f56c6c" },
    itemStyle: { color: "#f56c6c" },
    symbol: "none", // 删除点的标记
  },
  min: {
    name: "最小值频谱",
    data: [],
    type: "line",
    smooth: true,
    lineStyle: { color: "#67c23a" },
    itemStyle: { color: "#67c23a" },
    symbol: "none", // 删除点的标记
  },
  current: {
    name: "当前频谱",
    data: [],
    type: "line",
    smooth: true,
    lineStyle: { color: "#409eff" },
    itemStyle: { color: "#409eff" },
    symbol: "none", // 删除点的标记
  },
  avg: {
    name: "平均值频谱",
    data: [],
    type: "line",
    smooth: true,
    lineStyle: { color: "#e6a23c" },
    itemStyle: { color: "#e6a23c" },
    symbol: "none", // 删除点的标记
  },
};

// 切换checkbox类型，动态增删series
const changeData = () => {
  // 创建一个新的 series 数组，包含 `current` 系列
  const newSeries = [
    seriesMap.current, // 始终显示 current
  ];
  // 根据选中的类型动态添加其他系列
  checkedTypes.value.forEach((type) => {
    if (type !== "current") {
      newSeries.push(seriesMap[type]);
    }
  });
  option.value.series = [...newSeries];
};
// 切换checkbox类型
const changeType = () => {
  changeData();
};

onMounted(() => {
  const { ulFreq, uiBand } = route.query;
  // 如果预期是数字，可以再打印:
  if (ulFreq || uiBand) {
    const startValue = ulFreq / 1e9 - uiBand;
    const endValue = Number(ulFreq) / 1e9 + Number(uiBand);
    varxAxis.value.xMin = startValue;
    varxAxis.value.xMax = endValue;
    option.value.dataZoom = [
      {
        ...option.value.dataZoom[0],
        startValue,
        endValue,
      },
    ];
    clearCanvas();
    setBgnAndEndFreq(
      Math.round(startValue * Math.pow(10, 9)),
      Math.round(endValue * Math.pow(10, 9))
    );
  }
  const chartInstance = baseChartRef.value.getInstance();
  // deviceRelations(data);
  //监听 dataZoom 事件，并在回调里防抖
  const onDataZoom = debounce((event) => {
    let start = event.batch?.[0]?.start;
    let end = event.batch?.[0]?.end;

    const startValue =
      constxAxis.value.xMin +
      (constxAxis.value.xMax - constxAxis.value.xMin) * (start / 100);
    const endValue =
      constxAxis.value.xMin +
      (constxAxis.value.xMax - constxAxis.value.xMin) * (end / 100);

    if (endValue - startValue < minDifference.value) {
      // 如果差值小于阈值，则重置
      showToast("超出频率最小范围差,请重新进行缩小");
      option.value.dataZoom = [
        {
          ...option.value.dataZoom[0],
          startValue: varxAxis.value.xMin,
          endValue: varxAxis.value.xMax,
        },
      ];
      return;
    }

    varxAxis.value.xMin = startValue;
    varxAxis.value.xMax = endValue;
    option.value.dataZoom = [
      {
        ...option.value.dataZoom[0],
        startValue,
        endValue,
      },
    ];
    setBgnAndEndFreq(
      Math.round(startValue * Math.pow(10, 9)),
      Math.round(endValue * Math.pow(10, 9))
    );
    clearCanvas();
  }, 300);
  chartInstance.on("datazoom", onDataZoom);
});
</script>

<style lang="scss" scoped>
.checkbox-group-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 10px 0;
}

.custom-checkbox {
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 8px 16px;
  margin-right: 10px;
  font-size: 14px;
  color: #666;
  border: 1px solid #ddd;
  transition: all 0.3s ease;
}

::v-deep(.van-checkbox__icon) {
  display: none;
}

::v-deep(.custom-checkbox[aria-checked="true"]) {
  border-color: #1890ff;
  background-color: #e6f7ff;
  color: #1890ff !important;
  font-weight: bold;
}
.echarts {
  width: 100%;
  height: 300px;
}
</style>
