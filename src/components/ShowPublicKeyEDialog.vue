<template>
    <md-dialog ref="dialog">
        <md-dialog-title>显示公钥</md-dialog-title>

        <md-dialog-content>
            <div class="xm-code-block">
                {{ keyE }}
            </div>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button
                class="md-primary"
                v-clipboard:copy="keyE"
                v-clipboard:success="() => handleCopyStatus(true)"
                v-clipboard:error="() => handleCopyStatus(false)"
            >
                复制
            </md-button>

            <md-button
                class="md-primary"
                @click="close()"
            >
                关闭
            </md-button>
        </md-dialog-actions>

        <xm-snackbar
            ref="snackbar"
            text="复制"
            :status="copySucceeded"
        ></xm-snackbar>
    </md-dialog>
</template>

<script lang="ts">
import xmSnackbar from "./xmSnackbar.vue"

export default {
    components: {
        xmSnackbar
    },
    data: () => ({
        keyE: null,
        copySucceeded: null,
    }),
    methods: {
        open(keyE: string) {
            if (!keyE) {
                throw new TypeError("argument `keyE` is required.")
            }

            this.keyE = keyE
            this.$refs["dialog"].open()
            this.$emit("open")
        },
        close() {
            this.$refs["dialog"].close()
            this.$emit("close")
        },
        handleCopyStatus(status: boolean) {
            this.copySucceeded = status
            this.$refs["snackbar"].open()
        },
    },
}
</script>

<style>
    .xm-code-block {
        border: 1px solid #ddd;
        border-radius: 3px;
        background: #f5f5f5;
        padding: 0.5em 0.9em;
        text-align: justify;
        text-justify: inter-character;
    }
</style>
