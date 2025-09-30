<template>
  <div>
    <div class="container">
      <van-tabs v-model:active="active" type="card">
        <van-tab title="信号">
          <van-collapse v-model="signalActive">
            <!-- 遍历 JSON 对象，key 作为面板标题，items 是数组 -->
            <van-collapse-item
              :border="false"
              :is-link="false"
              v-for="(items, freqKey, index) in signalData"
              :key="freqKey"
              :name="index"
            >
              <!-- 自定义标题插槽，用 key 作为面板标题 -->
              <template #title>
                <div class="collapse-title">
                  {{ freqKey }} ({{ items.length }})

                  <span
                    style="float: right; font-size: 12px; font-weight: bold"
                  >
                    {{
                      items[0]?.uiTime ? parseTime(items[0]?.uiTime * 1000) : ""
                    }}
                  </span>
                </div>
              </template>
              <!-- 折叠面板内容，将 items 数组渲染为表格格式 -->
              <GridTable :columns="signalColumns" :tableData="items">
                <!-- 自定义频率列 -->
                <template #ulFreq="{ row }">
                  <span style="color: green">{{ row.ulFreq }} </span>
                </template>
                <template #oprate="{ row }">
                  <van-popover
                    :actions="[{ text: '信号定位' }, { text: '频谱查询' }]"
                    @select="
                      (event, index) => onSelect(event, index, row, freqKey)
                    "
                  >
                    <template #reference>
                      <div
                        style="
                          color: #24adf3;
                          font-weight: bold;
                          font-size: 16px;
                        "
                      >
                        操作
                      </div>
                    </template>
                  </van-popover>
                </template>
              </GridTable>
            </van-collapse-item>
          </van-collapse>
        </van-tab>
        <van-tab title="WIFI"
          >
          <!-- 遍历 wifiData 的每个分类 (如 STAList, APList) 动态生成表格 -->
          <div
            v-for="(devices, type) in wifiData"
            :key="type"
            class="wifi-section"
          >
            <h3>{{ type }}({{ Object.keys(devices).length }})</h3>
            <GridTable
              :columns="filteredColumns(type)"
              :tableData="transformToArray(devices)"
              maxHeight="200px"
              style="margin-top: 15px"
            >
              <!-- 自定义列模板 -->
              <template #uiWifiType="{ row }">
                <span>{{ convertuiWifiType(row.uiWifiType) }}</span>
              </template>
              <template #lastUpdateTime="{ row }">
                <span>{{ parseTime(row.lastUpdateTime) }}</span>
              </template>

              <template #oprate="{ row }">
                <van-popover
                  :actions="[{ text: 'WIFI定位' }]"
                  @select="
                    (event, index) => onSelectWifi(event, index, row, freqKey)
                  "
                >
                  <template #reference>
                    <div
                      style="color: #24adf3; font-weight: bold; font-size: 16px"
                    >
                      操作
                    </div>
                  </template>
                </van-popover>
              </template>
            </GridTable>
          </div>
        </van-tab>
        <van-tab title="蓝牙">
          <!-- 折叠面板内容，将 items 数组渲染为表格格式 -->
          <GridTable
            :columns="blueteethColumns"
            :tableData="blueteethArray"
            maxHeight="calc(100vh - 204px)"
            style="margin-top: 15px"
          >
            <!-- 自定义频率列 -->
            <template #uiBtType="{ row }">
              <span>{{ convertBtType(row.uiBtType) }} </span>
            </template>
            <template #lastUpdateTime="{ row }">
              <span>{{ parseTime(row.lastUpdateTime) }} </span>
            </template>
          </GridTable>
        </van-tab>
      </van-tabs>
      <van-dialog
        v-model:show="wifiLocateshow"
        :title="`${locateType}定位 ${
          locateType === 'signal' ? '' : locateWifiMac
        }`"
        :showConfirmButton="false"
        width="700"
      >
        <van-button
          size="small"
          icon="close"
          type="danger"
          @click="confirmClose"
          style="position: absolute; top: 0; right: 0"
        />
        <BaseChart :options="chartOptions" width="100%" height="500px">
        </BaseChart>
      </van-dialog>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: "signal",
});
import { useRouter, useRoute } from "vue-router";
// import { signalData, wifiData } from "@/utils/wifiData.js";
import { ref, onMounted, computed, watch } from "vue";
import { debounce } from "lodash-es";
import { useStore } from "vuex";
import { showToast } from "vant";
import responses from "@/utils/androidResponsesMessage";
import parseTime from "@/utils/parseTime.js";
import GridTable from "@/components/GridTable.vue"; // 引入刚才写的通用表格组件
import BaseChart from "@/components/BaseChart.vue";
import { WiFiStart, WiFiStop } from "@/utils/webviewApi.js";
import { showConfirmDialog } from "vant";
import { useAndroidResponse } from "@/composables/useAndroidResponse";
const router = useRouter();
const route = useRoute();
const store = useStore();
const wifiData = computed(() => store.state.wifiData.wifiData);
const signalData = computed(() => store.state.signalData.signalData);
const btData = computed(() => store.state.btData.btData);
const minDifference = computed(() => store.state.minDifference);

// 判断WIFI定位启动关闭标志
let wifiLoacteState = false;

const blueteethArray = ref([]);
const wifiLocateshow = ref(false);
// 处理安卓响应
const handleAndroidResponse = ({ dataCode, data }) => {
  switch (dataCode) {
    case 20090:
      const responseConfig = responses[dataCode];
      // 当前没有wifi定位
      if (!wifiLoacteState) {
        // WIFI定位成功
        if (data.state === "0") {
          wifiLocateshow.value = true;
          // 开启wifi定位,state改变
          wifiLoacteState = true;
        }
        showToast(
          data.state === "0" ? responseConfig.success : responseConfig.failure
        );
      } else {
        // 关闭wifi定位,state改变
        wifiLoacteState = false;
        wifiLocateshow.value = false;
        showToast(
          data.state === "0"
            ? responseConfig.cancelSuccess
            : responseConfig.cancelFailure
        );
      }
      break;
    default:
  }
};
useAndroidResponse(handleAndroidResponse);

// 将设备对象转换为数组
const transformToArray = (devices) => {
  return Object.keys(devices).map((macId) => ({
    ...devices[macId], // 展开设备数据
    ucMacId: macId, // 将 MAC 地址作为字段添加到每个设备对象中
  }));
};
const onSelectWifi = (e, index, row) => {
  if (index === 0) {
    locateWifi(row);
  }
};
const onSelect = (e, index, row, freqKey) => {
  if (index === 0) {
    locateSignal(row, freqKey);
  }
  if (index === 1) {
    console.log(row.ulFreq);
    console.log(
      row.uiBand > (minDifference.value * 1e9) / 2
        ? row.uiBand / 1e9
        : minDifference.value
    );
    router.push({
      name: "detecting",
      query: {
        ulFreq: row.ulFreq,
        uiBand:
          row.uiBand > (minDifference.value * 1e9) / 2
            ? row.uiBand / 1e9
            : minDifference.value / 2,
      },
    });
  }
};
watch(
  signalData,
  (newData) => {
    // signalData.value = newData;
    updateChartSignal();
  },
  { deep: true }
);

watch(
  wifiData,
  (newData) => {
    if (wifiLoacteState) {
      updateChartWifi();
    }
  },
  { deep: true }
);
watch(
  btData,
  (newData) => {
    blueteethArray.value = Object.values(newData);
  },
  { deep: true }
);

const locateWifiMac = ref("");
const locateWifiChannel = ref("");
const locateType = ref("");
const locateSignalType = ref({});
const locateWifi = debounce(({ uiChannel, ucMacId }) => {
  locateType.value = "Wifi";
  locateWifidata.value = [];
  locateWifiMac.value = ucMacId;
  locateWifiChannel.value = uiChannel;
  WiFiStart(uiChannel, ucMacId);
}, 500);

// 信号定位
const locateSignal = (row, key) => {
  locateSignaldata.value = [];
  locateType.value = "signal";
  wifiLocateshow.value = true;
  locateSignalType.value = { ulFreq: row.ulFreq, key };
};

// 弹出确认关闭框
const confirmClose = () => {
  showConfirmDialog({
    title: "提醒",
    message: "关闭弹窗会关闭当前定位功能，确定要取消定位吗？",
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  })
    .then(() => {
      if (locateType.value === "Wifi") {
        WiFiStop(locateWifiChannel.value, locateWifiMac.value);
        return;
      }
      wifiLocateshow.value = false;
    })
    .catch(() => {
      // 用户点击取消，不关闭 Dialog
      wifiLocateshow.value = true;
    });
};

// 展示的图表数据
// wifi定位
const locateWifidata = ref([]);
// signal定位
const locateSignaldata = ref([]);
// 图表配置
const chartOptions = ref({
  animation: false,
  grid: {
    left: "10%",
    right: "10%",
    bottom: "10%",
    top: "10%",
  },
  xAxis: {
    type: "category",
    data: [], // 动态生成
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
      color: "#666",
      show: false,
    },
  },
  yAxis: {
    type: "value",
    min: -110,
    inverse: true,
    max: 0,
    axisLine: {
      show: true,
    },
    axisLabel: {
      formatter: "{value}",
    },
  },
  series: [
    {
      data: [],
      type: "bar",
      barWidth: "15",
      itemStyle: {
        color: "#6495ED",
      },
      label: {
        show: true, // 显示标签
        position: "top", // 标签位置在柱子顶部
        formatter: "{c}", // 直接显示数值
        fontSize: 14,
        color: "#333", // 标签文字颜色
      },
    },
  ],
});

const updateChartWifi = () => {
  let targetItem = null;
  // 遍历 wifiData 的每个类型（如 STAList, APList），直接根据 key 查找
  for (const type in wifiData.value) {
    if (wifiData.value[type][locateWifiMac.value]) {
      targetItem = wifiData.value[type][locateWifiMac.value];
      break;
    }
  }
  // 如果找到目标 mac 地址，将 iAmp 值添加到数据数组
  if (targetItem) {
    locateWifidata.value.push(targetItem.iAmp);
    if (locateWifidata.value.length > 20) {
      // 限制最多显示 20 个数据点，超过则移除最早的数据
      locateWifidata.value.shift();
    }
  }

  // 更新 X 轴索引
  chartOptions.value.xAxis.data = locateWifidata.value.map(
    (_, index) => index + 1
  );

  // 更新 series 数据
  chartOptions.value.series[0].data = [...locateWifidata.value];
};
const updateChartSignal = () => {
  let data = signalData.value[locateSignalType.value.key].find(
    (item) => item.ulFreq === locateSignalType.value.ulFreq
  );
  if (data) {
    locateSignaldata.value.push(data.iAmp);
    if (locateSignaldata.value.length > 20) {
      // 限制最多显示 20 个数据点，超过则移除最早的数据
      locateSignaldata.value.shift();
    }
    // 更新 X 轴索引
    chartOptions.value.xAxis.data = locateSignaldata.value.map(
      (_, index) => index + 1
    );
    // 更新 series 数据
    chartOptions.value.series[0].data = [...locateSignaldata.value];
  }
};

const active = ref(0);
const signalActive = ref([0]);

const signalColumns = [
  { key: "frequencyOperate", label: "频率类型" },
  { key: "frequencyBand", label: "频带名称" },
  { key: "OperateType", label: "运营商名称" },
  { key: "ulFreq", label: "信号频率(Hz)" },
  { key: "uiBand", label: "信号带宽(Hz)" },
  { key: "iAmp", label: "信号幅值(dbm)" },
  { key: "uiSnr", label: "信噪比" },
  { key: "oprate", label: "操作" },
  // { key: "frequencyBand", label: "频带名称" },
];
// 定义列配置
const wifiColumns = [
  { key: "ucMacId", label: "MAC地址", visible: () => true },
  {
    key: "ucRelativeMacId",
    label: "关联的MAC地址",
    visible: (type) => (type === "STAList" ? true : false),
  }, // 仅 STAList 显示
  { key: "iAmp", label: "场强值", visible: () => true },
  { key: "lastUpdateTime", label: "更新时间", visible: () => true },
  { key: "oprate", label: "操作", visible: () => true },
];
// 过滤列方法，根据类型动态展示不同列
const filteredColumns = (type) => {
  return wifiColumns.filter((col) => col.visible(type));
};
const blueteethColumns = [
  { key: "ucName", label: "蓝牙名称" },
  { key: "uiBtType", label: "蓝牙类型" },
  { key: "aucDevClass", label: "设备类型" },
  { key: "ucMacId", label: "MAC地址" },
  { key: "iAmp", label: "场强值" },
  { key: "lastUpdateTime", label: "更新时间" },
];

const convertBtType = (btType) => {
  const btTypeMap = {
    0: "经典蓝牙",
    1: "低功耗蓝牙",
  };
  return btTypeMap[btType] || "未知类型";
};
const convertuiWifiType = (btType) => {
  const btTypeMap = {
    0: "AP 模式",
    1: "STA 模式",
  };
  return btTypeMap[btType] || "未知类型";
};
</script>

<style lang="scss" scoped>
::v-deep(.van-tab__panel) {
  width: 100%;
  height: calc(100vh - 154px);
  overflow: auto;
}

::v-deep(.van-collapse-item__content) {
  padding-top: 0;
}


::v-deep(.collapse-title) {
  padding: 5px 16px !important ;
}
/* 给整个折叠面板每个 item 包裹一些边框、圆角，增加卡片效果 */
.custom-collapse-item {
  margin-bottom: 16px; /* item 间距 */
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden; /* 圆角不被子元素覆盖 */
}

/* 标题区域：背景色 + 内边距 + 分割线，让标题与内容分开 */
.collapse-title {
  background: #f8f8f8;
  padding: 12px 16px;
  font-weight: bolder;
  font-size: 16px;
  color: #333;
}

/* 内容区域与标题用边框 / 背景色区分开 */
.collapse-content {
  background: #fff;
  padding: 0px 16px;
}

/* 类表格容器 */
.content-table {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}
</style>
