<template>
    <div>
        <xm-container>

            <xm-blank></xm-blank>

            <xm-key-in-use-info-card
                @changePageReq="handleChangePageReq"
                :keyInUseInfo="keyInUseInfo"
            ></xm-key-in-use-info-card>

            <xm-blank></xm-blank>

            <xm-peer-in-use-info-card
                @changePageReq="handleChangePageReq"
                :peerInUseInfo="peerInUseInfo"
            ></xm-peer-in-use-info-card>

            <xm-blank></xm-blank>

            <template v-if="!actionMode">
                <template v-if="!encryptedText">

                    <xm-input-text-card
                        title="请输入要加密的文本："
                        v-model="rawText"
                    ></xm-input-text-card>

                    <xm-blank></xm-blank>

                    <md-button
                        class="md-raised md-primary xm-button"
                        :disabled="!keyInUseInfo || !peerInUseInfo || !rawText"
                        @click="commit"
                    >
                        加密
                    </md-button>

                </template>

                <template v-else>

                    <xm-input-text-card
                        title="密文："
                        :readonly="true"
                        :value="encryptedText"
                    ></xm-input-text-card>

                    <xm-blank></xm-blank>

                    <md-button
                        class="md-raised md-primary xm-button"
                        v-clipboard:copy="encryptedText"
                        v-clipboard:success="() => handleCopyStatus(true)"
                        v-clipboard:error="() => handleCopyStatus(false)"
                    >
                        复制
                    </md-button>

                    <xm-blank></xm-blank>

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
                    :disabled="!keyInUseInfo || !peerInUseInfo || !rawText"
                    @click="actionCommit"
                >
                    加密
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

        <copy-snackbar
            ref="copy-snackbar"
            :status="copySucceeded"
        ></copy-snackbar>
    </div>
</template>

<script lang="ts">
import xmContainer from "../components/xmContainer.vue"
import xmBlank from "../components/xmBlank.vue"

import CopySnackbar from "../components/CopySnackbar.vue"

import xmKeyInUseInfoCard from "../components/xmKeyInUseInfoCard.vue"
import xmPeerInUseInfoCard from "../components/xmPeerInUseInfoCard.vue"

import xmInputTextCard from "../components/xmInputTextCard.vue"

import { KeyInfo } from "./TheKeysPage.vue"
import { PeerInfo } from "./ThePeersPage.vue"

import * as CORE from "../core/core"
import { SelectedTextUtils, exitApp } from "../utils/cordova-utils"

export default {
    components: {
        xmBlank,
        xmContainer,
        xmKeyInUseInfoCard,
        xmPeerInUseInfoCard,
        xmInputTextCard,
        CopySnackbar,
    },
    props: {
        /** type: KeyInfo */
        keyInUseInfo: Object,

        /** type: PeerInfo */
        peerInUseInfo: Object,

        actionMode: Boolean,
    },
    data() {
        return ({
            rawText: null,
            encryptedText: null,
            copySucceeded: null,
        })
    },
    watch: {
        actionMode() {
            this.loadActionModeSelectedText()
        }
    },
    methods: {
        handleChangePageReq(pageId: string) {
            this.$emit("changePageReq", pageId)
        },
        resetText() {
            this.rawText = null
            this.encryptedText = null
        },
        handleCopyStatus(status: boolean) {
            this.copySucceeded = status
            this.$refs["copy-snackbar"].open()
        },
        async commit() {
            const keyInUseInfo: KeyInfo = this.keyInUseInfo
            const peerInUseInfo: PeerInfo = this.peerInUseInfo

            const text: string = this.rawText

            const peerPublicKeyE = peerInUseInfo.publicKeyE
            const selfPrivateKey = keyInUseInfo.keyPair.privateKey

            const encryptedText = await CORE.encryptAndSign2({
                type: CORE.DataType.text,
                data: text,
            }, peerPublicKeyE, selfPrivateKey)

            this.encryptedText = encryptedText
        },
        async actionCommit() {
            await this.commit()
            await SelectedTextUtils.replaceSelectedText(this.encryptedText)
        },
        async loadActionModeSelectedText() {
            if (this.actionMode) {
                this.rawText = await SelectedTextUtils.getSelectedText()
            }
        },
        exitApp() {
            exitApp()
        }
    },
    mounted() {
        this.loadActionModeSelectedText()
    },
}
</script>

<style>
    .xm-button {
        width: 100%;
        margin: 0;
    }
</style>
