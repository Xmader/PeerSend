
<template>
    <md-card class="xm-input-text-card">

        <div class="title-text">{{ title }}</div>

        <md-card-header>
            <md-input-container>
                <md-textarea
                    :value="value"
                    @change="onChange"
                    @input="onInput"
                    :readonly="readonly"
                ></md-textarea>
            </md-input-container>
        </md-card-header>

    </md-card>
</template>

<script lang="ts">
export default {
    props: {
        value: String,
        readonly: Boolean,
        title: {
            type: String,
            required: true
        },
    },
    methods: {
        onChange(text) {
            this.$emit("change", text)
        },
        onInput(text) {
            this.$emit("input", text)
        },
    },
}
</script>

<style lang="less">
    .xm-input-text-card {
        > .title-text {
            font-size: 20px;
            padding: 16px 16px 0;
        }

        > .md-card-header {
            margin-bottom: 0px !important;
            padding-top: 8px;

            .md-input-container {
                margin-top: -16px;
                margin-bottom: 0px;
            }
        }
    }
</style>
