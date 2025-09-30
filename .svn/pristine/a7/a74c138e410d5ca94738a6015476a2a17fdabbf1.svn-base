const signalData = {
    namespaced: true,
    state: () => ({
        signalData: {}, // 存储频谱数据
    }),
    mutations: {
      setSignalData(state, payload) {
        state.signalData = payload;
      },
    },
    actions: {
      updateSignalData({ commit }, data) {
        commit("setSignalData", data);
      },
    },
  };
  
  export default signalData;
  