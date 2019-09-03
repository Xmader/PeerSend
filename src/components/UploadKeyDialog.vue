
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
                    @click.native="cordovaSelectFile"
                    :disabled="isCordova"
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
import { KeyInfoSerializer } from "../pages/TheKeysPage.vue"
import FileReaderPromise from "../utils/file-reader-promise"
import CordovaMixin from "../utils/cordova-mixin"
import CordovaFileChooser from "../utils/cordova-file-chooser"

export const KeyFileExt = ".keyinfo"

export default {
    mixins: [
        CordovaMixin
    ],
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
        async cordovaSelectFile() {
            if (!this.isCordova) {
                return
            }

            const result = await CordovaFileChooser.selectFile()
            this.fileName = result.name
            await this.getKeyInfoWithLock(result.data)
        },
        async onFileChange(files: FileList) {
            if (files.length == 0) return
            const file = files[0]
            await this.getKeyInfoWithLock(file)
        },
        async getKeyInfo(file: File | Uint8Array) {
            let data: Uint8Array
            if (file instanceof Blob) {
                data = await FileReaderPromise(file)
            } else {
                data = new Uint8Array(file)
            }

            try {
                const keyInfo = await KeyInfoSerializer.deserialize(data)
                this.keyInfo = keyInfo
                return keyInfo
            } catch (err) {
                this.keyInfo = null
            }
        },
        async getKeyInfoWithLock(file: File | Uint8Array) {
            this.locked = true
            await this.getKeyInfo(file)
            this.locked = false
        },
        commit() {
            this.$emit("uploaded", this.keyInfo)
            this.close()
        },
    },
}
</script>
