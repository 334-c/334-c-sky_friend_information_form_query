const fs = require("fs"),
    path = require("path"),
    crypto = require("./crypto")
    anyXlsx = require("./anyXlsx")
    ;
/**
 * 读取当前目录的文件
 * @param {String} filename 文件名
 * @returns {String} 文件路径
 */
const anyPath = (filename)=>path.join(process.cwd().replace("\\main\\scripts", ""), "main/scripts/", filename); 
/**
 * 
 * @param {String} path 文件下载路径，没传就默认
 * @returns {{"key":"在同读码你d血c尊为项免阅的d些此。示无e静代使之来至些分者e为","idKey":"XSBSG4OEOSDJD589REASXUF5ICR3CX33","authKey":"原o你态，分，在编计快迎进的至免参态v读信类你部码进读永代为为些","data":[{"id":0,"key":"][","data":"\"to\"]友\"\"p戏仅特P\"\"现可特象\"\"崽,护\"\"固[\"pTnw,[\"ta,ee:te\"g\"06id:80{e2月a年:9,u\"\"文aee\"tur\"[1:rv\"rerg\"中:eaa\" 53\"\"mTp\"tue2日1lng,mn,se]\"uh:]\"atye:\"玩,监\"\"崽,对（指奔）,C（指游c）,普\",cnat:]\"g\"\"6,gne\"1\"nrdcin:牛一,rqet:牛二,pcue\"[}]:srti\"\"波\"\"sue\"\"波\"\"otuoti,:rde\"\"1:ea,[\"c\"","sentences":"牛波一 牛波二"}],"ids":["luoluo334","授权id"],"updateTime":1685277278700}}
 */
module.exports = (path)=>{
    // 解析文件
    let data = anyXlsx(path, true);
    // let data = JSON.parse(fs.readFileSync(anyPath("data.json")).toString());
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
    data.forEach((e, i)=>{
        let user = {
            id: i,
            key: crypto.encode(idKey, e.contact),
            data: userInfo(e),
            sentences: [e.introduction, e.request].join("\n")
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
    return commitData;
}