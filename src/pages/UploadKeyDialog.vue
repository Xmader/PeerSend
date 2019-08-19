
<template>
    <md-dialog
        ref="file-dialog"
        :md-click-outside-to-close="false"
        :md-esc-to-close="false"
    >
        <md-dialog-title>导入密钥对</md-dialog-title>

        <md-dialog-content>
            <md-input-container :class="{ 'md-input-invalid': !valid }">
                <md-file
                    v-model="fileName"
                    @selected="onFileChange"
                    placeholder="请选择一个密钥对信息文件"
                    :accept="KeyFileExt"
                    required
                ></md-file>
                <span class="md-error">{{ errorContent }}</span>
            </md-input-container>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button @click="close()">
                取消
            </md-button>

            <md-button
                class="md-primary"
                @click="commit"
                :disabled="!valid"
            >
                导入
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script lang="ts">
import { KeyInfoSerializer } from "./TheKeysPage.vue"

export const KeyFileExt = ".keyinfo"

export default {
    data: () => ({
        fileName: null,
        keyInfo: null,
        locked: false,
        errorContent: `请选择一个有效的密钥对信息文件 (${KeyFileExt})`,
        KeyFileExt,
    }),
    computed: {
        fileNameValid() {
            return this.fileName && this.fileName.endsWith(KeyFileExt)
        },
        valid() {
            return this.fileNameValid && this.keyInfo && !this.locked
        }
    },
    methods: {
        open() {
            this.fileName = null

            this.$refs["file-dialog"].open()
            this.$emit("open")
        },
        close() {
            this.$refs["file-dialog"].close()
            this.$emit("close")
        },
        async onFileChange(files: FileList) {
            if (files.length == 0) return
            const file = files[0]
            this.locked = true
            await this.getKeyInfo(file)
            this.locked = false
        },
        async getKeyInfo(file: File) {
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
                const keyInfo = await KeyInfoSerializer.deserialize(data)
                this.keyInfo = keyInfo
                return keyInfo
            } catch (err) {
                this.keyInfo = null
            }
        },
        commit() {
            this.$emit("uploaded", this.keyInfo)
            this.close()
        }
    },
}
</script>
