import { onMounted, onUnmounted } from "vue";
import { EventBus } from "@/utils/eventBus";

// 封装监听安卓响应的逻辑
export function useAndroidResponse(callback) {
  
  const handleResponse = (payload) => {
    if (typeof callback === "function") {
      callback(payload);
    }
  };

  onMounted(() => {
    EventBus.on("android-response", handleResponse);
    // console.log('监听android-response成功')
  });

  onUnmounted(() => {
    EventBus.off("android-response", handleResponse);
  });
}
