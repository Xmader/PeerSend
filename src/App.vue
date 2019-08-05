<template>
    <main>
        <md-whiteframe md-elevation="3">
            <md-toolbar>
                <md-button
                    class="md-icon-button"
                    @click="toggleSidenav"
                >
                    <md-icon>menu</md-icon>
                </md-button>

                <h2
                    class="md-title"
                    style="flex: 1"
                >
                    PeerSend
                    <small style="font-size: 75%; margin-left: 1em;">{{ getPageNameById(activePage) }}</small>
                </h2>
            </md-toolbar>
        </md-whiteframe>

        <the-keys-page v-if="!!isActive('keys')"></the-keys-page>

        <md-sidenav
            class="md-left md-fixed"
            ref="leftSidenav"
        >
            <md-toolbar class="md-large">
                <div class="md-toolbar-container">
                    <h3 class="md-title">PeerSend</h3>
                </div>
            </md-toolbar>

            <md-list>
                <md-list-item
                    v-for="item of pages"
                    :key="'page-' + item.id"
                    @click="switchPage(item.id)"
                    :class="isActive(item.id)"
                >
                    <md-icon>{{ item.icon }}</md-icon> <span>{{ item.name }}</span>
                </md-list-item>
            </md-list>
        </md-sidenav>

    </main>
</template>

<script lang="ts">
// @ts-ignore
import TheKeysPage from "./pages/TheKeysPage.vue"

interface PageInfo {
    id: string;
    name: string;
    icon: string;
}

const pages: PageInfo[] = [
    {
        id: "messaging",
        name: "收发消息",
        icon: "compare_arrows",
    },
    {
        id: "keys",
        name: "密钥对管理 (我的密钥对)",
        icon: "account_circle",
    },
    {
        id: "about",
        name: "关于",
        icon: "info",
    },
]

export default {
    components: {
        TheKeysPage,
    },
    data() {
        return ({
            activePage: "messaging",
            classes: {
                active: "md-primary",
            },
            pages,
        })
    },
    methods: {
        toggleSidenav() {
            this.$refs.leftSidenav.toggle()
        },
        switchPage(pageId: string) {
            this.activePage = pageId
            this.toggleSidenav()
        },
        isActive(pageId: string) {
            return this.activePage == pageId ? this.classes.active : null
        },
        getPageNameById(pageId: string) {
            const pageInfo = pages.find((p) => {
                return p.id == pageId
            })
            return pageInfo && pageInfo.name
        },
    },
}
</script>

<style>
    .md-whiteframe {
        z-index: 3;
    }
</style>