<template>
    <md-dialog ref="dialog">
        <md-dialog-title>显示公钥</md-dialog-title>

        <md-dialog-content>
            <div class="xm-code-block">
                {{ keyE }}
            </div>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-primary">
                复制
            </md-button>

            <md-button
                class="md-primary"
                @click="close()"
            >
                关闭
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script lang="ts">
export default {
    data: () => ({
        keyE: null,
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
            this.keyE = null
            this.$refs["dialog"].close()
            this.$emit("close")
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
