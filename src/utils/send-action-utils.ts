// @ts-check

import { IntentUtils } from "./cordova-utils"
import WechatMessageTextParser from "wechat-msg-text-parser"

export namespace SendActionUtils {

    export const getSentText = async () => {
        const intent = await IntentUtils.getSendActionIntent()

        const text: string = intent.extras["android.intent.extra.TEXT"]

        if (!text) {
            return ""
        } else if (intent.type == "message/rfc822") {
            // 微信多选消息分享出的消息文本解析器
            // (标注 MIME 类型为 message/rfc822 ，但实际并不是)
            const msgs = WechatMessageTextParser.parse(text)
            return msgs[0].text
        } else {
            return text
        }
    }

    export const shareText = async (text: string) => {
        const intent = IntentUtils.createChooser({
            action: "android.intent.action.SEND",
            type: "text/plain",
            extras: {
                "android.intent.extra.TEXT": text,
            },
            clipItems: [
                {
                    text: text,
                },
            ],
        }, "发送到…")
        await IntentUtils.startActivity(intent)
    }

    /**
     * @alias SendActionUtils.shareText
     */
    export const sendText = shareText

}

export default SendActionUtils
