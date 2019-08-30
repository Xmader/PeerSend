import { Vue } from "vue/types/vue"
import { ComponentOptions } from "vue/types/options"

export type Vue = Vue
export type VueComponentOptions = ComponentOptions<Vue>

export type DialogStates = "ok" | "cancel"
