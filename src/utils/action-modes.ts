// @ts-check

import SelectedTextUtils from "./selected-text-utils"
import SendActionUtils from "./send-action-utils"

export enum ActionModes {
    "PROCESS_TEXT_ACTION",
    "SEND_TEXT_ACTION",
}

export enum IntentActionToActionModeMap {
    "android.intent.action.PROCESS_TEXT" = ActionModes.PROCESS_TEXT_ACTION,
    "android.intent.action.SEND" = ActionModes.SEND_TEXT_ACTION,
    "android.intent.action.SEND_MULTIPLE" = ActionModes.SEND_TEXT_ACTION,
}

export const ActionModeToGetTextFnMap: { [actionMode: number]: () => Promise<string>; } = {
    [ActionModes.PROCESS_TEXT_ACTION]: SelectedTextUtils.getSelectedText,
    [ActionModes.SEND_TEXT_ACTION]: SendActionUtils.getSentText,
}
