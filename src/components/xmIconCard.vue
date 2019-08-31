
<template>
    <md-card :class="{ 'inactive-xm-icon-card': !active }">

        <div class="xm-icon-card-title">{{ title }}</div>

        <md-card-header :style="{ 'margin-bottom': actionText ? '-4px' : '0px', 'padding-bottom': actionText && '0px' }">
            <md-avatar>
                <md-icon :class="{ 'md-warn': active }">{{ icon }}</md-icon>
            </md-avatar>

            <div class="md-title">{{ content }}</div>
            <div class="md-subhead">{{ contentSubhead }}</div>
        </md-card-header>

        <md-card-actions v-if="actionText">
            <md-button
                class="md-primary"
                @click="onActionClick"
            >{{ actionText }}</md-button>
        </md-card-actions>

    </md-card>
</template>

<script lang="ts">
export default {
    props: {
        title: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        contentSubhead: String,
        actionText: String,
        active: {
            type: Boolean,
            default: true,
        },
    },
    methods: {
        onActionClick() {
            this.$emit("actionClick")
        },
    },
}
</script>

<style lang="less">
    .xm-icon-card-title {
        font-size: 20px;
        padding: 16px 16px 0;
    }

    .inactive-xm-icon-card {
        .md-icon {
            color: rgba(0, 0, 0, 0.54);
        }

        .md-card-header {
            .md-title {
                color: rgba(0, 0, 0, 0.75);
            }
        }
    }
</style>
