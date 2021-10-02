import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
const dotenv = require('dotenv')
dotenv.config()
axios.defaults.baseURL = process.env.VUE_APP_API_URL
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    axios : axios,
    user: localStorage.getItem('user') != null ? localStorage.getItem('user') : {}
  },
  getters: {
    axios(state) {
      return state.axios
    },
    user(state) {
      return state.user
    }
  },
  mutations: {
    setUser(state, newValue) {
      state.user = newValue;
    },
  },
  actions: {
  },
  modules: {
  }
})
