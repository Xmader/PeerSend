// @ts-check

import KEY from "./key"
import RSA from "./rsa"
import { Base256Serializer, Serializer } from "./serialization"

export enum DataType {
    text = 0x00,
    file = 0x7F,
    image = 0x30,
    audio = 0x40,
    video = 0x50,
}

export interface DataObj {
    type: DataType,
    data: string | Uint8Array
}

const _prefixDataByte = (data: Uint8Array, byte: number) => {
    const buf = new Uint8Array(data.byteLength + 1)
    buf[0] = byte
    buf.set(data, 1)
    return buf
}

export const encryptAndSign = async <T = string>(
    dataObj: DataObj,
    peerPublicKeyE: string,
    selfStoreName: string = "self",
    // @ts-ignore
    serializer: Serializer<T> = Base256Serializer
) => {
    const rawData = dataObj.type == DataType.text
        ? new TextEncoder().encode(dataObj.data as string)
        : dataObj.data as Uint8Array

    const prefixedData = _prefixDataByte(rawData, dataObj.type)

    const peerPublicKey = await KEY.importPublicKeyFromE(peerPublicKeyE)
    const encryptedData = await RSA.encrypt(peerPublicKey, prefixedData)

    const selfPrivateKey = await KEY.getPrivateKey(selfStoreName)
    const selfPublicKey = await KEY.getPublicKey(selfStoreName)

    const signature = await RSA.sign(selfPrivateKey, prefixedData)

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

    const decryptedPrefixedData = await RSA.decrypt(privateKey, encryptedData)
    const rawData = decryptedPrefixedData.slice(1)
    const type = decryptedPrefixedData[0]

    const dataObj: DataObj = {
        type,
        data: type == DataType.text
            ? new TextDecoder().decode(rawData)
            : rawData,
    }

    if (!senderPublicKey) {
        return dataObj
    }

    const verified = RSA.verify(senderPublicKey, signature, decryptedPrefixedData)

    if (verified) {
        return dataObj
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
