// @ts-check

/// <reference types="cordova-plugin-file" />

/**
 * 复制文件
 * 如果文件已存在, 则自动覆盖
 * @param srcPath 源文件路径
 * @param destDir 目标目录
 * @param destFileName 目标文件名 (如果留空, 则不改变文件名)
 */
export const copyFile = (srcPath: string, destDir: string, destFileName?: string): Promise<Entry> => {
    return new Promise((resolve, reject) => {
        const successCallback = (entry: Entry) => resolve(entry)
        const errorCallback = (e: FileError) => reject(e)

        window.resolveLocalFileSystemURL(srcPath, (fileEntry) => {
            window.resolveLocalFileSystemURL(destDir, (dirEntry) => {
                fileEntry.copyTo(dirEntry as DirectoryEntry, destFileName || fileEntry.name, successCallback, errorCallback)
            })
        }, errorCallback)
    })
}

/**
 * 判断文件或目录是否存在
 */
export const fileOrDirExists = (filePath: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const successCallback = () => resolve(true)
        const errorCallback = (e: FileError) => {
            if (e.code == 1) {  // 文件或目录不存在 FileError.NOT_FOUND_ERR
                resolve(false)
            } else {  // 其它错误
                resolve(true)
            }
        }

        window.resolveLocalFileSystemURL(filePath, successCallback, errorCallback)
    })
}

/**
 * 获取文件/目录 Entry
 * @param path 文件路径
 */
export const getEntry = (path: string): Promise<Entry> => {
    return new Promise((resolve, reject) => {
        const successCallback = (entry: Entry) => resolve(entry)
        const errorCallback = (e: FileError) => { reject(e) }

        window.resolveLocalFileSystemURL(path, successCallback, errorCallback)
    })
}

/**
 * @param entry 
 * @param data 文件内容
 */
export const writeFileEntry = (entry: FileEntry, data: BlobPart): Promise<void> => {
    return new Promise((resolve, reject) => {
        entry.createWriter((fileWriter) => {

            fileWriter.onwriteend = () => {
                resolve()
            }

            fileWriter.onerror = (e) => {
                reject(e)
            }

            const blob = new Blob([data])

            fileWriter.write(blob)

        })
    })
}

/**
 * 读取文件
 * @param filePath 文件路径
 */
export const readFile = async (filePath: string): Promise<string> => {

    const entry = await getEntry(filePath) as FileEntry

    return new Promise((resolve, reject) => {

        const errorCallback = (e: FileError) => reject(e)

        entry.file((file) => {

            const reader = new FileReader()

            reader.onloadend = function () {
                resolve(this.result as string)
            }

            reader.readAsText(file)

        }, errorCallback)

    })
}

/**
 * 写入文件
 * @param filePath 文件路径
 * @param data 文件内容
 */
export const writeFile = async (filePath: string, data: BlobPart) => {
    const entry = await getEntry(filePath)
    await writeFileEntry(entry as FileEntry, data)
}

/**
 * 创建文件
 */
export const createFileEntry = (dirEntry: DirectoryEntry, fileName: string): Promise<FileEntry> => {
    return new Promise((resolve, reject) => {
        const errorCallback = (e: FileError) => reject(e)

        // Creates a new file or returns the file if it already exists.
        dirEntry.getFile(fileName, { create: true, exclusive: false }, async (fileEntry) => {
            await writeFileEntry(fileEntry, null)
            resolve(fileEntry)
        }, errorCallback)
    })
}

export const createFile = async (dirPath: string, fileName: string, data?: BlobPart) => {
    const dirEntry = await getEntry(dirPath)
    const fileEntry = await createFileEntry(dirEntry as DirectoryEntry, fileName)
    if (data) {
        await writeFileEntry(fileEntry, data)
    }
}

/**
 * 获取临时目录 Entry
 */
export const getTemporaryDirEntry = () => {
    return new Promise((resolve, reject) => {
        const errorCallback = (e: FileError) => reject(e)

        window.requestFileSystem(window.TEMPORARY, 100 * 1024 * 1024, (fs) => {
            resolve(fs.root)
        }, errorCallback)
    })
}

export const getDirname = (path: string) => {
    if (path.endsWith("/")) {
        path = path.slice(0, path.length - 1)
    }
    return path.slice(0, path.lastIndexOf("/") + 1)
}
