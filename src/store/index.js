import { createStore } from "vuex";
import spectrumData from "./modules/spectrumData";
import signalData from "./modules/signalData";
import wifiData from "./modules/wifiData";
import btData from "./modules/btData";
import sysInfo from "./modules/sysInfo";
const store = createStore({
  state:{
    minDifference: 0.012500000,
    deviceState:0,
  },
  modules: {
    spectrumData,
    signalData,
    wifiData,
    btData,
    sysInfo,
  },
});

export default store;
