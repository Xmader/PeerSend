// @ts-check

import { initKeyPair, encryptAndSign, decryptAndVerify, DataType } from "./core"
import { Base256SeparatorChar, BinarySerializer } from "./serialization"

const text = "a".repeat(190 + 1)
const dataObj = { type: DataType.text, data: text };

(async () => {
    const AK = (await initKeyPair("A")).publicKeyE
    const BK = (await initKeyPair("B")).publicKeyE

    console.log("AK", AK)
    console.log("BK", BK)

    console.log("encrypt and decrypt with Base256Serializer (default)")

    // A
    const message = await encryptAndSign(dataObj, BK, "A")
    console.log(message)

    // B
    const output = await decryptAndVerify(message, AK, "B")
    console.log(output)

    console.log("encrypt and decrypt with BinarySerializer")

    // A
    const message1 = await encryptAndSign(dataObj, BK, "A", BinarySerializer)
    console.log(message1)

    // B
    const output1 = await decryptAndVerify(message1, AK, "B", BinarySerializer)
    console.log(output1)

})()
