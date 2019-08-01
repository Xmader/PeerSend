// @ts-check

const { initKeyPair, encryptAndSign, decryptAndVerify } = require("./core.js")

const text = "你好";

(async () => {
    const AK = (await initKeyPair()).publicKeyE
    const BK = (await initKeyPair()).publicKeyE

    console.log("AK", AK)
    console.log("BK", BK)

    // A
    const message = await encryptAndSign(text, BK)
    console.log(message)

    // B
    const output = await decryptAndVerify(message, AK)
    console.log(output)

})()
