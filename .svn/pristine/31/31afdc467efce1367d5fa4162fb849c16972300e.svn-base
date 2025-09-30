const spectrumData = {
  namespaced: true,
  state: () => ({
    spectrumData: {}, // 存储频谱数据
  }),
  mutations: {
    setSpectrumData(state, payload) {
      state.spectrumData = payload;
    },
  },
  actions: {
    updateSpectrumData({ commit }, data) {
      commit("setSpectrumData", data);
    },
  },
};

export default spectrumData;
