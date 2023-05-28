require("./anyXlsx");

const axios = require("axios"),
    crypto = require("./crypto"),
    data = require("./data.json"),
    config = require("./config.json")
;

let enData = [];
let readme = `
至读者:
    尊敬的读者你好，此项目为心血来潮而作。
    欢迎参考部分代码的编写/设计方式。
    阅读代码建议使用vscode，因为代码提供了一些jsdoc静态提示信息，需要ide之类支持静态编译的工具进行阅读。
    如果有哪些地方你无法理解，你可以联系我，我可以为你解答。
    此项目永久开源免费。
    原你开心快乐，原幸福与你同在。
`.replace(/\s/g, "");
let key = crypto.createRandomKey(32, readme);
console.log(key);
// 该密钥为联系方式加密生成key的密钥
let authKey = crypto.createRandomKey(32, readme);
let idKey = crypto.createRandomKey(32, "QWERTYUIOPASDFGHJKLZXCVBNM123456789");
// data.sort((b, a)=>{
//     try{
//         return (new Date(a.updateTime.replace(/[年月]/g, "-").replace("日", "")).valueOf()) 
//             - (new Date(b.updateTime.replace(/[年月]/g, "-").replace("日", "")).valueOf())
//     }catch(err){
//         console.log("排序失败！", a, b)
//         return 0;
//     }
// });
// console.log(data)
data.forEach((e, i)=>{
    let user = {
        id: i,
        key: crypto.encode(idKey, e.contact),
        data: userInfo(e),
        sentences: [e.introduction, e.request].join("\n"),
        time: new Date(e.updateTime.replace(/[年月]/g, "-").replace("日", ""))
    }
    // 仅允许需求和自介为明文
    user.data = crypto.encode(key, user.data);

    enData.push(user);
});
/** @param {import("./data.json")[0]} e  */
function userInfo(e){
    // TODO 在这里删除一些数据
    return JSON.stringify(e)
}
let commitData = {
    key: key,           // 混淆密钥，需要发到副服务器
    idKey: idKey,       // 生成id的密钥，需要发到服务器
    authKey: authKey,   // 权限密钥，需要发到服务器和副服务器
    data: enData,       // 混淆过的数据
    ids: [              // 服务器固定id，写在数据库代码表中
        "luoluo334",
        "授权id"
    ],
    updateTime: Date.now()  // 更新时间
}

let defConfig = {
    "port": 81,
    "key": "默认密钥",
    "authKey": "luoluo334",
    "updateTime": 1683985000000,
    "lastReadTime": 1683985000000,
    "lastVersionTime": 1683985000000,
    "ids": [
        "luoluo334",
        "授权id"
    ]
}
if(false){
    axios.post(config.decodeServerUrl, {
        key: commitData.key,
        authKey: commitData.authKey,
        updateTime: commitData.updateTime,
        ids: commitData.ids
    }).then(resp=>{
        console.log("提交密钥结束!", resp.data);
    }).catch(err=>{
        console.log("提交密钥错误!", err);
    });


    // console.log(commitData.data)
    // 提交数据到服务器
    axios.post(config.serverUrl, {
        authKey: commitData.authKey,
        idKey: commitData.idKey,
        data: commitData.data
    }).then(resp=>{
        console.log("提交数据结束!", resp.data);
        delete commitData.data;
        console.log(commitData)
    }).catch(err=>{
        console.log("提交数据错误!", err);
    });
}