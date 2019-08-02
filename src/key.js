// @ts-check

const BASE256 = require("./base256.js")
const RSA = require("./rsa.js")

const localforage = require("localforage")

/**
 * @param {CryptoKey} key 
 */
const exportPublicKeyE = async (key) => {
    const keyObj = await RSA.exportKeyObj(key)
    const keyN = keyObj.n
    const keyData = new TextEncoder().encode(keyN)
    const keyE = BASE256.encode(keyData)
    return keyE
}

/**
 * @param {string} keyE 
 */
const importPublicKeyFromE = async (keyE) => {
    const keyData = BASE256.decode(keyE)
    const keyN = new TextDecoder().decode(keyData)
    const keyObj = { alg: "PS256", e: "AQAB", kty: "RSA", n: keyN }
    const key = await RSA.importKeyObj(keyObj, "RSA-PSS", "verify")
    return key
}

/**
 * 生成自己的密钥对，如果存在，则强制覆盖已有的密钥对
 * @param {string=} storeName 
 */
const generateAndSaveKeyPair = async (storeName = "self") => {
    const keyPair = await RSA.generateRSAKeyPair()

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
 * 获取自己的私钥，如果不存在，则自动生成
 * @param {string=} storeName 
 */
const getPrivateKey = async (storeName = "self") => {
    const store = localforage.createInstance({
        name: storeName,
    })

    let keyObj = await store.getItem("PrivateKeyObj")
    if (!keyObj) {
        const keyObjPair = await generateAndSaveKeyPair(storeName)
        keyObj = keyObjPair.privateKeyObj
    }

    const privateKey = await RSA.importKeyObj(keyObj, "RSA-PSS", "sign")
    return privateKey
}

/**
 * 获取自己的公钥，如果不存在，则自动生成
 * @param {string=} storeName 
 */
const getPublicKey = async (storeName = "self") => {
    const store = localforage.createInstance({
        name: storeName,
    })

    let keyObj = await store.getItem("PublicKeyObj")
    if (!keyObj) {
        const keyObjPair = await generateAndSaveKeyPair(storeName)
        keyObj = keyObjPair.publicKeyObj
    }

    const publicKey = await RSA.importKeyObj(keyObj, "RSA-PSS", "verify")
    return publicKey
}

module.exports = {
    exportPublicKeyE,
    importPublicKeyFromE,
    generateAndSaveKeyPair,
    getPrivateKey,
    getPublicKey,
}
