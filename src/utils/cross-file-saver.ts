// @ts-check

import FileSaver from "file-saver"
import { createFile } from "./cordova-file-utils"
import { requestWriteExternalStoragePermission } from "./permission-utils"

namespace CrossFileSaver {

    export const saveAs = async (data: BlobPart, filename?: string) => {
        const isCordova = typeof window["cordova"] !== "undefined"
        if (isCordova) {
            const downloadDirPath = "file:///storage/emulated/0/Download/"

            const hasPermission = await requestWriteExternalStoragePermission()
            if (!hasPermission) {
                throw new Error("no permission")
            }

            await createFile(downloadDirPath, filename, data)
        } else {
            FileSaver.saveAs(new Blob([data]), filename)
        }
    }

}

export = CrossFileSaver
