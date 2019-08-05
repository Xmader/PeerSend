// @ts-check

import { initKeyPair, encryptAndSign, decryptAndVerify, DataType } from "./core"
import { BinarySerializer } from "./serialization"

const text = "a".repeat(190 + 1)
const dataObj = { type: DataType.text, data: text };
// const d = new Uint8Array(128 * 1024)
// const dataObj = { type: DataType.file, data: d };

(async () => {
    const AK = (await initKeyPair("A")).publicKeyE
    const BK = (await initKeyPair("B")).publicKeyE

    console.log("AK", AK)
    console.log("BK", BK)

    console.log("encrypt and decrypt with Base256Serializer (default)")

    // A
    console.time("encrypt")
    const message = await encryptAndSign(dataObj, BK, "A")
    console.timeEnd("encrypt")
    console.log(message)

    // B
    console.time("decrypt")
    const output = await decryptAndVerify(message, AK, "B")
    console.timeEnd("decrypt")
    console.log(output)

    console.log("encrypt and decrypt with BinarySerializer")

    // A
    console.time("encrypt")
    const message1 = await encryptAndSign(dataObj, BK, "A", BinarySerializer)
    console.timeEnd("encrypt")
    console.log(message1)

    // B
    console.time("decrypt")
    const output1 = await decryptAndVerify(message1, AK, "B", BinarySerializer)
    console.timeEnd("decrypt")
    console.log(output1)

})()
