<template>
    <div>
        <xm-container>

            <xm-blank></xm-blank>

            <xm-key-in-use-info-card
                @changePageReq="handleChangePageReq"
                :keyInUseInfo="keyInUseInfo"
                :crypoTypeText="crypoTypeText"
                :disabled="!!resultText"
            ></xm-key-in-use-info-card>

            <xm-blank></xm-blank>

            <template v-if="page == 'decrypt'">
                <md-card>
                    <div class="xm-icon-card-title">接收匿名消息</div>
                    <md-card-header style="padding-top: 8px; padding-bottom: 8px;">
                        <xm-switch
                            v-model="senderPublicKeyUnknown"
                            @change="onToggleSenderKeyUnknown"
                            :disabled="!!resultText"
                        >（发送方公钥未知）</xm-switch>
                    </md-card-header>
                </md-card>

                <xm-blank></xm-blank>
            </template>

            <template v-if="!senderPublicKeyUnknown">
                <xm-peer-in-use-info-card
                    @changePageReq="handleChangePageReq"
                    :peerInUseInfo="peerInUseInfo"
                    :page="page"
                    :disabled="!!resultText"
                ></xm-peer-in-use-info-card>

                <xm-blank></xm-blank>
            </template>

            <template v-if="!actionMode">
                <template v-if="!resultText">

                    <xm-input-text-card
                        :title="`请输入要${crypoTypeText}的文本：`"
                        v-model="rawText"
                    ></xm-input-text-card>

                    <xm-blank></xm-blank>

                    <md-button
                        class="md-raised md-primary xm-button"
                        :disabled="!rawText || !keyInUseInfo || !(senderPublicKeyUnknown || peerInUseInfo)"
                        @click="commit"
                    >
                        {{ crypoTypeText }}
                    </md-button>

                </template>

                <template v-else>

                    <!-- verified -->
                    <template v-if="this.page == 'decrypt'">
                        <xm-icon-card
                            v-if="verified"
                            title="密文已确认来自发送方本人"
                            icon="verified_user"
                            content="数字签名校验一致"
                            content-subhead="这有助于在互联网上保证信息传输的完整性，防止中间人攻击篡改消息，以及验证发送者的身份、验证文本来源的真实性（并非内容来源的真实性）。"
                        ></xm-icon-card>

                        <xm-icon-card
                            v-else-if="!senderPublicKeyUnknown && decryptSucceeded !== false"
                            :active="false"
                            title="密文并非来自发送方本人"
                            icon="clear"
                            content="数字签名校验失败"
                            content-subhead="密文可能已经被篡改。 （是不是发送方选择错误了？如果你不知道发送方的公钥，请启用接收匿名消息）"
                        ></xm-icon-card>

                        <xm-blank></xm-blank>
                    </template>

                    <xm-input-text-card
                        :title="this.page == 'encrypt' ? '密文：' : '原始文本：'"
                        :readonly="true"
                        :value="resultText"
                    ></xm-input-text-card>

                    <xm-blank></xm-blank>

                    <md-button
                        :disabled="decryptSucceeded == false"
                        class="md-raised md-primary xm-button"
                        v-clipboard:copy="resultText"
                        v-clipboard:success="() => handleCopyStatus(true)"
                        v-clipboard:error="() => handleCopyStatus(false)"
                    >
                        复制
                    </md-button>

                    <xm-blank></xm-blank>

                    <template v-if="isCordova">
                        <md-button
                            class="md-raised md-primary xm-button"
                            @click="shareText"
                        >
                            发送到…
                        </md-button>

                        <xm-blank></xm-blank>
                    </template>

                    <md-button
                        class="md-raised md-primary xm-button"
                        @click="resetText"
                    >
                        重置
                    </md-button>

                </template>
            </template>

            <!-- in action mode -->
            <template v-else>
                <xm-input-text-card
                    title="选中的的文本："
                    v-model="rawText"
                    readonly
                ></xm-input-text-card>

                <xm-blank></xm-blank>

                <md-button
                    class="md-raised md-primary xm-button"
                    :disabled="!rawText || !keyInUseInfo || !(senderPublicKeyUnknown || peerInUseInfo)"
                    @click="actionCommit"
                >
                    {{ crypoTypeText }}
                </md-button>

                <xm-blank></xm-blank>

                <md-button
                    class="md-raised md-primary xm-button"
                    @click="exitApp"
                >
                    取消
                </md-button>
            </template>

            <xm-blank></xm-blank>

        </xm-container>

        <xm-snackbar
            ref="copy-snackbar"
            text="复制"
            :status="copySucceeded"
        ></xm-snackbar>

        <xm-snackbar
            ref="decrypt-snackbar"
            text="解密"
            :status="decryptSucceeded"
        ></xm-snackbar>
    </div>
</template>

<script lang="ts">
import localforage from "localforage"

import xmContainer from "../components/xmContainer.vue"
import xmBlank from "../components/xmBlank.vue"
import xmSwitch from "../components/xmSwitch.vue"
import xmIconCard from "../components/xmIconCard.vue"

import xmSnackbar from "../components/xmSnackbar.vue"

import xmKeyInUseInfoCard from "../components/xmKeyInUseInfoCard.vue"
import xmPeerInUseInfoCard from "../components/xmPeerInUseInfoCard.vue"

import xmInputTextCard from "../components/xmInputTextCard.vue"

import { KeyInfo } from "./TheKeysPage.vue"
import { PeerInfo } from "./ThePeersPage.vue"

import * as CORE from "../core/core"
import SelectedTextUtils from "../utils/selected-text-utils"
import SendActionUtils from "../utils/send-action-utils"

import CordovaMixin from "../utils/cordova-mixin"

import { ActionModes, ActionModeToGetTextFnMap } from "../utils/action-modes"

export default {
    components: {
        xmBlank,
        xmContainer,
        xmSwitch,
        xmIconCard,
        xmKeyInUseInfoCard,
        xmPeerInUseInfoCard,
        xmInputTextCard,
        xmSnackbar,
    },
    mixins: [
        CordovaMixin
    ],
    props: {
        /** type: KeyInfo */
        keyInUseInfo: Object,

        /** type: PeerInfo */
        peerInUseInfo: Object,

        actionMode: [Boolean, ActionModes],

        page: {
            type: String,
            required: true,
            validator(value: string) {
                return ["encrypt", "decrypt"].includes(value)
            }
        },
    },
    computed: {
        crypoTypeText() {
            if (this.page == "encrypt") {
                return "加密"
            } else {
                return "解密"
            }
        },
    },
    data() {
        return ({
            rawText: null,
            resultText: null,
            copySucceeded: null,
            decryptSucceeded: null,
            senderPublicKeyUnknown: false,
            verified: null,
        })
    },
    watch: {
        actionMode() {
            this.loadActionModeText()
        }
    },
    methods: {
        handleChangePageReq(pageId: string) {
            this.$emit("changePageReq", pageId)
        },
        resetText() {
            this.rawText = null
            this.resultText = null
            this.verified = null
            this.decryptSucceeded = null
        },
        async shareText() {
            const resultText: string = this.resultText
            await SendActionUtils.shareText(resultText)
        },
        handleCopyStatus(status: boolean) {
            this.copySucceeded = status
            this.$refs["copy-snackbar"].open()
        },
        async commit() {
            const keyInUseInfo: KeyInfo = this.keyInUseInfo
            const peerInUseInfo: PeerInfo = this.peerInUseInfo

            const text: string = this.rawText

            const peerPublicKeyE = this.senderPublicKeyUnknown ? undefined : peerInUseInfo.publicKeyE
            const selfPrivateKey = keyInUseInfo.keyPair.privateKey

            let resultText: string
            if (this.page == "encrypt") {

                resultText = await CORE.encryptAndSign2({
                    type: CORE.DataType.text,
                    data: text,
                }, peerPublicKeyE, selfPrivateKey)

            } else if (this.page == "decrypt") {
                try {

                    const dataObj = await CORE.decryptAndVerify2(text, selfPrivateKey, peerPublicKeyE)

                    this.verified = dataObj.verified

                    resultText = dataObj.data as string

                } catch (err) {
                    console.error(err)
                    this.decryptSucceeded = false
                    this.$refs["decrypt-snackbar"].open()
                    resultText = "(解密失败)"
                }
            } else {
                throw new Error("unknown page name")
            }

            this.resultText = resultText
        },
        async actionCommit() {
            const actionCommitFnMap = {
                [ActionModes.PROCESS_TEXT_ACTION]: this.actionReplaceTextCommit,
                [ActionModes.SEND_TEXT_ACTION]: this.actionShareText,
            }
            const actionCommitFn = actionCommitFnMap[this.actionMode] || this.actionShareText
            await actionCommitFn()
        },
        async actionReplaceTextCommit() {
            await this.commit()
            await SelectedTextUtils.replaceSelectedText(this.resultText)
        },
        async actionShareText() {
            await this.commit()
            await this.shareText()
        },
        async loadActionModeText() {
            if (this.actionMode) {
                const getTextFn = ActionModeToGetTextFnMap[this.actionMode]
                this.rawText = await getTextFn()
            }
        },
        onToggleSenderKeyUnknown(value: boolean) {
            localforage.setItem("senderPublicKeyUnknown", value)
        },
        async loadIsToggleSenderKeyUnknown() {
            if (this.page == "decrypt") {
                const value: boolean = await localforage.getItem("senderPublicKeyUnknown")
                this.senderPublicKeyUnknown = value
            } else {
                this.senderPublicKeyUnknown = false
            }
        },
    },
    mounted() {
        this.getIsCordova()
        this.loadIsToggleSenderKeyUnknown()
        this.loadActionModeText()
    },
}
</script>

<style>
    .xm-button {
        width: 100%;
        margin: 0;
    }
</style>
