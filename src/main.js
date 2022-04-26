import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'

import VueLayers from "vuelayers";
import "vuelayers/dist/vuelayers.css";

Vue.config.productionTip = false;
Vue.use(VueLayers, { dataProjection: "EPSG:4326" });


Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
