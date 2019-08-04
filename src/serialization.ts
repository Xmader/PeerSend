import BASE256 from "./base256"

interface SerializationInit {
    encryptedData: Uint8Array;
    signature: Uint8Array;
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
        const [encryptedDataE, signatureE] = serializedData.split(Base256SeparatorChar)
        const encryptedData = BASE256.decode(encryptedDataE)
        const signature = BASE256.decode(signatureE)
        return {
            encryptedData,
            signature,
        }
    }

}


const _getTotalLength = (...args: NodeJS.TypedArray[]) => {
    return args.reduce((p, c) => {
        return p + c.byteLength
    }, 0)
}

export const BinarySerializer: Serializer<Uint8Array> = {

    async serialize(init: SerializationInit) {
        const { encryptedData, signature } = init

        const arrayBuf = new ArrayBuffer(
            _getTotalLength(encryptedData, signature)
            + 4 * 2  // Uint32 4 bytes * 2
        )

        const dataView = new DataView(arrayBuf)
        const buf = new Uint8Array(arrayBuf)  // share the same ArrayBuffer

        let len = 0

        const setLengthPrefixedData = (data: Uint8Array) => {
            const dataLength = data.byteLength
            dataView.setUint32(len, dataLength)
            len += 4
            buf.set(data, len)
            len += dataLength
        }

        setLengthPrefixedData(encryptedData)
        setLengthPrefixedData(signature)

        return buf
    },

    async deserialize(serializedData: Uint8Array) {
        const dataView = new DataView(serializedData.buffer)

        let len = 0

        const getLengthPrefixedData = () => {
            const dataLength = dataView.getUint32(len)
            len += 4
            const data = serializedData.slice(len, len + dataLength)
            len += dataLength
            return data
        }

        const encryptedData = getLengthPrefixedData()
        const signature = getLengthPrefixedData()
        
        return {
            encryptedData,
            signature,
        }
    }

}
