const sysInfo = {
  namespaced: true,
  state: () => ({
    sysInfo: {}, // 存储频谱数据
  }),
  mutations: {
    setSysInfo(state, payload) {
      state.sysInfo = payload;
    },
  },
  actions: {
    updateSysInfo({ commit }, data) {
      commit("setSysInfo", data);
    },
  },
};

export default sysInfo;
