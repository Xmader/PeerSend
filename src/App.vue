<template>
    <main>
        <md-whiteframe md-elevation="3">
            <md-toolbar>
                <md-button
                    v-if="!actionMode"
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

                <md-button
                    v-if="actionMode"
                    class="md-icon-button"
                    @click="switchActionPages"
                >
                    <md-icon>swap_calls</md-icon>
                </md-button>
            </md-toolbar>
        </md-whiteframe>

        <the-crypto-page
            v-if="!!isActive('encrypt') || !!isActive('decrypt')"
            :key="activePage"
            :page="activePage"
            :key-in-use-info="keyInUseInfo"
            :peer-in-use-info="peerInUseInfo"
            @changePageReq="switchPage"
            :actionMode="actionMode"
        ></the-crypto-page>

        <the-keys-page
            v-show="!!isActive('keys')"
            @changeKey="onChangeSelfKeyPair"
        ></the-keys-page>

        <the-peers-page
            v-show="!!isActive('peers')"
            @changePeer="onChangePeer"
        ></the-peers-page>

        <the-about-page v-if="!!isActive('about')"></the-about-page>

        <md-sidenav
            class="md-left md-fixed"
            ref="leftSidenav"
        >
            <md-toolbar class="md-large">
                <div class="md-toolbar-container">
                    <h3 class="md-title">PeerSend</h3>
                </div>

                <div style="margin-left: 8px; margin-bottom: 0.5em;">
                    © Xmader
                    <br>
                    Licensed under MIT
                    <br>
                    https://github.com/Xmader/PeerSend/
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
import TheKeysPage, { KeyInfo } from "./pages/TheKeysPage.vue"
import ThePeersPage, { PeerInfo } from "./pages/ThePeersPage.vue"
import TheCryptoPage from "./pages/TheCryptoPage.vue"
import TheAboutPage from "./pages/TheAboutPage.vue"

import { DeviceReady, IntentUtils } from "./utils/cordova-utils"
import { Base256Serializer } from "./core/serialization"
import { IntentActionToActionModeMap, ActionModeToGetTextFnMap } from "./utils/action-modes"

interface PageInfo {
    id: string;
    name: string;
    icon: string;
}

const pages: PageInfo[] = [
    {
        id: "encrypt",
        name: "加密文本",
        icon: "enhanced_encryption",
    },
    {
        id: "decrypt",
        name: "解密文本",
        icon: "lock_open",
    },
    {
        id: "keys",
        name: "我的密钥对",
        icon: "face",
    },
    {
        id: "peers",
        name: "收发目标管理",
        icon: "people",
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
        ThePeersPage,
        TheCryptoPage,
        TheAboutPage,
    },
    data() {
        return ({
            activePage: "about",
            classes: {
                active: "md-primary",
            },
            pages,
            keyInUseInfo: null,
            peerInUseInfo: null,
            actionMode: false,
        })
    },
    methods: {
        toggleSidenav() {
            this.$refs.leftSidenav.toggle()
        },
        closeSidenav() {
            this.$refs.leftSidenav.close()
        },
        switchPage(pageId: string) {
            this.activePage = pageId
            this.closeSidenav()
            this.actionMode = false
        },
        switchActionPages() {
            if (this.activePage == "decrypt") {
                this.activePage = "encrypt"
            } else {
                this.activePage = "decrypt"
            }
        },
        /**
         * @deprecated
         */
        toggleActionMode() {
            if (!this.actionMode) {
                this.closeSidenav()
                /** should be one of the keys in ActionModes */
                this.actionMode = true
                this.activePage = "encrypt"
            } else {
                this.actionMode = false
                this.activePage = "about"
            }
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
        onChangeSelfKeyPair(keyInUseInfo: KeyInfo) {
            this.keyInUseInfo = keyInUseInfo
        },
        onChangePeer(peer: PeerInfo) {
            this.peerInUseInfo = peer
        },
    },
    async mounted() {
        await DeviceReady.waitForCordovaLoaded()

        const intent = await IntentUtils.getProcessTextIntent(false)
            || await IntentUtils.getSendActionIntent(false)

        if (intent) {
            const actionMode = IntentActionToActionModeMap[intent.action]
            this.actionMode = actionMode

            this.activePage = "encrypt"

            const getTextFn = ActionModeToGetTextFnMap[actionMode]
            const actionModeText = await getTextFn()
            const textLength = actionModeText.trim().length
            if ((textLength - 256 - 1) % 256 == 0) {
                // - 256: signature length
                // - 1: length of Base256SeparatorChar (还)
                // % 256: length of each RSA encrypted data chunck 
                try {
                    // try to deserialize and decode using Base256Serializer, if success, the text probably is a encrypted text
                    await Base256Serializer.deserialize(actionModeText)
                    this.activePage = "decrypt"
                } catch (_) {
                    /** do nothing */
                }
            }
        }
    },
}
</script>

<style>
    .md-whiteframe {
        z-index: 3;
    }
</style>
