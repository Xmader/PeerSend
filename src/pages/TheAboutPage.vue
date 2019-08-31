
<template>
    <xm-container>

        <xm-blank></xm-blank>

        <md-card>
            <md-card-header>
                <md-card-header-text>
                    <div class="md-title">
                        PeerSend <small>v{{ version }}</small>
                    </div>
                    <div class="md-subhead">
                        © Xmader
                        <br>
                        Licensed under MIT
                    </div>
                </md-card-header-text>

                <md-card-media md-medium>
                    <img :src="'./icon.png'">
                </md-card-media>
            </md-card-header>

            <md-card-actions>
                <md-button
                    class="md-primary"
                    :href="githubURL"
                    target="_blank"
                >访问 Github 项目主页</md-button>
            </md-card-actions>
        </md-card>

        <xm-blank></xm-blank>

    </xm-container>
</template>

<script lang="ts">
import xmContainer from "../components/xmContainer.vue"
import xmBlank from "../components/xmBlank.vue"

// @ts-ignore
import { version } from "../../package.json"

export default {
    components: {
        xmBlank,
        xmContainer,
    },
    data() {
        return ({
            githubURL: "https://github.com/Xmader/PeerSend/",
            version: version,
        })
    },
}
</script>

