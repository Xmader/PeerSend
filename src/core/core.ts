// @ts-check
/* eslint-disable no-unused-vars */

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

/* eslint-enable */

export interface DataObj {
    type: DataType,
    data: string | Uint8Array
}

export interface ResultDataObj extends DataObj {
    verified?: boolean;
}

const _prefixDataByte = (data: Uint8Array, byte: number) => {
    const buf = new Uint8Array(data.byteLength + 1)
    buf[0] = byte
    buf.set(data, 1)
    return buf
}

export const encryptAndSign2 = async <T = string>(
    dataObj: DataObj,
    peerPublicKeyE: string,
    selfPrivateKey: CryptoKey,
    // @ts-ignore
    serializer: Serializer<T> = Base256Serializer
) => {
    const rawData = dataObj.type == DataType.text
        ? new TextEncoder().encode(dataObj.data as string)
        : dataObj.data as Uint8Array

    const prefixedData = _prefixDataByte(rawData, dataObj.type)

    const peerPublicKey = await KEY.importPublicKeyFromE(peerPublicKeyE)
    const encryptedData = await RSA.encrypt(peerPublicKey, prefixedData)

    const signature = await RSA.sign(selfPrivateKey, prefixedData)

    return serializer.serialize({ encryptedData, signature })
}

/**
 * @deprecated
 */
export const encryptAndSign = async <T = string>(
    dataObj: DataObj,
    peerPublicKeyE: string,
    selfStoreName: string = "self",
    // @ts-ignore
    serializer: Serializer<T> = Base256Serializer
) => {
    const selfPrivateKey = await KEY.getPrivateKey(selfStoreName)
    return encryptAndSign2(dataObj, peerPublicKeyE, selfPrivateKey, serializer)
}


export const decryptAndVerify2 = async <T = string>(
    serializedData: T,
    selfPrivateKey: CryptoKey,
    /** 发送方的公钥，用来验证签名 */
    senderPublicKeyE?: string,
    // @ts-ignore
    serializer: Serializer<T> = Base256Serializer
) => {
    const { encryptedData, signature } = await serializer.deserialize(serializedData)

    const decryptedPrefixedData = await RSA.decrypt(selfPrivateKey, encryptedData)
    const rawData = decryptedPrefixedData.slice(1)
    const type = decryptedPrefixedData[0]

    const dataObj: ResultDataObj = {
        type,
        data: type == DataType.text
            ? new TextDecoder().decode(rawData)
            : rawData,
    }

    if (!senderPublicKeyE) {
        return dataObj
    }

    let verified: boolean
    try {
        const senderPublicKey = await KEY.importPublicKeyFromE(senderPublicKeyE)
        verified = await RSA.verify(senderPublicKey, signature, decryptedPrefixedData)
    } catch (err) {
        console.error(err)
    }

    dataObj.verified = verified
    return dataObj

}

/**
 * @deprecated
 */
export const decryptAndVerify = async <T = string>(
    serializedData: T,
    /** 发送方的公钥，用来验证签名 */
    senderPublicKeyE?: string,
    selfStoreName: string = "self",
    // @ts-ignore
    serializer: Serializer<T> = Base256Serializer
) => {
    const privateKey = await KEY.getPrivateKey(selfStoreName)
    return decryptAndVerify2(serializedData, privateKey, senderPublicKeyE, serializer)
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
