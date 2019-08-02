// @ts-check

import { initKeyPair, encryptAndSign, decryptAndVerify } from "./core"

const text = "a".repeat(190 + 1);

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
