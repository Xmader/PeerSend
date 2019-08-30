
<template>
    <md-dialog ref="dialog">
        <md-dialog-title>添加收发目标</md-dialog-title>

        <md-dialog-content>
            <md-input-container :class="{ 'md-input-invalid': !nameValid }">
                <label>名称</label>
                <md-input v-model="name" required></md-input>
                <span class="md-error">{{ nameErrorContent }}</span>
            </md-input-container>

            <md-input-container :class="{ 'md-input-invalid': !keyEValid }">
                <label>公钥</label>
                <md-textarea v-model="keyE" required></md-textarea>
                <span class="md-error">{{ keyEErrorContent }}</span>
            </md-input-container>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button @click="close()">
                取消
            </md-button>

            <md-button
                class="md-primary"
                @click="commit"
                :disabled="!keyEValid || !nameValid"
            >
                添加
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script lang="ts">
import { PeerInfo } from "./ThePeersPage.vue"

export default {
    data: () => ({
        name: null,
        keyE: null,
        peerInfo: null,
        locked: false,
        keyEErrorContent: "请输入有效的公钥",
        nameErrorContent: "名称不能重复",
    }),
    computed: {
        keyEValid() {
            return this.peerInfo && !this.locked
        },
        nameValid() {
            return this.name
        }
    },
    methods: {
        open() {
            this.$refs["dialog"].open()
            this.$emit("open")
        },
        close() {
            this.$refs["dialog"].close()
            this.$emit("close")
        },
        async onInput(files: FileList) {
            if (files.length == 0) return
            const file = files[0]
            this.locked = true
            await this.getPeerInfo(file)
            this.locked = false
        },
        async getPeerInfo(file: File) {
            // 读取文件内容
            const reader = new FileReader()
            const buf: ArrayBuffer = await new Promise((resolve) => {
                reader.onload = (e) => {
                    // @ts-ignore
                    resolve(e.target.result)
                }
                reader.readAsArrayBuffer(file)
            })
            const data = new Uint8Array(buf)

            try {
                const peerInfo = await PeerInfoSerializer.deserialize(data)
                this.peerInfo = peerInfo
                return peerInfo
            } catch (err) {
                this.peerInfo = null
            }
        },
        commit() {
            this.$emit("add", this.peerInfo)
            this.close()
        }
    },
}
</script>
