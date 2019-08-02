import BASE256 from "./base256"
import KEY from "./key"

interface SerializationInit {
    encryptedData: Uint8Array;
    signature: Uint8Array;
    senderPublicKey?: CryptoKey;  /** 发送方的公钥，用来验证签名 */
}

export interface Serializer<T> {
    serialize(init: SerializationInit): T | Promise<T>
    deserialize(serializedData: T): SerializationInit | Promise<SerializationInit>
}

export const Base256SeparatorChar = "还"

export const Base256Serializer: Serializer<string> = {

    serialize(init: SerializationInit) {
        const { encryptedData, signature } = init
        const encryptedDataE = BASE256.encode(encryptedData)
        const signatureE = BASE256.encode(signature)
        return [encryptedDataE, signatureE].join(Base256SeparatorChar)
    },

    async deserialize(serializedData: string) {
        const [encryptedDataE, signatureE, senderPublicKeyE] = serializedData.split(Base256SeparatorChar)
        const encryptedData = BASE256.decode(encryptedDataE)
        const signature = BASE256.decode(signatureE)
        const senderPublicKey = senderPublicKeyE && await KEY.importPublicKeyFromE(senderPublicKeyE)
        return {
            encryptedData,
            signature,
            senderPublicKey,
        }
    }

}

// @ts-ignore
export const BinarySerializer: Serializer<Uint8Array> = {

}
