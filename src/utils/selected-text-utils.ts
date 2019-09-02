// @ts-check

import { IntentUtils, Intent, ProcessTextExtras } from "./cordova-utils"

export namespace SelectedTextUtils {

    export const getSelectedText = async () => {
        const intent = await IntentUtils.getProcessTextIntent()
        return intent.extras["android.intent.extra.PROCESS_TEXT"]
    }

    export const replaceSelectedText = async (newText: string) => {

        const intent = await IntentUtils.getProcessTextIntent()

        if (intent.extras["android.intent.extra.PROCESS_TEXT_READONLY"]) {
            throw new Error("text is read only")
        }

        const resultI: Intent<undefined, ProcessTextExtras> = {
            extras: {
                "android.intent.extra.PROCESS_TEXT": newText,
                "android.intent.extra.PROCESS_TEXT_READONLY": false,
            }
        }
        await IntentUtils.sendIntentResult(resultI)

    }


    // const _UNIT_TEST = async () => {
    //     const text = await getSelectedText()
    //     console.log(text)

    //     const newText = text.split("").reverse().join("")
    //     await replaceSelectedText(newText)
    // }

}

export default SelectedTextUtils
