// @ts-check

import KEY from "./key"
import RSA from "./rsa"
import { Base256Serializer, Serializer } from "./serialization"


export const encryptAndSign = async <T = string>(
    text: string,
    peerPublicKeyE: string,
    selfStoreName: string = "self",
    // @ts-ignore
    serializer: Serializer<T> = Base256Serializer
) => {
    const data = new TextEncoder().encode(text)

    const peerPublicKey = await KEY.importPublicKeyFromE(peerPublicKeyE)
    const encryptedData = await RSA.encrypt(peerPublicKey, data)

    const selfPrivateKey = await KEY.getPrivateKey(selfStoreName)
    const selfPublicKey = await KEY.getPublicKey(selfStoreName)

    const signature = await RSA.sign(selfPrivateKey, data)

    return serializer.serialize({ encryptedData, signature, senderPublicKey: selfPublicKey })
}


export const decryptAndVerify = async <T = string>(
    serializedData: T,
    selfStoreName: string = "self",
    // @ts-ignore
    serializer: Serializer<T> = Base256Serializer
) => {
    const { encryptedData, signature, senderPublicKey } = await serializer.deserialize(serializedData)

    const privateKey = await KEY.getPrivateKey(selfStoreName)

    const decryptedData = await RSA.decrypt(privateKey, encryptedData)
    const text = new TextDecoder().decode(decryptedData)

    if (!senderPublicKey) {
        return text
    }

    const verified = RSA.verify(senderPublicKey, signature, decryptedData)

    if (verified) {
        return text
    }
}


/**
 * 初始化密钥对
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
