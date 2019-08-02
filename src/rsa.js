// @ts-check

/** @type {Crypto} */
const cryptoObj = window.crypto || window["msCrypto"] // for IE 11
const subtle = cryptoObj.subtle

const hashAlgorithm = "SHA-256"

/** @typedef {"RSA-OAEP" | "RSA-PSS"} RSAKeyAlgorithm */
/** @type {RSAKeyAlgorithm[]} */
const keyAlgorithmList = ["RSA-OAEP", "RSA-PSS"]

/** @type {RsaHashedKeyGenParams} */
const genKeyOpts = {
    name: "RSA-PSS",
    hash: hashAlgorithm,
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01])
}

/** @type {RsaPssParams} */
const signOpts = {
    name: "RSA-PSS",
    saltLength: 32,
}

/** @type {RsaOaepParams} */
const encryptOpts = {
    name: "RSA-OAEP"
}

/** @typedef {"encrypt" | "decrypt" | "sign" | "verify"} Usage */

/** @type {Usage[]} */
const keyUsages = [
    "encrypt",
    "decrypt",
    "sign",
    "verify",
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

/** @typedef {NodeJS.TypedArray | DataView | ArrayBuffer} BinaryData */

// TODO: IE returns CryptoOperation instead of Promise

/**
 * @param {CryptoKey} key 
 */
const exportKeyObj = async (key) => {
    return subtle.exportKey("jwk", key)
}

/**
 * @param {RSAKeyAlgorithm} keyAlgorithm
 */
const _checkRSAKeyAlgorithm = (keyAlgorithm) => {
    if (!keyAlgorithmList.includes(keyAlgorithm)) {
        throw new TypeError("unknown key algorithm:" + keyAlgorithm)
    }
}

/**
 * @param {JsonWebKey} keyObj 
 * @param {RSAKeyAlgorithm} keyAlgorithm
 * @param {Usage} usage
 */
const importKeyObj = async (keyObj, keyAlgorithm, usage) => {
    _checkRSAKeyAlgorithm(keyAlgorithm)
    return subtle.importKey("jwk", keyObj, { name: keyAlgorithm, hash: hashAlgorithm }, true, [usage])
}

/**
 * @param {CryptoKey} key 
 * @param {RSAKeyAlgorithm} destAlgorithm
 */
const convertKey = async (key, destAlgorithm) => {
    _checkRSAKeyAlgorithm(destAlgorithm)

    const keyObj = await exportKeyObj(key)
    const usage = usageMap[destAlgorithm][key.type]

    keyObj.alg = destAlgorithm == "RSA-OAEP" ? "RSA-OAEP-256" : "PS256"
    keyObj.key_ops = [usage]

    return importKeyObj(keyObj, destAlgorithm, usage)
}

const generateRSAKeyPair = async () => {
    const keyPair = await subtle.generateKey(genKeyOpts, true, keyUsages)
    return keyPair
}

/**
 * @param {CryptoKey} key 
 * @param {RSAKeyAlgorithm} algorithm
 */
const _autoConvertKey = async (key, algorithm) => {
    _checkRSAKeyAlgorithm(algorithm)

    if (key.algorithm.name !== algorithm) {
        key = await convertKey(key, algorithm)
    }

    return key
}

/**
 * @param {CryptoKey} privateKey 
 * @param {BinaryData} data 
 */
const sign = async (privateKey, data) => {
    privateKey = await _autoConvertKey(privateKey, "RSA-PSS")
    const signature = await subtle.sign(signOpts, privateKey, data)
    return new Uint8Array(signature)
}

/**
 * @param {CryptoKey} publicKey 
 * @param {BinaryData} signature 
 * @param {BinaryData} data 
 */
const verify = async (publicKey, signature, data) => {
    publicKey = await _autoConvertKey(publicKey, "RSA-PSS")
    return subtle.verify(signOpts, publicKey, signature, data)
}

/**
 * @param {BinaryData} data 
 * @param {number} blockSize
 */
const splitBlocks = (data, blockSize) => {
    // convert to ArrayBuffer
    if (!(data instanceof ArrayBuffer)) {
        data = data.buffer
    }

    /** @type {ArrayBuffer[]} */
    const blocks = []

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
const concatBlocks = (blocks, blockSize) => {
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

/**
 * @param {CryptoKey} publicKey 
 * @param {BinaryData} data 
 */
const encrypt = async (publicKey, data) => {
    publicKey = await _autoConvertKey(publicKey, "RSA-OAEP")
    const blocks = splitBlocks(data, maxDataBlockSize)
    const encryptedBlocks = await Promise.all(
        blocks.map((block) => {
            return subtle.encrypt(encryptOpts, publicKey, block)
        })
    )
    return concatBlocks(encryptedBlocks, encryptedBlockSize)
}

/**
 * @param {CryptoKey} privateKey 
 * @param {BinaryData} data 
 */
const decrypt = async (privateKey, data) => {
    privateKey = await _autoConvertKey(privateKey, "RSA-OAEP")
    const encryptedBlocks = splitBlocks(data, encryptedBlockSize)
    const decryptedBlocks = await Promise.all(
        encryptedBlocks.map((block) => {
            return subtle.decrypt(encryptOpts, privateKey, block)
        })
    )
    return concatBlocks(decryptedBlocks, maxDataBlockSize)
}

module.exports = {
    exportKeyObj,
    importKeyObj,
    generateRSAKeyPair,
    sign,
    verify,
    encrypt,
    decrypt,
}
