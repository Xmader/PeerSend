<template>
    <xm-icon-card
        v-if="!!peerInUseInfo"
        :title="title"
        :icon="icon"
        :content="peerInUseInfo.name"
        :content-subhead="`创建时间: ${_getLocaleDateString(peerInUseInfo.date)}`"
        :actionText="'更换' + peerTypeText"
        @actionClick="onChangePeerBtnClick"
        :disabled="disabled"
    ></xm-icon-card>

    <xm-icon-card
        v-else
        :active="false"
        :title="title"
        :icon="icon"
        :content="'无' + peerTypeText"
        content-subhead="一定是没有添加吧"
        :actionText="'添加' + peerTypeText"
        @actionClick="onChangePeerBtnClick"
        :disabled="disabled"
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
        /** type: PeerInfo */
        peerInUseInfo: Object,

        page: {
            type: String,
            required: true,
            validator(value: string) {
                return ["encrypt", "decrypt"].includes(value)
            }
        },

        disabled: Boolean,
    },
    data() {
        return ({
            icon: "person",
        })
    },
    computed: {
        title() {
            return this.page == "encrypt"
                ? "发送到："
                : "发送方："
        },
        peerTypeText() {
            return this.page == "encrypt"
                ? "接收方"
                : "发送方"
        },
    },
    methods: {
        onChangePeerBtnClick() {
            this.$emit("changePageReq", "peers")
        },
    },
}
</script>
