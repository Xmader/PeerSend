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

const generateAndSaveKeyPair = async () => {
    const keyPair = await RSA.generateRSAKeyPair()

    const privateKeyObj = await RSA.exportKeyObj(keyPair.privateKey)
    const publicKeyObj = await RSA.exportKeyObj(keyPair.publicKey)

    await localforage.setItem("PrivateKeyObj", privateKeyObj)
    await localforage.setItem("PublicKeyObj", publicKeyObj)

    return {
        privateKeyObj,
        publicKeyObj,
    }
}

const getPrivateKey = async () => {
    let keyObj = await localforage.getItem("PrivateKeyObj")
    if (!keyObj) {
        const keyObjPair = await generateAndSaveKeyPair()
        keyObj = keyObjPair.privateKeyObj
    }

    const privateKey = await RSA.importKeyObj(keyObj, "RSA-PSS", "sign")
    return privateKey
}

const getPublicKey = async () => {
    let keyObj = await localforage.getItem("PublicKeyObj")
    if (!keyObj) {
        const keyObjPair = await generateAndSaveKeyPair()
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
