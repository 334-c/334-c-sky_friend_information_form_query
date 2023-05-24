const CryptoJS = require("crypto-js");

/**
 * @example
    const key = "随便啦";
    const txt = JSON.stringify({
        "updateTime": "2023年5月8日 16:09",
        "language": "中文",
        "agereement": false,
        "server": [
            1
        ],
        "auth": [],
        "wantType": [
            "固玩",
            "监护",
            "崽崽",
            "对象（特指可奔现）",
            "CP（特指仅游戏cp）",
            "普友"
        ],
        "contact": [],
        "age": "16",
        "gender": 1,
        "introduction": "牛波一",
        "request": "牛波二",
        "pictures": []
    })
    let enTaxt = crypto.encode(key, txt)

    let deObj = crypto.decode(key, enTaxt);

    console.log("----------------------------------------")
    console.log(txt)
    console.log("----------")
    console.log(enTaxt)
    console.log("----------")
    console.log(deObj)
    console.log("----------------------------------------")

 */
module.exports = {
    /**
     * 创建随机数
     * @param {Number} len
     * @param {String} 基础字符串
     * @returns {String} 随机字符串
     */
    createRandomKey(len = 32, baseWords = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz") {
        let re = [], words = baseWords.split("");
        for (let i = 0; i < len; i++) {
            re.push(words[parseInt(Math.random() * words.length)]);
        }
        return re.join("");
    },
    /**
     * 计算预留位置
     * @param {String} key 
     * @param {Number} len 
     * @returns 
     */
    getArray(key, len) {
        let md5 = CryptoJS.MD5(key).toString();
        let chs = [];
        md5.split("").forEach(ch=>{
            chs.push(ch.charCodeAt());
        });
        let re = new Array(len), sort;
        for (let i = 0; i < len; i++) {
            let index = chs[i%chs.length];
            let nowIndex = index % len;
            do {
                if(re[nowIndex] === undefined) {
                    re[nowIndex] = i;
                    sort = !sort;
                    break;
                } else {
                    if(sort) {
                        index++;
                    } else {
                        index--;
                        if(index < 0 ) index = len - 1;
                    }
                    nowIndex = index % len;
                }
            }while(true);
        }
        return re;
    },

    /**
     * 加密
     * @param {String} key 密钥
     * @param {Any} data 参数
     * @returns {String}
     */
    encode(key, data) {
        if(typeof data != "string") data = JSON.stringify(data);
        let re = this.getArray(key, data.length);
        re.forEach((j,i)=>{
            re[i] = data[j];
        });
        re = re.join("");
        return re;
    },
    /**
     * 解密
     * @param {String} key 密钥
     * @param {String} data 参数
     * @returns {String}
     */
    decode(key, data) {
        let re = this.getArray(key, data.length);
        let text = new Array(data.length);
        data = data.split("");
        re.forEach((j,i)=>{
            text[j] = data[i];
        });
        text = text.join("");
        return text;
    }
}