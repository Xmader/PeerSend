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

    clipItems?: object[];

    /** 
     * IntentShim 的私有 key，用于指示用 createChooser 包装 intent，值为创建的 chooser 的 title
     * 
     * IntentShim.java:581
     * ```java
     * if (obj.has("chooser")) {
     *      i = Intent.createChooser(i, obj.getString("chooser"));
     * }
     *  ```
     */
    chooser?: string;
}

export interface ProcessTextExtras {
    "android.intent.extra.PROCESS_TEXT": string;
    "android.intent.extra.PROCESS_TEXT_READONLY"?: boolean;
}

export type ProcessTextIntent = Intent<"android.intent.action.PROCESS_TEXT", ProcessTextExtras>

export interface SendActionExtras {
    "android.intent.extra.SUBJECT"?: string;
    "android.intent.extra.TEXT"?: string;
    "android.intent.extra.STREAM": string;
}

export type SendActionIntent = Intent<"android.intent.action.SEND_MULTIPLE" | "android.intent.action.SEND", SendActionExtras>

export namespace IntentUtils {

    const _isProcessTextIntent = (intent: ProcessTextIntent) => {
        return intent.action == "android.intent.action.PROCESS_TEXT"
    }

    const _isSendActionIntent = (intent: SendActionIntent) => {
        return intent.action == "android.intent.action.SEND"
            || intent.action == "android.intent.action.SEND_MULTIPLE"
    }

    export const getIntent = (): Promise<Intent> => {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            window.plugins.intentShim.getIntent(resolve, reject)
        })
    }

    export const getProcessTextIntent = async (throwErr = true): Promise<ProcessTextIntent> => {
        const intent = await getIntent()
        if (_isProcessTextIntent(intent)) {
            return intent
        } else if (throwErr) {
            throw new TypeError("intent is not a ProcessTextIntent")
        }
    }

    export const getSendActionIntent = async (throwErr = true): Promise<SendActionIntent> => {
        const intent = await getIntent()
        if (_isSendActionIntent(intent)) {
            return intent
        } else if (throwErr) {
            throw new TypeError("intent is not a SendActionIntent")
        }
    }

    export const sendIntentResult = (intent: Intent): Promise<"OK"> => {
        return new Promise((resolve) => {
            // @ts-ignore
            window.plugins.intentShim.sendResult(intent, resolve)
        })
    }

    export const startActivity = (intent: Intent): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            window.plugins.intentShim.startActivity(intent, resolve, reject)
        })
    }

    /**
     * a wrapper of [Intent.createChooser()](https://developer.android.com/reference/android/content/Intent.html#createChooser(android.content.Intent,%20java.lang.CharSequence))
     * @returns a [ACTION_CHOOSER](https://developer.android.com/reference/android/content/Intent.html#ACTION_CHOOSER) Intent 
     */
    export const createChooser = (target: Intent, title?: string): Intent => {
        return {
            ...target,
            chooser: title,
        }
    }

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
