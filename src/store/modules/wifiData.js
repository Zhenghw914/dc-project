const wifiData = {
    namespaced: true,
    state: () => ({
        wifiData: {}, // 存储频谱数据
    }),
    mutations: {
      setwifiData(state, payload) {
        state.wifiData = payload;
      },
    },
    actions: {
      updatewifiData({ commit }, data) {
        commit("setwifiData", data);
      },
    },
  };
  
  export default wifiData;
  