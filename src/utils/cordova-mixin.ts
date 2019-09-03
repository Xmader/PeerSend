// @ts-check

import { VueComponentOptions } from "./common-types"
import { exitApp, DeviceReady } from "../utils/cordova-utils"

export const mixin: VueComponentOptions = {
    data() {
        return ({
            isCordova: false,
        })
    },
    methods: {
        exitApp() {
            exitApp()
        },
        async getIsCordova() {
            await DeviceReady.waitForCordovaLoaded()
            // @ts-ignore
            this.isCordova = true
        },
    },
    mounted() {
        this.getIsCordova()
    },
}

export default mixin
