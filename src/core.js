// @ts-check

const BASE256 = require("./base256.js")
const KEY = require("./key.js")
const RSA = require("./rsa.js")

const SeparatorChar = "还"

/**
 * @param {string} text 
 * @param {string} peerPublicKeyE
 */
const encryptAndSign = async (text, peerPublicKeyE) => {
    const data = new TextEncoder().encode(text)

    const peerPublicKey = await KEY.importPublicKeyFromE(peerPublicKeyE)
    const encryptedData = await RSA.encrypt(peerPublicKey, data)
    const dataE = BASE256.encode(new Uint8Array(encryptedData))

    const selfPrivateKey = await KEY.getPrivateKey()
    const signature = await RSA.sign(selfPrivateKey, data)
    const signatureE = BASE256.encode(new Uint8Array(signature))

    return [dataE, signatureE].join(SeparatorChar)
}

/**
 * @param {string} encryptedStr 
 * @param {string} senderPublicKeyE 
 */
const decryptAndVerify = async (encryptedStr, senderPublicKeyE) => {
    const [dataE, signatureE] = encryptedStr.split(SeparatorChar)

    const privateKey = await KEY.getPrivateKey()

    const decryptedData = await RSA.decrypt(privateKey, BASE256.decode(dataE))

    const signature = BASE256.decode(signatureE)
    const senderPublicKey = await KEY.importPublicKeyFromE(senderPublicKeyE)
    const verified = RSA.verify(senderPublicKey, signature, decryptedData)

    if (verified) {
        return new TextDecoder().decode(decryptedData)
    }
}

const initKeyPair = async () => {
    await KEY.generateAndSaveKeyPair()

    const selfPublicKey = await KEY.getPublicKey()
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
