// @ts-check

const RSA = require("./rsa.js")

const data = new Uint8Array([1, 2, 3]);

(async () => {
    const keyPair = await RSA.generateRSAKeyPair()

    const encrypted = await RSA.encrypt(keyPair.publicKey, data)
    const decrypted = await RSA.decrypt(keyPair.privateKey, encrypted)
    console.log(new Uint8Array(decrypted))

    const signature = await RSA.sign(keyPair.privateKey,data)
    const verified = await RSA.verify(keyPair.publicKey,signature,data)
    console.log(verified)
})()
