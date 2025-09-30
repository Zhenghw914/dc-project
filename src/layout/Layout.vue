<template>
  <div class="sidebar-layout">
    <AppHeader />
    <AppSidebar :isCollapsed="isCollapsed" />

    <!-- 内容区 -->
    <div
      class="content"
      :style="{
        marginLeft: isCollapsed ? '0' : '100px',
      }"
    >
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="cachedViews">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import AppSidebar from "@/components/AppSidebar.vue";
import { useRoute } from "vue-router";
const route = useRoute();
// 计算需要缓存的页面，通过 meta.keepAlive 来判断
const cachedViews = computed(() =>
  route.matched
    .flatMap((r) => r.children || [r]) // 展开所有 children 路由
    .filter((r) => r.meta && r.meta.keepAlive)
    .map((r) => r.name)
);
console.log(route.matched);
const isCollapsed = ref(false);
</script>

<style scoped lang="scss">
.sidebar-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #f1f6fc;
}

/* 内容区 */
.content {
  flex-grow: 1;
  margin-top: 60px;
  padding: 15px;
  height: calc(100vh - 60px);
  overflow: auto;
  transition: margin-left 0.3s ease-in-out;
  background: #ffffff;
  background-clip: content-box;
}
</style>
