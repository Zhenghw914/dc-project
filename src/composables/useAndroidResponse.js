import { onMounted, onUnmounted } from 'vue';
import { eventBus } from '@/utils/eventBus';

export function useAndroidResponse(callback) {
  const handleAndroidResponse = (data) => {
    callback(data);
  };

  onMounted(() => {
    eventBus.on('android-response', handleAndroidResponse);
  });

  onUnmounted(() => {
    eventBus.off('android-response', handleAndroidResponse);
  });
}
