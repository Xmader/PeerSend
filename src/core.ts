// @ts-check

import KEY from "./key.js"
import RSA from "./rsa.js"
import { Base256Serializer, Serializer } from "./serialization"

/**
 * @param {string} text 
 * @param {string} peerPublicKeyE
 * @param {string=} selfStoreName 
 * @param {Serializer<any>} serializer 
 */
export const encryptAndSign = async (
    text: string,
    peerPublicKeyE: string,
    selfStoreName: string = "self",
    serializer: Serializer<any> = Base256Serializer
) => {
    const data = new TextEncoder().encode(text)

    const peerPublicKey = await KEY.importPublicKeyFromE(peerPublicKeyE)
    const encryptedData = await RSA.encrypt(peerPublicKey, data)

    const selfPrivateKey = await KEY.getPrivateKey(selfStoreName)
    const selfPublicKey = await KEY.getPublicKey(selfStoreName)

    const signature = await RSA.sign(selfPrivateKey, data)

    return serializer.serialize({ encryptedData, signature, senderPublicKey: selfPublicKey })
}

/**
 * @param {string | Uint8Array} serializedData 
 * @param {string=} senderPublicKeyE 发送方的公钥，用来验证签名
 * @param {string=} selfStoreName 
 * @param {Serializer<any>} serializer 
 */
export const decryptAndVerify = async (
    serializedData: string | Uint8Array,
    senderPublicKeyE: string = null,
    selfStoreName: string = "self",
    serializer: Serializer<any> = Base256Serializer
) => {
    const { encryptedData, signature } = serializer.deserialize(serializedData)

    const privateKey = await KEY.getPrivateKey(selfStoreName)

    const decryptedData = await RSA.decrypt(privateKey, encryptedData)
    const text = new TextDecoder().decode(decryptedData)

    if (!senderPublicKeyE) {
        return text
    }

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
export const initKeyPair = async (storeName: string = "self") => {
    // 强制覆盖生成密钥对
    // await KEY.generateAndSaveKeyPair(storeName)

    const selfPublicKey = await KEY.getPublicKey(storeName)
    const selfPublicKeyE = await KEY.exportPublicKeyE(selfPublicKey)

    return {
        publicKeyE: selfPublicKeyE,
    }
}
