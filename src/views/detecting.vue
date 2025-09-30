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
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
      label: {
        backgroundColor: "#6a7985",
      },
    },
    formatter: function (params) {
      const param = params[0];
      return `频率: ${param.axisValue.toFixed(4)} GHz<br/>强度: ${param.data[1].toFixed(
        2
      )} dBm`;
    },
  },
  dataZoom: [
    {
      type: "inside",
      xAxisIndex: 0,
      filterMode: "none",
      startValue: varxAxis.value.xMin,
      endValue: varxAxis.value.xMax,
      minValueSpan: minDifference,
      maxValueSpan: 6,
      zoomOnMouseWheel: false,
      moveOnMouseMove: true,
      moveOnMouseWheel: true,
    },
  ],
  series: [],
});

// 定义不同类型频谱的配置
const seriesMap = {
  current: {
    name: "当前频谱",
    type: "line",
    symbol: "none",
    sampling: "lttb",
    itemStyle: {
      color: "#5470c6",
    },
    emphasis: {
      focus: "series",
    },
    data: [],
  },
  max: {
    name: "最大值频谱",
    type: "line",
    symbol: "none",
    sampling: "lttb",
    itemStyle: {
      color: "#ee6666",
    },
    emphasis: {
      focus: "series",
    },
    data: [],
  },
  min: {
    name: "最小值频谱",
    type: "line",
    symbol: "none",
    sampling: "lttb",
    itemStyle: {
      color: "#3ba272",
    },
    emphasis: {
      focus: "series",
    },
    data: [],
  },
  avg: {
    name: "平均值频谱",
    type: "line",
    symbol: "none",
    sampling: "lttb",
    itemStyle: {
      color: "#5470c6",
    },
    emphasis: {
      focus: "series",
    },
    data: [],
  },
};

// 根据选中的类型更新图表
const changeType = () => {
  changeData();
};

// 更新图表数据
const changeData = () => {
  // 根据选中的类型构建 series 数组
  const series = [];
  // 始终添加当前频谱
  series.push(seriesMap.current);

  // 添加选中的其他频谱类型
  checkedTypes.value.forEach((type) => {
    if (seriesMap[type]) {
      series.push(seriesMap[type]);
    }
  });

  // 更新图表配置
  option.value.series = series;

  // 如果图表实例已经创建，则应用更新
  if (baseChartRef.value) {
    baseChartRef.value.updateOptions(option.value);
  }
};

// 监听图表的缩放事件
const handleZoom = debounce((params) => {
  if (params.batch && params.batch.length > 0) {
    const { startValue, endValue } = params.batch[0];
    if (startValue !== undefined && endValue !== undefined) {
      // 更新当前显示的频率范围
      varxAxis.value.xMin = startValue;
      varxAxis.value.xMax = endValue;

      // 计算频率范围的差值
      const diff = endValue - startValue;

      // 如果差值小于最小阈值，则调整范围
      if (diff < minDifference.value) {
        const center = (startValue + endValue) / 2;
        varxAxis.value.xMin = center - minDifference.value / 2;
        varxAxis.value.xMax = center + minDifference.value / 2;

        // 更新图表的缩放范围
        option.value.dataZoom[0].startValue = varxAxis.value.xMin;
        option.value.dataZoom[0].endValue = varxAxis.value.xMax;
        baseChartRef.value.updateOptions(option.value);
      } else {
        // 发送频率范围到后端
        setBgnAndEndFreq(
          Math.round(startValue * Math.pow(10, 9)),
          Math.round(endValue * Math.pow(10, 9))
        );
      }
    }
  }
}, 300);

onMounted(() => {
  // 初始化图表
  changeData();

  // 监听图表的缩放事件
  if (baseChartRef.value) {
    baseChartRef.value.getEchartsInstance().on("datazoom", handleZoom);
  }

  // 初始化 Android 响应处理
  useAndroidResponse();
});
</script>

<style scoped>
.container {
  padding: 10px;
}

.checkbox-group-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.custom-checkbox {
  margin-right: 10px;
}
</style>