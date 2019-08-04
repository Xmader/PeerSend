// @ts-check

const cryptoObj: Crypto = window.crypto || window["msCrypto"] // for IE 11
const subtle = cryptoObj.subtle

const hashAlgorithm = "SHA-256"

type RSAKeyAlgorithm = "RSA-OAEP" | "RSA-PSS"
const keyAlgorithmList: RSAKeyAlgorithm[] = ["RSA-OAEP", "RSA-PSS"]

const genKeyOpts: RsaHashedKeyGenParams = {
    name: "RSA-PSS",
    hash: hashAlgorithm,
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01])
}

const signOpts: RsaPssParams = {
    name: "RSA-PSS",
    saltLength: 32,
}

const encryptOpts: RsaOaepParams = {
    name: "RSA-OAEP"
}

type Usage = "encrypt" | "decrypt" | "sign" | "verify" | "wrapKey" | "unwrapKey"
const keyUsages: Usage[] = [
    "encrypt",
    "decrypt",
    "sign",
    "verify",
    "wrapKey",
    "unwrapKey",
]

const usageMap = {
    "RSA-OAEP": {
        public: "encrypt",
        private: "decrypt",
    },
    "RSA-PSS": {
        public: "verify",
        private: "sign",
    },
}

const maxDataBlockSize = 190  // the maximum block size for RSA 2048 bits with SHA-256 is 190 bytes
const encryptedBlockSize = 256

type BinaryData = NodeJS.TypedArray | DataView | ArrayBuffer

// TODO: IE returns CryptoOperation instead of Promise

/**
 * @param {RSAKeyAlgorithm} keyAlgorithm
 */
const _checkRSAKeyAlgorithm = (keyAlgorithm: RSAKeyAlgorithm) => {
    if (!keyAlgorithmList.includes(keyAlgorithm)) {
        throw new TypeError("unknown key algorithm:" + keyAlgorithm)
    }
}

namespace BlockOperations {

    /**
     * @param {BinaryData} data 
     * @param {number} blockSize
     */
    export const splitBlocks = (data: BinaryData, blockSize: number) => {
        // convert to ArrayBuffer
        if (!(data instanceof ArrayBuffer)) {
            data = data.buffer
        }

        /** @type {ArrayBuffer[]} */
        const blocks: ArrayBuffer[] = []

        for (let i = 0; i < data.byteLength; i += blockSize) {
            const block = data.slice(i, i + blockSize)
            blocks.push(block)
        }

        return blocks
    }

    /**
     * concat blocks with a fixed size, except the last block
     * @param {ArrayBuffer[]} blocks
     * @param {number} blockSize the fixed size for each block
     */
    export const concatBlocks = (blocks: ArrayBuffer[], blockSize: number) => {
        if (blocks.length == 0) {
            return new Uint8Array(0)
        }

        const result = new Uint8Array(
            (blocks.length - 1) * blockSize +
            blocks[blocks.length - 1].byteLength
        )

        blocks.forEach((block, index) => {
            result.set(new Uint8Array(block), index * blockSize)
        })

        return result
    }

}

namespace RSA {

    /**
     * @param {CryptoKey} key 
     */
    export const exportKeyObj = async (key: CryptoKey) => {
        return subtle.exportKey("jwk", key)
    }

    /**
     * @param {JsonWebKey} keyObj 
     * @param {RSAKeyAlgorithm} keyAlgorithm
     * @param {Usage} usage
     */
    export const importKeyObj = async (keyObj: JsonWebKey, keyAlgorithm: RSAKeyAlgorithm, usage: Usage) => {
        _checkRSAKeyAlgorithm(keyAlgorithm)
        return subtle.importKey("jwk", keyObj, { name: keyAlgorithm, hash: hashAlgorithm }, true, [usage])
    }

    export const generateRSAKeyPair = async () => {
        const keyPair = await subtle.generateKey(genKeyOpts, true, keyUsages)
        return keyPair
    }

    /**
     * @param {CryptoKey} privateKey 
     * @param {BinaryData} data 
     */
    export const sign = async (privateKey: CryptoKey, data: BinaryData) => {
        privateKey = await _autoConvertKey(privateKey, "RSA-PSS")
        const signature = await subtle.sign(signOpts, privateKey, data)
        return new Uint8Array(signature)
    }

    /**
     * @param {CryptoKey} publicKey 
     * @param {BinaryData} signature 
     * @param {BinaryData} data 
     */
    export const verify = async (publicKey: CryptoKey, signature: BinaryData, data: BinaryData) => {
        publicKey = await _autoConvertKey(publicKey, "RSA-PSS")
        return subtle.verify(signOpts, publicKey, signature, data)
    }

    /**
     * @param {CryptoKey} publicKey 
     * @param {BinaryData} data 
     */
    export const encrypt = async (publicKey: CryptoKey, data: BinaryData) => {
        publicKey = await _autoConvertKey(publicKey, "RSA-OAEP")
        const blocks = BlockOperations.splitBlocks(data, maxDataBlockSize)
        const encryptedBlocks = await Promise.all(
            blocks.map((block) => {
                return subtle.encrypt(encryptOpts, publicKey, block)
            })
        )
        return BlockOperations.concatBlocks(encryptedBlocks, encryptedBlockSize)
    }

    /**
     * @param {CryptoKey} privateKey 
     * @param {BinaryData} data 
     */
    export const decrypt = async (privateKey: CryptoKey, data: BinaryData) => {
        privateKey = await _autoConvertKey(privateKey, "RSA-OAEP")
        const encryptedBlocks = BlockOperations.splitBlocks(data, encryptedBlockSize)
        const decryptedBlocks = await Promise.all(
            encryptedBlocks.map((block) => {
                return subtle.decrypt(encryptOpts, privateKey, block)
            })
        )
        return BlockOperations.concatBlocks(decryptedBlocks, maxDataBlockSize)
    }

    /**
     * @param {CryptoKey} key 
     * @param {RSAKeyAlgorithm} destAlgorithm
     */
    export const convertKey = async (key: CryptoKey, destAlgorithm: RSAKeyAlgorithm) => {
        _checkRSAKeyAlgorithm(destAlgorithm)

        const keyObj = await exportKeyObj(key)
        const usage = usageMap[destAlgorithm][key.type]

        keyObj.alg = destAlgorithm == "RSA-OAEP" ? "RSA-OAEP-256" : "PS256"
        keyObj.key_ops = [usage]

        return importKeyObj(keyObj, destAlgorithm, usage)
    }

    /**
     * @param {CryptoKey} key 
     * @param {RSAKeyAlgorithm} algorithm
     */
    const _autoConvertKey = async (key: CryptoKey, algorithm: RSAKeyAlgorithm) => {
        _checkRSAKeyAlgorithm(algorithm)

        if (key.algorithm.name !== algorithm) {
            key = await convertKey(key, algorithm)
        }

        return key
    }

}

export = RSA
