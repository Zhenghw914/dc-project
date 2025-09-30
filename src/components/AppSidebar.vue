<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <van-sidebar v-model="active">
      <van-sidebar-item
        v-for="(item, index) in menuList"
        :key="index"
        :to="item.path"
      >
        <template #title>
          <div class="menu-item">
            <span style="font-weight: bold;">{{ item.name }}</span>
            <van-icon
              class-prefix="icon"
              size="25px"
              class="menu-icon"
              :name="item.icon"
            />
          </div>
        </template>
      </van-sidebar-item>
    </van-sidebar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

defineProps({
  isCollapsed: Boolean
});

const router = useRouter();
const route = useRoute();
const active = ref(0);

// 菜单数据，绑定路由地址
const menuList = ref([
  { id: 1, name: '实时侦测', path: '/detecting', value: 0, icon: 'base-signal' },
  { id: 2, name: '实时信号', path: '/signal', value: 1, icon: 'signal' },
  { id: 3, name: '深度分析', path: '/depthanalysis', value: 2, icon: 'shendufenxi' },
  { id: 4, name: '数据查询', path: '/dataquery', value: 3, icon: 'data-Inquire' },
  { id: 6, name: '数据分析', path: '/dataanalysis', value: 4, icon: 'fenxi' },
  { id: 5, name: '系统管理', path: '/sysmanage', value: 5, icon: 'navicon-xtgl' },

]);

// 监听路由变化，更新 active
const updateActive = () => {
  const currentPath = route.path;
  const match = menuList.value.find(item => item.path === currentPath);
  if (match) {
    active.value = match.value;
  }
};

// 初始加载时设置 active
onMounted(updateActive);

// 监听路由变化
watch(route, updateActive);
</script>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  width: 100px;
  height: calc(100vh - 60px);
  background-color: #fff;
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.menu-item {
  display: flex;
  align-items: center;
  flex-direction: column-reverse;
  width: 60px;
}

.menu-icon {
  margin-bottom: 10px;
}

:deep(.van-sidebar-item) {
	
  padding-left: 20px !important;
  background: #ffffff;
}

:deep(.van-sidebar-item--select) {
  color: #2196f3;
  font-weight: normal;
}
</style>
