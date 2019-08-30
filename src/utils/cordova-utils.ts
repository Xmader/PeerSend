// @ts-check

export interface Intent<ActionName extends string = any, Extras extends {} = any> {
    /** e.g. "android.intent.action.PROCESS_TEXT" */
    action?: ActionName;

    /** e.g. "{android.intent.category.LAUNCHER}" */
    categories?: string;

    /** e.g. "ComponentInfo{com.xxx.xxx/com.xxx.xxx.MainActivity}" */
    component?: string;

    extras?: Extras;

    flags?: number;

    /** e.g. "text/plain" */
    type?: string;
}

interface ProcessTextExtras {
    "android.intent.extra.PROCESS_TEXT": string;
    "android.intent.extra.PROCESS_TEXT_READONLY"?: boolean;
}

export type ProcessTextIntent = Intent<"android.intent.action.PROCESS_TEXT", ProcessTextExtras>


export namespace IntentUtils {

    const _isProcessTextIntent = (intent: Intent) => {
        return intent.action == "android.intent.action.PROCESS_TEXT"
    }

    export const getIntent = (): Promise<Intent> => {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            window.plugins.intentShim.getIntent(resolve, reject)
        })
    }

    export const getProcessTextIntent = async (throwErr = true): Promise<ProcessTextIntent> => {
        const intent = await getIntent()
        if (!_isProcessTextIntent(intent) && throwErr) {
            throw new TypeError("intent is not a ProcessTextIntent")
        }
        return intent
    }

    export const sendIntentResult = (intent: Intent): Promise<"OK"> => {
        return new Promise((resolve) => {
            // @ts-ignore
            window.plugins.intentShim.sendResult(intent, resolve)
        })
    }

}

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
                "android.intent.extra.PROCESS_TEXT": newText
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

export const exitApp = () => {
    // @ts-ignore
    navigator.app.exitApp()
}

export namespace DeviceReady {

    let _deviceready = false

    /**
     * 等待 Cordova 完全加载
     */
    export const waitForCordovaLoaded = async (): Promise<void> => {
        if (!_deviceready) {
            await new Promise((resolve) => {
                document.addEventListener("deviceready", () => {
                    _deviceready = true
                    resolve()
                }, { once: true })
            })
        }
    }

    waitForCordovaLoaded()

}
