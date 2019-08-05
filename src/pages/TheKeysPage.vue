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
                        <span>{{ item.name }}</span>
                        <span>
                            <span v-if="isInUse(n)">正在使用, </span>
                            添加时间: {{ _getLocaleString(item.date)}}
                        </span>
                    </div>

                    <!-- TODO: 导入导出 -->
                    <!--
                        <md-button
                            class="md-icon-button md-list-action"
                            @click="downloadKey(n)"
                        >
                            <md-icon>save_alt</md-icon>
                            <md-tooltip md-direction="left">导出</md-tooltip>
                        </md-button>
                    -->

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
                @click="_openAddKeyDialog"
            >
                生成并添加新密钥对
            </md-button>
        </md-layout>

        <!-- 
            TODO: 导入导出
            <md-layout>
                <md-button
                    class="md-raised md-primary"
                    style="width: 100%;"
                >
                    导入密钥对
                </md-button>
            </md-layout> 
        -->

        <md-dialog-prompt
            md-title="生成并添加新密钥对"
            md-ok-text="确定"
            md-cancel-text="取消"
            :md-esc-to-close="false"
            :md-click-outside-to-close="false"
            :md-input-maxlength="30"
            @close="addKey"
            v-model="newKeyName"
            ref="new-key-dialog"
        ></md-dialog-prompt>

        <md-dialog-alert
            :md-content="alertDialogText"
            md-ok-text="确定"
            ref="alert-dialog"
        ></md-dialog-alert>
    </div>
</template>

<script lang="ts">
import localforage from "localforage"
import KEY from "../core/key"

interface KeyListItem {
    name: string;

    /** 创建时间 */
    date: Date;
}

export default {
    data() {
        return ({
            keyList: null,
            keyInUse: 0,
            newKeyName: "",
            alertDialogText: " ",
        })
    },
    methods: {
        _getLocaleString(date: Date) {
            return new Date(date).toLocaleString()
        },
        async _emitKeyInUseEvent(n: number) {
            const item: KeyListItem = this.keyList[n]
            const keyPair = await KEY.getKeyPair(item.name)
            this.$emit("updateKeyInUse", keyPair, item)
        },
        _openAddKeyDialog() {
            this.newKeyName = new Date().toISOString()
            this.$refs["new-key-dialog"].open()
        },
        _openAlertDialog(message: string) {
            this.alertDialogText = message
            this.$refs["alert-dialog"].open()
        },
        async addKey(dialogState: "ok" | "cancel") {
            if (dialogState == "ok") {
                const keyList: KeyListItem[] = this.keyList
                const name: string = this.newKeyName

                const nameExists = keyList.some((k) => {
                    return k.name == name
                })

                if (!name) {
                    this._openAlertDialog("请输入密钥名称")
                    return
                } else if (nameExists) {
                    this._openAlertDialog("名称已被使用")
                    return
                }

                await KEY.getKeyPair(name)

                keyList.push({
                    name: name,
                    date: new Date()
                })

                await this.saveKeyList()

                await this.setInUse(keyList.length - 1)
            }
        },
        async loadKeyList() {
            const keyList: KeyListItem[] = await localforage.getItem("keyList")
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
        deleteKey(n: number) {
            const keyList: KeyListItem[] = this.keyList
            this.keyList = keyList.map((v, index) => {
                return index !== n ? v : null
            })
            this.saveKeyList()
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
