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
                            @click="deletePeer(n)"
                        >
                            <md-icon>delete</md-icon>
                            <md-tooltip md-direction="top">删除</md-tooltip>
                        </md-button>

                        <md-button
                            class="md-icon-button"
                            @click="setInUse(n)"
                        >
                            <md-icon>check</md-icon>
                            <md-tooltip md-direction="top">向此目标收发消息</md-tooltip>
                        </md-button>
                    </template>

                    <md-button
                        v-else
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

        <add-peer-dialog ref="add-peer-dialog"></add-peer-dialog>
        <show-public-key-e-dialog ref="key-e-dialog"></show-public-key-e-dialog>

        <md-dialog-confirm
            md-content="确定要删除所选收发目标？"
            md-ok-text="确定"
            md-cancel-text="取消"
            ref="delete-peer-dialog"
        ></md-dialog-confirm>

    </div>
</template>

<script lang="ts">
import localforage from "localforage"
import AddPeerDialog from "../components/AddPeerDialog.vue"
import ShowPublicKeyEDialog from "../components/ShowPublicKeyEDialog.vue"
import dialogEventMixin from "../utils/dialog-event-mixin"
import baseUtilsMixin from "../utils/base-utils-mixin"
import { DialogStates } from "../utils/common-types"

export interface PeerInfo {
    name: string;

    /** 创建时间 */
    date: Date;

    publicKeyE: string;
}

export const getPeersList = async () => {
    const peersList: PeerInfo[] = await localforage.getItem("peersList")
    return peersList || []
}

export default {
    components: {
        AddPeerDialog,
        ShowPublicKeyEDialog,
    },
    mixins: [
        baseUtilsMixin,
        dialogEventMixin,
    ],
    data() {
        return ({
            peersList: [],
            peerInUse: 0,
        })
    },
    methods: {
        async _emitPeerInUseEvent(n: number) {
            const peer: PeerInfo = await this.getPeerInfoByN(n)
            this.$emit("changePeer", peer)
        },
        async _addPeersListItem(item: PeerInfo) {
            const peersList: PeerInfo[] = this.peersList
            peersList.push(item)
            await this.savePeersList()
            await this.setInUse(peersList.length - 1)
        },
        getPeerInfoByN(n: number) {
            return this.peersList[n]
        },
        async loadPeersList() {
            const peersList = await getPeersList()
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
            const [peerInfo]: [PeerInfo] = await this._waitForDialogEvent("add-peer-dialog", "add")

            if (peerInfo) {
                console.log("new peerInfo", peerInfo)
                await this._addPeersListItem(peerInfo)
            }
        },
        async deletePeer(n: number) {
            const dialogState: DialogStates = await this._waitForDialogClose("delete-peer-dialog")
            if (dialogState == "ok") {
                const peersList: PeerInfo[] = this.peersList
                this.peersList = peersList.map((item, index) => {
                    return index !== n ? item : null
                })
                this.savePeersList()
            }
        },
    },
    async mounted() {
        await this.loadPeersList()
        await this.loadPeerInUse()
    }
}
</script>
