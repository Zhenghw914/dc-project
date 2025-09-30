<template>
  <div
    :class="['svg-icon', customClass]"
    :style="{ width: size + 'px', height: size + 'px', color: color }"
  >
    <component :is="icon" v-if="icon" class="icon-content" />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useSvgIcon } from './useSvgIcon';

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: [String, Number],
      default: 24,
    },
    color: {
      type: String,
      default: '#000',
    },
    customClass: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { getIcon } = useSvgIcon();
    const icon = computed(() => getIcon(props.name));

    return { icon };
  },
};
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
}

.icon-content {
  width: 100%;
  height: 100%;
  fill: currentColor; /* 让颜色继承 color 属性 */
}
</style>
