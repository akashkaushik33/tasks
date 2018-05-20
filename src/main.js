// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueClipboard from 'vue-clipboard2'
import VModal from 'vue-js-modal'
import ToggleButton from 'vue-js-toggle-button'
import lodash from 'lodash'

window.blockstack = require('blockstack')
window.axios = require('axios')

Vue.use(VueClipboard)
Vue.use(VModal)
Vue.use(lodash)
Vue.use(ToggleButton)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
