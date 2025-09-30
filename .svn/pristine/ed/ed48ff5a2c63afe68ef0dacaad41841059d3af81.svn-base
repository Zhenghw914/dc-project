import { createRouter, createWebHashHistory } from "vue-router";
import Detecting from "@/views/detecting.vue"; // 导入视图组件
import Layout from "@/layout/Layout.vue";
import Signal from "@/views/signal.vue";
import Depthanalysis from "@/views/depthanalysis.vue";
import Dataquery from "@/views/dataquery.vue";
import Sysmanage from "@/views/sysmanage.vue";
import Dataanalysis from "@/views/dataanalysis.vue";

const routes = [
  {
    path: "/",
    component: Layout,
    redirect: "/detecting", // 访问 / 时重定向到 /detecting
    children: [
      {
        path: "/detecting",
        name: "detecting",
        component: Detecting,
        meta: { keepAlive: false },
      },
      {
        path: "/signal",
        name: "signal",
        component: Signal,
        meta: { keepAlive: false },
      },
      {
        path: "/depthanalysis",
        name: "depthanalysis",
        component: Depthanalysis,
      },
      { path: "/dataquery", name: "dataquery", component: Dataquery },
      { path: "/dataanalysis", name: "dataanalysis", component: Dataanalysis },
      { path: "/sysmanage", name: "sysmanage", component: Sysmanage },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(), // 使用 hash 模式
  routes,
});

export default router;
