// @ts-check

/**
 * 读取文件内容
 */
export const FileReaderPromise = async (file: File) => {
    const reader = new FileReader()
    const buf: ArrayBuffer = await new Promise((resolve) => {
        reader.onload = (e) => {
            // @ts-ignore
            resolve(e.target.result)
        }
        reader.readAsArrayBuffer(file)
    })
    const data = new Uint8Array(buf)
    return data
}

export default FileReaderPromise
