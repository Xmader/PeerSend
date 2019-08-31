<!--
 * 文字在左侧并自动对齐的开关组件
 * 在 md-switch 上所有可用的属性在 xm-switch 上都可用
 * switch-class 属性用于调整 md-switch 上的 class 属性
 * @author Xmader
 * @copyright Copyright (c) 2018-2019 Xmader. All Rights Reserved.
 * @license MIT
 -->

<template>
    <md-layout md-gutter>
        <md-layout>
            <label class="switch-label">
                <slot></slot>
            </label>
        </md-layout>
        <md-layout
            md-flex="20"
            md-align="end"
        >
            <md-switch
                :class="switchClass"
                v-bind="$attrs"
                :value="value"
                @input="changeState"
            ></md-switch>
        </md-layout>
    </md-layout>
</template>

<script>
export default {
    props: {
        value: Boolean,
        switchClass: {
            type: [String, Object, Array],
            default: "md-warn"
        },
    },
    inheritAttrs: false,
    methods: {
        changeState(value) {
            this.$emit("input", value)
            this.$emit("change", value)
        }
    }
}
</script>


<style>
    .switch-label {
        height: 14px;
        line-height: 14px;
        margin: 16px 8px 16px 0;
    }
</style>

