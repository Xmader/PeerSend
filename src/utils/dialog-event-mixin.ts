import { Vue, VueComponentOptions, DialogStates } from "./common-types"

export const mixin: VueComponentOptions = {
    methods: {
        async _waitForDialogEvent(ref: string, event: string): Promise<any[]> {
            const dialog = this.$refs[ref] as Vue

            // @ts-ignore
            dialog.open()

            return new Promise((resolve) => {
                dialog.$on(event, (...args) => {
                    resolve(args)
                })
            })
        },
        async _waitForDialogClose(ref: string): Promise<DialogStates> {
            // @ts-ignore
            const [dialogState]: [DialogStates] = await this._waitForDialogEvent(ref, "close")
            return dialogState
        },
    },
}

export default mixin
