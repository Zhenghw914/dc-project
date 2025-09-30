import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Vant from "vant";
import store from "./store";
import "vant/lib/index.css";
import "@/utils/webviewBridge"; // 引入回调函数
// 全局注册 SvgIcon 组件
import SvgIcon from "@/components/SvgIcon/SvgIcon.vue";
const app = createApp(App);
app.component("SvgIcon", SvgIcon);
app.use(router); // 使用 Vue Router
app.use(Vant);
app.use(store);
app.mount("#app");
