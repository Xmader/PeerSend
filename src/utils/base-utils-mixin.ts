import { VueComponentOptions } from "./common-types"

export const mixin: VueComponentOptions = {
    methods: {
        _getLocaleDateString(date: Date) {
            return new Date(date).toLocaleString()
        },
    },
}

export default mixin
