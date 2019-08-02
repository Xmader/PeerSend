import BASE256 from "./base256"

interface SerializationInit {
    encryptedData: Uint8Array;
    signature: Uint8Array;
    senderPublicKey?: CryptoKey;
}

export interface Serializer<T> {
    serialize(init: SerializationInit): T
    deserialize(serializedData: T): SerializationInit
}

const Base256SeparatorChar = "还"

export const Base256Serializer: Serializer<string> = {

    serialize(init: SerializationInit) {
        const { encryptedData, signature } = init
        const encryptedDataE = BASE256.encode(encryptedData)
        const signatureE = BASE256.encode(signature)
        return [encryptedDataE, signatureE].join(Base256SeparatorChar)
    },

    deserialize(serializedData: string) {
        const [encryptedDataE, signatureE] = serializedData.split(Base256SeparatorChar)
        const encryptedData = BASE256.decode(encryptedDataE)
        const signature = BASE256.decode(signatureE)
        return {
            encryptedData,
            signature,
        }
    }

}

// @ts-ignore
export const BinarySerializer: Serializer<Uint8Array> = {

}
