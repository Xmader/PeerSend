// @ts-check

namespace Permission {

    /**
     * 手动请求 android.permission.WRITE_EXTERNAL_STORAGE 权限 
     * @returns {Promise<boolean>}
     */
    export const requestWriteExternalStoragePermission = async (): Promise<boolean> => {
        // @ts-ignore
        const permissions = window.cordova.plugins.permissions
        const name = permissions.WRITE_EXTERNAL_STORAGE

        return new Promise((resolve, reject) => {
            permissions.requestPermission(name, (result) => {
                if (result && result.hasPermission) {
                    resolve(true)
                } else {
                    reject(false)
                }
            }, (err: Error) => {
                reject(err)
            })
        })
    }

}

export = Permission
