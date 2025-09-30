<template>
  <div class="device-info">
    <!-- 顶部信息 -->
    <div class="header">
      <SvgIcon name="version" :size="28" style="margin-right: 5px" />
      <div style="margin-right: 45px">
        <div class="version">设备版本</div>
        <div class="version-number">14.0.8</div>
      </div>
    </div>
    <div class="title">设备状态</div>
    <van-grid column-num="4" >
      <van-grid-item
        v-for="(item, index) in gridItems"
        :key="index"
        class="grid-item"
      >
        <div class="grid-content">
          <div class="grid-left">
            <SvgIcon :name="item.icon" :size="36" />
          </div>
          <div class="grid-right">
            <div class="grid-title">{{ item.title }}</div>
            <div class="info">
              <template v-if="item.key === 'gpsInfo'">
                <div>纬度: {{ sysInfo.gpsInfo.dLatitude || "N/A" }}</div>
                <div>经度: {{ sysInfo.gpsInfo.dLongitude || "N/A" }}</div>
              </template>
              <template v-else-if="item.key === 'cpuseage'">
                {{ sysInfo.uiSpecUsage + sysInfo.uiSignUsage }} /
                {{ sysInfo.uiTotalMem }}(Mb)
              </template>
              <template v-else-if="item.key === 'skfw'">
                {{ sysInfo.zsBgnFreq / 1e9 }}~{{ sysInfo.zsEndFreq / 1e9 }}(Ghz)
              </template>
              <template v-else>
                {{ getValue(item.key) }}
              </template>
            </div>
          </div>
        </div>
      </van-grid-item>
    </van-grid>
    <div class="title">设备配置</div>
    <div style="padding: 0 15px">
      <van-button
        :loading="resetState"
        @click="sendMsgSoftReset"
        plain
        type="primary"
        loading-text="复位中..."
        >复位设备
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import { sendMsgSoftResetRsp } from "@/utils/webviewApi";
import { useAndroidResponse } from "@/composables/useAndroidResponse";
import { showToast } from "vant";
import responses from "@/utils/androidResponsesMessage";

const store = useStore();
const sysInfo = computed(() => store.state.sysInfo.sysInfo);

// const sysInfo = ref({
//   uiWorkMode: 0,
//   ucCpuUsageRate: 85,
//   ucMemUsageRate: 97,
//   ucNandUsageRate: 67,
//   ucSdUsageRate: 0,
//   ip: "127.0.0.1",
//   ucCpuTemp: 36,
//   ucPad: [0, 0, 0],
//   zsBgnFreq: 70000000,
//   zsEndFreq: 6000000000,
//   uiTotalMem: 2973,
//   uiSpecUsage: 1460,
//   uiSignUsage: 262,
//   uiSdTotalMem: 0,
//   uiSdSpecUsage: 0,
//   uiSdSignUsage: 0,
//   ucWifiStatus: 1,
//   ucBtStatus: 1,
//   ucPad2: [0, 0],
//   gpsInfo: {
//     tUtcTime: {
//       uiYear: 0,
//       uiMonth: 0,
//       uiWeek: 0,
//       uiDay: 0,
//       uiHour: 0,
//       uiMinute: 0,
//       uiSecond: 0,
//       uiMilliSecond: 0,
//     },
//     cStatus: 86,
//     cLatHemi: 0,
//     cLonHemi: 0,
//     cDirection: 0,
//     dLatitude: 0.0,
//     dLongitude: 0.0,
//     dSpeed: 0.0,
//     dCourse: 0.0,
//     dMagDegree: 0.0,
//   },
// });
const handleAndroidResponse = ({ dataCode, data }) => {
  switch (dataCode) {
    case 20049:
      const responseConfig = responses[dataCode];
      showToast(
        data.state === "0" ? responseConfig.success : responseConfig.failure
      );
      resetState.value = false;
    default:
  }
};
const resetState = ref(false);
// 网格内容
const gridItems = [
  { title: "工作模式", key: "uiWorkMode", icon: "workstate" },
  { title: "CPU使用率", key: "ucCpuUsageRate", icon: "cpusage" },
  { title: "内存使用率", key: "ucMemUsageRate", icon: "memusage" },
  { title: "SD卡使用率", key: "ucSdUsageRate", icon: "sdusage" },
  { title: "CPU温度", key: "ucCpuTemp", icon: "temperature" },
  { title: "IP地址", key: "ip", icon: "ip" },
  { title: "GPS信息", key: "gpsInfo", icon: "gps" },
  { title: "WIFI状态", key: "ucWifiStatus", icon: "wifi" },
  { title: "蓝牙状态", key: "ucBtStatus", icon: "bt" },
  { title: "守控范围", key: "skfw", icon: "range" },
  { title: "磁盘使用", key: "cpuseage", icon: "cipan" },
];
const getValue = (key) => {
  const keys = key.split(".");
  let value = sysInfo.value;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return "N/A";
  }
  if (
    [
      "ucCpuUsageRate",
      "ucMemUsageRate",
      "ucNandUsageRate",
      "ucSdUsageRate",
    ].includes(key)
  ) {
    return `${value}%`;
  }
  if (key === "ucCpuTemp") return value + "℃";
  if (key === "uiWorkMode") return translateWorkMode(value);
  if (key === "ucWifiStatus") return translateWifiStatus(value);
  if (key === "ucBtStatus") return translateBtStatus(value);
  return typeof value === "number" ? value.toString() : value;
};
const translateWorkMode = (mode) => {
  const modes = {
    0: "扫描",
    1: "触发",
  };
  return modes[mode] || "未知";
};
const translateWifiStatus = (status) => {
  return status === 1 ? "上电" : "下电";
};
const translateBtStatus = (status) => {
  return status === 1 ? "上电" : "下电";
};
const sendMsgSoftReset = () => {
  sendMsgSoftResetRsp();
  resetState.value = true;
};
watch(
  sysInfo,
  (newData) => {
    console.log(JSON.stringify(newData.value));
  },
  { deep: true }
);
useAndroidResponse(handleAndroidResponse);
</script>

<style scoped>
.title {
  font-size: 18px;
  padding: 5px;
  font-weight: bolder;
}
.device-info {
  padding: 16px;
  background: #fff;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.logo {
  width: 36px;
  height: 36px;
  margin-right: 12px;
}

.version {
  font-size: 16px;
  color: #333;
}

.version-number {
  font-size: 14px;
  color: #999;
}

/* 网格布局样式 */
.grid-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  /* padding: 10px; */
}

.grid-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.grid-left {
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.grid-right {
  flex: 1;
  padding-left: 12px;
}

.grid-title {
  font-size: 14px;
  font-weight: bold;
  color: #666;
  margin-bottom: 4px;
}

.info {
  font-size: 16px;
  color: #333;
}
</style>
