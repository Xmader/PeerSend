<template>
    <div>

        <md-list
            class="md-double-line"
            v-if="peersList && peersList.length > 0"
        >
            <template v-for="(item, n) of peersList">
                <md-list-item
                    v-if="!!item"
                    :key="'peer' + n + item.name"
                >
                    <md-icon :class="isInUse(n) ? 'md-warn' : 'md-primary'">person</md-icon>

                    <div class="md-list-text-container">
                        <span>
                            {{ item.name }}
                            <span
                                v-if="isInUse(n)"
                                style="color: rgba(0,0,0,.54); font-size: 14px;"
                            >
                                &nbsp;(正在向此目标收发消息)
                            </span>
                        </span>
                        <span>
                            添加时间: {{ _getLocaleDateString(item.date)}}
                        </span>
                    </div>

                    <template v-if="!isInUse(n)">
                        <md-button
                            class="md-icon-button"
                            @click="setInUse(n)"
                        >
                            <md-icon>check</md-icon>
                            <md-tooltip md-direction="top">向此目标收发消息</md-tooltip>
                        </md-button>
                    </template>

                    <md-button
                        class="md-icon-button"
                        @click="showPublicKeyE(n)"
                    >
                        <md-icon>visibility</md-icon>
                        <md-tooltip md-direction="left">显示公钥</md-tooltip>
                    </md-button>

                    <md-divider></md-divider>
                </md-list-item>
            </template>
        </md-list>

        <md-list v-else>
            <md-list-item>
                <md-icon>person_outline</md-icon>

                <div class="md-list-text-container">
                    <span>无收发目标</span>
                </div>

                <md-divider></md-divider>
            </md-list-item>
        </md-list>

        <md-layout>
            <md-button
                class="md-raised md-primary"
                style="width: 100%;"
                @click="addPeer"
            >
                添加收发目标
            </md-button>
        </md-layout>

        <show-public-key-e-dialog ref="key-e-dialog"></show-public-key-e-dialog>

    </div>
</template>

<script lang="ts">
import localforage from "localforage"
import KEY from "../core/key"
import ShowPublicKeyEDialog from "./ShowPublicKeyEDialog.vue"
import { DialogStates } from "../utils/common-types"

export interface PeerInfo {
    name: string;

    /** 创建时间 */
    date: Date;

    publicKeyE: string;
}

export default {
    components: {
        ShowPublicKeyEDialog,
    },
    data() {
        return ({
            peersList: null,
            peerInUse: 0,
        })
    },
    methods: {
        _getLocaleDateString(date: Date) {
            return new Date(date).toLocaleString()
        },
        async _emitPeerInUseEvent(n: number) {
            const peer: PeerInfo = await this.getPeerInfoByN(n)
            this.$emit("changePeer", peer)
        },
        getPeerInfoByN(n: number) {
            return this.peersList[n]
        },
        async loadPeersList() {
            const peersList: PeerInfo[] = await localforage.getItem("peersList")
            this.peersList = peersList
            return peersList
        },
        async loadPeerInUse() {
            const peerInUse: number = await localforage.getItem("peerInUse") || 0
            this.peerInUse = peerInUse

            if (this.peersList && this.peersList[peerInUse]) {
                await this._emitPeerInUseEvent(peerInUse)
            }
        },
        async savePeersList() {
            if (!Array.isArray(this.peersList)) {
                await localforage.setItem("peersList", null)
                return
            }

            const peersList: PeerInfo[] = this.peersList
            await localforage.setItem("peersList", peersList)
        },
        async savePeerInUse() {
            await localforage.setItem("peerInUse", this.peerInUse)
        },
        isInUse(n: number) {
            return n == this.peerInUse
        },
        async setInUse(n: number) {
            this.peerInUse = n
            await this.savePeerInUse()
            await this._emitPeerInUseEvent(n)
        },
        async showPublicKeyE(n: number) {
            const peer: PeerInfo = await this.getPeerInfoByN(n)
            const { publicKeyE } = peer
            this.$refs["key-e-dialog"].open(publicKeyE)
        },
        async addPeer() {
            const dialogState: DialogStates = await this._waitForDialogClose("add-peer-dialog")

            if (dialogState == "ok") {
                const name: string = this.newPeerName
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
        }
    },
    async mounted() {
        await this.loadPeersList()
        await this.loadPeerInUse()
    }
}
</script>
