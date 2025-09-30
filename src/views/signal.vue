<template>
  <div class="container">
    <div class="signal-info">
      <div class="signal-header">
        <div class="signal-title">信号信息</div>
        <div class="signal-actions">
          <van-button
            type="primary"
            size="small"
            @click="handleRefresh"
            :loading="loading"
            >刷新</van-button
          >
        </div>
      </div>

      <div class="signal-grid">
        <div
          v-for="(item, index) in signalData"
          :key="index"
          class="signal-item"
          @click="handleItemClick(item)"
        >
          <div class="signal-item-header">
            <svg-icon :name="item.icon" class="signal-icon" />
            <span class="signal-name">{{ item.name }}</span>
          </div>
          <div class="signal-value" :class="getValueClass(item)">
            {{ item.value }}
            <span v-if="item.unit" class="signal-unit">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-header">
        <div class="chart-title">信号趋势</div>
        <div class="chart-actions">
          <van-dropdown-menu>
            <van-dropdown-item v-model="timeRange" :options="timeOptions" />
          </van-dropdown-menu>
        </div>
      </div>
      <BaseChart
        :options="chartOptions"
        height="300px"
        width="100%"
        class="signal-chart"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import BaseChart from '@/components/BaseChart.vue';
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue';
import { showToast } from 'vant';

const store = useStore();
const loading = ref(false);
const timeRange = ref('day');
const timeOptions = [
  { text: '24小时', value: 'day' },
  { text: '7天', value: 'week' },
  { text: '30天', value: 'month' }
];

// 从Vuex获取信号数据
const signalInfo = computed(() => store.state.signalData.signalInfo);

// 格式化信号数据用于显示
const signalData = computed(() => {
  return [
    {
      name: '信号强度',
      value: signalInfo.value.signalStrength || '-',
      unit: 'dBm',
      icon: 'signal',
      status: getSignalStatus(signalInfo.value.signalStrength),
      history: signalInfo.value.signalHistory || []
    },
    {
      name: '信噪比',
      value: signalInfo.value.snr || '-',
      unit: 'dB',
      icon: 'range',
      status: getSNRStatus(signalInfo.value.snr),
      history: signalInfo.value.snrHistory || []
    },
    {
      name: '误码率',
      value: signalInfo.value.ber ? (signalInfo.value.ber * 100).toFixed(2) : '-',
      unit: '%',
      icon: 'workstate',
      status: getBERStatus(signalInfo.value.ber),
      history: signalInfo.value.berHistory || []
    },
    {
      name: '延迟',
      value: signalInfo.value.latency || '-',
      unit: 'ms',
      icon: 'ip',
      status: getLatencyStatus(signalInfo.value.latency),
      history: signalInfo.value.latencyHistory || []
    }
  ];
});

// 根据数值获取状态类
function getValueClass(item) {
  switch(item.status) {
    case 'excellent': return 'status-excellent';
    case 'good': return 'status-good';
    case 'fair': return 'status-fair';
    case 'poor': return 'status-poor';
    default: return '';
  }
}

// 信号强度状态判断
function getSignalStatus(value) {
  if (!value || value === '-') return 'unknown';
  const signal = Number(value);
  if (signal >= -70) return 'excellent';
  if (signal >= -85) return 'good';
  if (signal >= -100) return 'fair';
  return 'poor';
}

// 信噪比状态判断
function getSNRStatus(value) {
  if (!value || value === '-') return 'unknown';
  const snr = Number(value);
  if (snr >= 20) return 'excellent';
  if (snr >= 15) return 'good';
  if (snr >= 10) return 'fair';
  return 'poor';
}

// 误码率状态判断
function getBERStatus(value) {
  if (!value || value === '-') return 'unknown';
  const ber = Number(value);
  if (ber < 0.001) return 'excellent';
  if (ber < 0.01) return 'good';
  if (ber < 0.05) return 'fair';
  return 'poor';
}

// 延迟状态判断
function getLatencyStatus(value) {
  if (!value || value === '-') return 'unknown';
  const latency = Number(value);
  if (latency < 50) return 'excellent';
  if (latency < 100) return 'good';
  if (latency < 200) return 'fair';
  return 'poor';
}

// 图表配置
const chartOptions = computed(() => {
  // 获取当前选中的信号项的历史数据
  const selectedSignal = signalData.value[0]; // 默认显示信号强度
  const historyData = selectedSignal.history;
  
  // 根据时间范围筛选数据
  const filteredData = filterDataByTimeRange(historyData, timeRange.value);
  
  // 准备X轴和Y轴数据
  const xAxisData = filteredData.map(item => item.time);
  const seriesData = filteredData.map(item => item.value);
  
  return {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const param = params[0];
        return `${param.axisValue}<br/>${param.seriesName}: ${param.value} ${selectedSignal.unit}`;
      }
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: 45,
        formatter: function(value) {
          // 根据时间范围格式化显示
          if (timeRange.value === 'day') {
            return value.split(' ')[1]; // 只显示时间部分
          }
          return value;
        }
      }
    },
    yAxis: {
      type: 'value',
      name: selectedSignal.unit,
      axisLine: {
        show: true
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [{
      name: selectedSignal.name,
      type: 'line',
      data: seriesData,
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 2
      },
      areaStyle: {
        opacity: 0.2
      }
    }]
  };
});

// 根据时间范围筛选数据
function filterDataByTimeRange(data, range) {
  if (!data || data.length === 0) {
    return generateMockData(range); // 如果没有真实数据，生成模拟数据
  }
  
  const now = new Date();
  let startTime;
  
  switch(range) {
    case 'week':
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'day':
    default:
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  return data.filter(item => new Date(item.time) >= startTime);
}

// 生成模拟数据
function generateMockData(range) {
  const data = [];
  const now = new Date();
  let count;
  let interval;
  
  switch(range) {
    case 'week':
      count = 7;
      interval = 24 * 60 * 60 * 1000; // 1天
      break;
    case 'month':
      count = 30;
      interval = 24 * 60 * 60 * 1000; // 1天
      break;
    case 'day':
    default:
      count = 24;
      interval = 60 * 60 * 1000; // 1小时
  }
  
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval);
    const formattedTime = formatTime(time, range);
    data.push({
      time: formattedTime,
      value: -80 - Math.random() * 20 // 模拟-80到-100之间的信号强度
    });
  }
  
  return data;
}

// 格式化时间
function formatTime(time, range) {
  const year = time.getFullYear();
  const month = String(time.getMonth() + 1).padStart(2, '0');
  const day = String(time.getDate()).padStart(2, '0');
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  
  if (range === 'day') {
    return `${month}-${day} ${hours}:${minutes}`;
  } else {
    return `${month}-${day}`;
  }
}

// 处理刷新按钮点击
const handleRefresh = async () => {
  loading.value = true;
  try {
    await store.dispatch('signalData/fetchSignalData');
    showToast('数据已更新');
  } catch (error) {
    showToast('更新失败，请重试');
    console.error('Failed to refresh signal data:', error);
  } finally {
    loading.value = false;
  }
};

// 处理信号项点击
const handleItemClick = (item) => {
  // 这里可以实现点击切换图表显示的信号类型
  console.log('Clicked signal item:', item);
};

// 监听时间范围变化
watch(timeRange, () => {
  // 时间范围变化时可以重新获取数据
  console.log('Time range changed to:', timeRange.value);
});

onMounted(async () => {
  // 组件挂载时获取信号数据
  await handleRefresh();
});
</script>

<style scoped>
.container {
  padding: 16px;
}

.signal-info, .chart-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  padding: 16px;
}

.signal-header, .chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.signal-title, .chart-title {
  font-size: 18px;
  font-weight: bold;
}

.signal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.signal-item {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.signal-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.signal-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.signal-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

.signal-name {
  font-size: 14px;
  color: #606266;
}

.signal-value {
  font-size: 24px;
  font-weight: bold;
}

.signal-unit {
  font-size: 14px;
  font-weight: normal;
  margin-left: 4px;
}

.status-excellent {
  color: #67c23a;
}

.status-good {
  color: #409eff;
}

.status-fair {
  color: #e6a23c;
}

.status-poor {
  color: #f56c6c;
}

.signal-chart {
  margin-top: 16px;
}

.chart-actions {
  display: flex;
  align-items: center;
}

:deep(.van-dropdown-menu__bar) {
  height: 32px;
  box-shadow: none;
}

:deep(.van-dropdown-menu__title) {
  font-size: 14px;
}

:deep(.van-dropdown-item__content) {
  max-height: 300px;
}

:deep(.van-cell) {
  padding: 8px 16px;
}

:deep(.van-button--small) {
  padding: 0 12px;
  height: 32px;
}

.chart-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}
</style>