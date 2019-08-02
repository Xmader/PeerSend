// @ts-check

const { initKeyPair, encryptAndSign, decryptAndVerify } = require("./core.js")

const text = "你好";

(async () => {
    const AK = (await initKeyPair("A")).publicKeyE
    const BK = (await initKeyPair("B")).publicKeyE

    console.log("AK", AK)
    console.log("BK", BK)

    // A
    const message = await encryptAndSign(text, BK, "A")
    console.log(message)

    // B
    const output = await decryptAndVerify(message, AK, "B")
    console.log(output)

})()
