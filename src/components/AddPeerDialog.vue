
<template>
    <md-dialog ref="dialog">
        <md-dialog-title>添加收发目标</md-dialog-title>

        <md-dialog-content>
            <md-input-container :class="{ 'md-input-invalid': !nameValid }">
                <label>名称</label>
                <md-input
                    v-model="name"
                    required
                ></md-input>
                <span class="md-error">名称不能重复</span>
            </md-input-container>

            <md-input-container :class="{ 'md-input-invalid': !keyEValid }">
                <label>公钥</label>
                <md-textarea
                    v-model="keyE"
                    required
                ></md-textarea>
                <span class="md-error">请输入有效的公钥</span>
            </md-input-container>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button @click="close()">
                取消
            </md-button>

            <md-button
                class="md-primary"
                @click="commit"
                :disabled="!keyEValid || !nameValid || locked"
            >
                添加
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script lang="ts">
import { PeerInfo, getPeersList } from "../pages/ThePeersPage.vue"
import KEY from "../core/key"

export default {
    data: () => ({
        _peersList: null,
        name: null,
        keyE: null,
        keyEValid: null,
        locked: false,
    }),
    watch: {
        async keyE() {
            this.locked = true

            try {
                await KEY.importPublicKeyFromE(this.keyE)
                this.keyEValid = true
            } catch (_) {
                this.keyEValid = false
            }

            this.locked = false
        },
    },
    computed: {
        nameValid() {
            return typeof this.name == "string"
                && !!this.name.trim()
                && !this._isNameExisted(this.name)
        },
        peerInfo(): PeerInfo {
            return {
                date: new Date(),
                name: this.name,
                publicKeyE: this.keyE,
            }
        },
    },
    methods: {
        _isNameExisted(name: string, peersList: PeerInfo[] = this._peersList) {
            return peersList.some((item) => {
                if (item && item.name) {
                    return item.name == name
                }
            })
        },
        async init() {
            this._peersList = await getPeersList() || []
            this.name = null
            this.keyE = null
            this.keyEValid = false
        },
        async open() {
            await this.init()
            this.$refs["dialog"].open()
            this.$emit("open")
        },
        close() {
            this.$refs["dialog"].close()
            this.$emit("close")
        },
        commit() {
            this.$emit("add", this.peerInfo)
            this.close()
        }
    },
}
</script>
