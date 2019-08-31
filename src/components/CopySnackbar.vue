<template>
    <md-snackbar
        ref="snackbar"
        md-position="top center"
    >
        <span>复制{{ status ? "成功" : "失败"}}！</span>
        <md-button
            class="md-accent"
            @click="$refs.snackbar.close()"
        >知道了</md-button>
    </md-snackbar>
</template>

<script lang="ts">
export default {
    props: {
        /** copySucceeded */
        status: {
            // type: Boolean,
            required: true,
        },
    },
    methods: {
        async open() {
            this.$refs["snackbar"].open()
            this.$emit("open")
        },
        close() {
            this.$refs["snackbar"].close()
            this.$emit("close")
        },
    },
}
</script>