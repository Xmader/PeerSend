// @ts-check

namespace CordovaFileChooser {

    export interface FileSelectResult {
        data: Uint8Array;
        dataURI: string;
        mediaType: string;
        name: string;
        uri: string;
    }

    /**
     * Displays native prompt for user to select a file.
     *
     * @param accept Optional MIME type filter (e.g. 'image/gif,video/*').
     *
     * @returns Promise containing selected file's raw binary data,
     * base64-encoded data: URI, MIME type, display name, and original URI.
     *
     * If error occurs or user cancels, promise will be rejected.
     */
    export const chooseFile = async (accept?: string): Promise<FileSelectResult> => {
        // @ts-ignore
        const result: undefined | FileSelectResult = await window.chooser.getFile(accept)
        if (!result) {
            throw new Error("user cancels")
        }

        return result
    }

    /**
     * @alias chooseFile
     */
    export const selectFile = chooseFile

}

export = CordovaFileChooser
