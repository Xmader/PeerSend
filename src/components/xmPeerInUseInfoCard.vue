<template>
    <xm-icon-card
        v-if="!!peerInUseInfo"
        :title="title"
        :icon="icon"
        :content="peerInUseInfo.name"
        :content-subhead="`创建时间: ${_getLocaleDateString(peerInUseInfo.date)}`"
        actionText="更换接收方"
        @actionClick="onChangePeerBtnClick"
    ></xm-icon-card>

    <xm-icon-card
        v-else
        :active="false"
        :title="title"
        :icon="icon"
        content="无接收方"
        content-subhead="一定是没有添加吧"
        actionText="添加接收方"
        @actionClick="onChangePeerBtnClick"
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
    },
    data() {
        return ({
            title: "发送到：",
            icon:"person",
        })
    },
    methods: {
        onChangePeerBtnClick() {
            this.$emit("changePageReq", "peers")
        },
    },
}
</script>
