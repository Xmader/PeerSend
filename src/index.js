// @ts-check

import "core-js/stable"
import "whatwg-fetch"
import "text-encoding"

import Vue from "vue/dist/vue.runtime.esm.js"
import VueMaterial from "vue-material/dist/vue-material.js"
import VueClipboard from "vue-clipboard2"
// @ts-ignore
import App from "./App.vue"

import "./utils/cordova-utils"

// @ts-ignore
Vue.use(VueMaterial)
// @ts-ignore
Vue.use(VueClipboard)

// @ts-ignore
Vue.material.registerTheme("default", {
    primary: "blue",
    accent: "red",
    warn: "red",
})

export const vm = new Vue({
    el: "#app",
    components: {
        App
    },
    render: function (createElement) {
        return createElement("App", { ref: "App" })
    },
})
