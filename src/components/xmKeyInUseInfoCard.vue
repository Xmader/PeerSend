<template>
    <xm-icon-card
        v-if="!!keyInUseInfo"
        :title="title"
        :icon="icon"
        :content="keyInUseInfo.name"
        :content-subhead="`创建时间: ${_getLocaleDateString(keyInUseInfo.date)}`"
        actionText="更换密钥"
        @actionClick="onChangeKeyBtnClick"
    ></xm-icon-card>

    <xm-icon-card
        v-else
        :active="false"
        :title="title"
        :icon="icon"
        content="无密钥对"
        content-subhead="一定是没有添加吧"
        actionText="添加密钥"
        @actionClick="onChangeKeyBtnClick"
    ></xm-icon-card>
</template>

<script lang="ts">
import xmIconCard from "../components/xmIconCard.vue"

import baseUtilsMixin from "../utils/base-utils-mixin"

export default {
    components: {
        xmIconCard,
    },
    mixins: [
        baseUtilsMixin,
    ],
    props: {
        /** type: KeyInfo */
        keyInUseInfo: Object,
    },
    data() {
        return ({
            title: "使用此密钥加密：",
            icon: "vpn_key",
        })
    },
    methods: {
        onChangeKeyBtnClick() {
            this.$emit("changePageReq", "keys")
        },
    },
}
</script>
