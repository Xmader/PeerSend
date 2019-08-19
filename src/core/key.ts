// @ts-check

import BASE256 from "./base256"
import RSA from "./rsa"

import localforage from "localforage"

namespace KEY {

    /**
     * @param {CryptoKey} key 
     */
    export const exportPublicKeyData = async (key: CryptoKey) => {
        const keyObj = await RSA.exportKeyObj(key)
        const keyN = keyObj.n
        const keyData = new TextEncoder().encode(keyN)
        return keyData
    }

    /**
     * @param {CryptoKey} key 
     */
    export const exportPublicKeyE = async (key: CryptoKey) => {
        const keyData = await exportPublicKeyData(key)
        const keyE = BASE256.encode(keyData)
        return keyE
    }

    /**
     * @param {Uint8Array} keyData 
     */
    export const importPublicKeyFromKeyData = async (keyData: Uint8Array) => {
        const keyN = new TextDecoder().decode(keyData)
        const keyObj = { alg: "PS256", e: "AQAB", kty: "RSA", n: keyN }
        const key = await RSA.importKeyObj(keyObj, "RSA-PSS", ["verify"])
        return key
    }

    /**
     * @param {string} keyE 
     */
    export const importPublicKeyFromE = async (keyE: string) => {
        const keyData = BASE256.decode(keyE)
        const key = await importPublicKeyFromKeyData(keyData)
        return key
    }

    /**
     * 储存密钥对，如果存在同名的密钥对，则强制覆盖
     * @param {string} storeName 
     * @param {CryptoKeyPair} keyPair 
     */
    export const saveKeyPair = async (storeName: string, keyPair: CryptoKeyPair) => {
        const privateKeyObj = await RSA.exportKeyObj(keyPair.privateKey)
        const publicKeyObj = await RSA.exportKeyObj(keyPair.publicKey)

        const store = localforage.createInstance({
            name: storeName,
        })

        await store.setItem("PrivateKeyObj", privateKeyObj)
        await store.setItem("PublicKeyObj", publicKeyObj)

        return {
            privateKeyObj,
            publicKeyObj,
        }
    }

    /**
     * 生成自己的密钥对，如果存在，则强制覆盖已有的密钥对
     * @param {string=} storeName 
     */
    export const generateAndSaveKeyPair = async (storeName: string = "self") => {
        const keyPair = await RSA.generateRSAKeyPair()
        return saveKeyPair(storeName, keyPair)
    }

    /**
     * 获取自己的私钥，如果不存在，则自动生成
     * @param {string=} storeName 
     */
    export const getPrivateKey = async (storeName: string = "self") => {
        const store = localforage.createInstance({
            name: storeName,
        })

        let keyObj = await store.getItem("PrivateKeyObj")
        if (!keyObj) {
            const keyObjPair = await generateAndSaveKeyPair(storeName)
            keyObj = keyObjPair.privateKeyObj
        }

        const privateKey = await RSA.importKeyObj(keyObj, "RSA-PSS", ["sign"])
        return privateKey
    }

    /**
     * 获取自己的公钥，如果不存在，则自动生成
     * @param {string=} storeName 
     */
    export const getPublicKey = async (storeName: string = "self") => {
        const store = localforage.createInstance({
            name: storeName,
        })

        let keyObj = await store.getItem("PublicKeyObj")
        if (!keyObj) {
            const keyObjPair = await generateAndSaveKeyPair(storeName)
            keyObj = keyObjPair.publicKeyObj
        }

        const publicKey = await RSA.importKeyObj(keyObj, "RSA-PSS", ["verify"])
        return publicKey
    }

    export const getKeyPair = async (storeName: string = "self"): Promise<CryptoKeyPair> => {
        const privateKey = await getPrivateKey(storeName)
        const publicKey = await getPublicKey(storeName)
        return {
            publicKey,
            privateKey,
        }
    }

}

export = KEY
