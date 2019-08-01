// @ts-check
// 将加密后的数据混淆成正常的中文文本

// 随机常用汉字和中文标点
const Chars256 = "按部占这她费，当记商效取一全第前二高港创税采需上观象小入展客统强光们举但节带出人值赛论元头口来场最德院子售走组问类了而金克的十数准改养同求程近推西文学列财于后动所单或验实级大更各技行引法识南优情交传施服研非际道两想到平抓张根农局纪书视只环运现京外示调思款先济样年李议多此也领是没族源三积线定总月变果女么率产电厂策山内指基精织好重收查信专说关下规比选劳就几必青众林整义作治批风目万用花业质个亿条办它装表台参其货主被省形战速城石护我体消负队种进难得身分贸再。马通回日代料又较江话员开至极己面然志理约次势营协决处导划联"

/**
 * @param {NodeJS.TypedArray} data 
 */
const encode = (data) => {
    data = new Uint8Array(data)
    return Array.from(data).map((x) => {
        return Chars256[x]
    }).join("")
}

/**
 * @param {string} str 
 */
const decode = (str) => {
    const arr = str.split("").map((x) => {
        return Chars256.indexOf(x)
    })
    return new Uint8Array(arr)
}

module.exports = {
    encode,
    decode,
}
