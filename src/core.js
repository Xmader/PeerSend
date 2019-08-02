// @ts-check

const BASE256 = require("./base256.js")
const KEY = require("./key.js")
const RSA = require("./rsa.js")

const SeparatorChar = "还"

/**
 * @param {string} text 
 * @param {string} peerPublicKeyE
 * @param {string=} selfStoreName 
 */
const encryptAndSign = async (text, peerPublicKeyE, selfStoreName = "self") => {
    const data = new TextEncoder().encode(text)

    const peerPublicKey = await KEY.importPublicKeyFromE(peerPublicKeyE)
    const encryptedData = await RSA.encrypt(peerPublicKey, data)
    const dataE = BASE256.encode(new Uint8Array(encryptedData))

    const selfPrivateKey = await KEY.getPrivateKey(selfStoreName)
    const signature = await RSA.sign(selfPrivateKey, data)
    const signatureE = BASE256.encode(new Uint8Array(signature))

    return [dataE, signatureE].join(SeparatorChar)
}

/**
 * @param {string} encryptedStr 
 * @param {string=} senderPublicKeyE 发送方的公钥，用来验证签名
 * @param {string=} selfStoreName 
 */
const decryptAndVerify = async (encryptedStr, senderPublicKeyE = null, selfStoreName = "self") => {
    const [dataE, signatureE] = encryptedStr.split(SeparatorChar)

    const privateKey = await KEY.getPrivateKey(selfStoreName)

    const decryptedData = await RSA.decrypt(privateKey, BASE256.decode(dataE))
    const text = new TextDecoder().decode(decryptedData)

    if (!senderPublicKeyE) {
        return text
    }

    const signature = BASE256.decode(signatureE)
    const senderPublicKey = await KEY.importPublicKeyFromE(senderPublicKeyE)
    const verified = RSA.verify(senderPublicKey, signature, decryptedData)

    if (verified) {
        return text
    }
}

/**
 * 初始化密钥对
 * @param {string=} storeName 
 */
const initKeyPair = async (storeName = "self") => {
    // 强制覆盖生成密钥对
    // await KEY.generateAndSaveKeyPair(storeName)

    const selfPublicKey = await KEY.getPublicKey(storeName)
    const selfPublicKeyE = await KEY.exportPublicKeyE(selfPublicKey)

    return {
        publicKeyE: selfPublicKeyE,
    }
}

module.exports = {
    encryptAndSign,
    decryptAndVerify,
    initKeyPair,
}
