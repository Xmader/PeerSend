<template>
    <div>
        <md-list
            class="md-double-line"
            v-if="keyList && keyList.length > 0"
        >
            <template v-for="(item, n) of keyList">
                <md-list-item
                    v-if="!!item"
                    :key="'key' + n + item.name"
                >
                    <md-icon :class="isInUse(n) ? 'md-warn' : 'md-primary'">vpn_key</md-icon>

                    <div class="md-list-text-container">
                        <span>
                            {{ item.name }}
                            <span
                                v-if="isInUse(n)"
                                style="color: rgba(0,0,0,.54); font-size: 14px;"
                            >
                                &nbsp;(正在使用)
                            </span>
                        </span>
                        <span>
                            创建时间: {{ _getLocaleDateString(item.date)}}
                        </span>
                    </div>

                    <template v-if="!isInUse(n)">
                        <md-button
                            class="md-icon-button"
                            @click="deleteKey(n)"
                        >
                            <md-icon>delete</md-icon>
                            <md-tooltip md-direction="top">删除</md-tooltip>
                        </md-button>

                        <md-button
                            class="md-icon-button"
                            @click="setInUse(n)"
                        >
                            <md-icon>check</md-icon>
                            <md-tooltip md-direction="top">使用此密钥对</md-tooltip>
                        </md-button>
                    </template>

                    <template v-else>
                        <md-button
                            class="md-icon-button"
                            @click="downloadKey(n)"
                        >
                            <md-icon>save_alt</md-icon>
                            <md-tooltip md-direction="left">导出</md-tooltip>
                        </md-button>

                        <md-button
                            class="md-icon-button"
                            @click="showPublicKeyE(n)"
                        >
                            <md-icon>visibility</md-icon>
                            <md-tooltip md-direction="left">显示公钥</md-tooltip>
                        </md-button>
                    </template>

                    <md-divider></md-divider>
                </md-list-item>
            </template>
        </md-list>

        <md-list v-else>
            <md-list-item>
                <md-icon>vpn_key</md-icon>

                <div class="md-list-text-container">
                    <span>无密钥对</span>
                </div>

                <md-divider></md-divider>
            </md-list-item>
        </md-list>

        <md-layout>
            <md-button
                class="md-raised md-primary"
                style="width: 100%;"
                @click="addKey"
            >
                生成并添加新密钥对
            </md-button>
        </md-layout>

        <md-layout>
            <md-button
                class="md-raised md-primary"
                style="width: 100%;"
                @click="uploadKey"
            >
                导入密钥对
            </md-button>
        </md-layout>

        <md-dialog-prompt
            md-title="生成并添加新密钥对"
            md-ok-text="确定"
            md-cancel-text="取消"
            :md-esc-to-close="false"
            :md-click-outside-to-close="false"
            :md-input-maxlength="30"
            v-model="newKeyName"
            ref="new-key-dialog"
        ></md-dialog-prompt>

        <md-dialog-confirm
            md-content="确定要删除所选密钥对？"
            md-ok-text="确定"
            md-cancel-text="取消"
            ref="delete-key-dialog"
        ></md-dialog-confirm>

        <upload-key-dialog ref="upload-key-dialog"></upload-key-dialog>

        <show-public-key-e-dialog ref="key-e-dialog"></show-public-key-e-dialog>

        <md-dialog-alert
            :md-title="alertDialogTitle"
            :md-content="alertDialogText"
            md-ok-text="确定"
            ref="alert-dialog"
        ></md-dialog-alert>

        <xm-snackbar
            ref="snackbar"
            :text="`保存到 <手机根目录>/Download/${snackbarFileName} `"
            :status="true"
        ></xm-snackbar>
    </div>
</template>

<script lang="ts">
import localforage from "localforage"
import CrossFileSaver from "../utils/cross-file-saver"
import KEY from "../core/key"
import RSA from "../core/rsa"

import UploadKeyDialog, { KeyFileExt } from "../components/UploadKeyDialog.vue"
import ShowPublicKeyEDialog from "../components/ShowPublicKeyEDialog.vue"
import xmSnackbar from "../components/xmSnackbar.vue"

import { DialogStates } from "../utils/common-types"
import dialogEventMixin from "../utils/dialog-event-mixin"
import baseUtilsMixin from "../utils/base-utils-mixin"
import CordovaMixin from "../utils/cordova-mixin"

export interface KeyListItem {
    name: string;

    /** 创建时间 */
    date: Date;
}

export interface KeyInfo extends KeyListItem {
    keyPair: CryptoKeyPair;
}

export namespace KeyInfoSerializer {

    export interface SerializedObj {
        name: string;
        date: string;
        keyPair: {
            privateKey: JsonWebKey;
            publicKey: JsonWebKey;
        };
    }

    const N = 0x27

    /** exportKeyInfoData */
    export const serialize = async (keyInfo: KeyInfo): Promise<Uint8Array> => {
        const { keyPair: { privateKey, publicKey }, name, date } = keyInfo
        const obj: SerializedObj = {
            name,
            date: new Date(date).toISOString(),
            keyPair: {
                privateKey: await RSA.exportKeyObj(privateKey),
                publicKey: await RSA.exportKeyObj(publicKey),
            }
        }
        const json = JSON.stringify(obj)
        const data = new TextEncoder().encode(json).map(v => v ^ N)
        return data
    }

    export const deserialize = async (keyInfoData: Uint8Array): Promise<KeyInfo> => {
        const json = new TextDecoder().decode(keyInfoData.map(v => v ^ N))
        const obj: SerializedObj = JSON.parse(json)
        const { keyPair: { privateKey: privateKeyObj, publicKey: publicKeyObj }, name, date } = obj
        return {
            name,
            date: new Date(date),
            keyPair: {
                privateKey: await RSA.importKeyObj(privateKeyObj, "RSA-PSS", ["sign"]),
                publicKey: await RSA.importKeyObj(publicKeyObj, "RSA-PSS", ["verify"]),
            }
        }
    }

}

export default {
    components: {
        xmSnackbar,
        UploadKeyDialog,
        ShowPublicKeyEDialog,
    },
    mixins: [
        baseUtilsMixin,
        dialogEventMixin,
        CordovaMixin,
    ],
    data() {
        return ({
            keyList: [],
            keyInUse: 0,
            newKeyName: "",
            alertDialogText: " ",
            alertDialogTitle: undefined,
            snackbarFileName: null,
            eventNames: [
                "updateKeyInUse",
                "changeKeyInUse",
                "changeKey"
            ],
        })
    },
    methods: {
        async _emitKeyInUseEvent(n: number) {
            const keyInfo: KeyInfo = await this.getKeyInfoByN(n)
            this.eventNames.forEach((name: string) => {
                this.$emit(name, keyInfo)
            })
        },
        _openAlertDialog(message: string, title?: string) {
            this.alertDialogText = message
            this.alertDialogTitle = title || undefined
            this.$refs["alert-dialog"].open()
        },
        _isNameExisted(name: string, keyList: KeyListItem[] = this.keyList) {
            return keyList.some((item) => {
                if (item && item.name) {
                    return item.name == name
                }
            })
        },
        async _addKeyListItem(item: KeyListItem) {
            const keyList: KeyListItem[] = this.keyList
            keyList.push(item)
            await this.saveKeyList()
            await this.setInUse(keyList.length - 1)
        },
        async getKeyInfoByN(n: number) {
            const item: KeyListItem = this.keyList[n]
            const keyPair = await KEY.getKeyPair(item.name)
            const keyInfo: KeyInfo = {
                keyPair,
                ...item,
            }
            return keyInfo
        },
        async addKey() {
            this.newKeyName = new Date().toISOString()

            const dialogState: DialogStates = await this._waitForDialogClose("new-key-dialog")

            if (dialogState == "ok") {
                const name: string = this.newKeyName
                const nameExists: boolean = this._isNameExisted(name)

                if (!name) {
                    this._openAlertDialog("请输入密钥名称")
                    return
                } else if (nameExists) {
                    this._openAlertDialog("名称已被使用")
                    return
                }

                await KEY.getKeyPair(name)

                await this._addKeyListItem({
                    name: name,
                    date: new Date()
                })
            }
        },
        async loadKeyList() {
            const keyList: KeyListItem[] = await localforage.getItem("keyList") || []
            this.keyList = keyList
            return keyList
        },
        async loadKeyInUse() {
            const keyInUse: number = await localforage.getItem("keyInUse") || 0
            this.keyInUse = keyInUse

            if (this.keyList && this.keyList[keyInUse]) {
                await this._emitKeyInUseEvent(keyInUse)
            }
        },
        async saveKeyList() {
            if (!Array.isArray(this.keyList)) {
                await localforage.setItem("keyList", null)
                return
            }

            const keyList: KeyListItem[] = this.keyList
            await localforage.setItem("keyList", keyList)
        },
        async saveKeyInUse() {
            await localforage.setItem("keyInUse", this.keyInUse)
        },
        async deleteKey(keyToDelete: number) {
            const dialogState: DialogStates = await this._waitForDialogClose("delete-key-dialog")
            if (dialogState == "ok") {

                const { name }: KeyListItem = this.keyList[keyToDelete]

                // delete from keyList
                const keyList: KeyListItem[] = this.keyList
                this.keyList = keyList.map((item, index) => {
                    return index !== keyToDelete ? item : null
                })
                this.saveKeyList()

                // delete from localforage
                await localforage.dropInstance({ name })
            }
        },
        async downloadKey(n: number) {
            const keyInfo: KeyInfo = await this.getKeyInfoByN(n)
            const keyInfoData = await KeyInfoSerializer.serialize(keyInfo)
            const fileName = `${keyInfo.name}${KeyFileExt}`
            this.snackbarFileName = fileName
            await CrossFileSaver.saveAs(keyInfoData, fileName)
            if (this.isCordova) {
                this.$refs["snackbar"].open()
            }
        },
        async uploadKey() {
            const [keyInfo]: [KeyInfo] = await this._waitForDialogEvent("upload-key-dialog", "uploaded")

            const { name, date } = keyInfo
            const nameExists: boolean = this._isNameExisted(name)
            if (nameExists) {
                this._openAlertDialog("存在同名密钥对")
                return
            }

            await KEY.saveKeyPair(name, keyInfo.keyPair)

            await this._addKeyListItem({
                name,
                date,
            })
        },
        async showPublicKeyE(n: number) {
            const keyInfo: KeyInfo = await this.getKeyInfoByN(n)
            const publicKeyE = await KEY.exportPublicKeyE(keyInfo.keyPair.publicKey)
            this.$refs["key-e-dialog"].open(publicKeyE)
        },
        isInUse(n: number) {
            return n == this.keyInUse
        },
        async setInUse(n: number) {
            this.keyInUse = n
            await this.saveKeyInUse()
            await this._emitKeyInUseEvent(n)
        },
    },
    async mounted() {
        await this.loadKeyList()
        await this.loadKeyInUse()
    }
}
</script>
