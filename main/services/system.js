const {
    createServiceHint, axios, getServiceId, container, paramUtils, formidable, parseFormFile, fs
} = require("../utils");
const { T } = require("./TYPEDEF");
const analyData = require("../scripts");

/** @type {T.TSkyService} */
const skyService = container.get(getServiceId("User"));
/** @returns {T.TCodeMapService} */
const getCodeMapService = ()=> container.get(getServiceId("CodeMap"));


const services = {hot(){return this}, name: "System",  ...createServiceHint({},{
    /** 提交数据接口 */
    async updateData({req, res, params}) {
        req.errorMessage = "验证权限中...";
        // 验证权限 
        await this.auth({params});
        
        // 下载文件
        req.errorMessage = "上传文件中...";
        let re = await parseFormFile(req);
        let pathList = [];
        Object.keys(re.files).forEach(name=>{
          pathList.push(re.files[name].filepath);
        });

        // 解析文件
        req.errorMessage = "解析数据中...";
        let commitData = analyData(pathList[0]);
        pathList.forEach(filepath=>{
          // 删除刚刚上传的所有文件
          fs.rmSync(filepath)
        });

        let url = (await getCodeMapService().getByName({params: {name: "辅助服务器地址"}}))[0].code;
        // 提交密钥
        req.errorMessage = "提交密钥中...";
        let { data } = await axios.post(paramUtils.appendUri(url, "upconf"), {
            key: commitData.key,
            authKey: commitData.authKey,
            updateTime: commitData.updateTime,
            ids: commitData.ids
        });

        req.errorMessage = "提交数据中...";
        // 提交数据到服务器
        let commitInfo = await skyService.commit({
            req, 
            params: {
                authKey: commitData.authKey,
                idKey: commitData.idKey,
                data: commitData.data
            }
        });

        return {
            key: commitData.key,
            authKey: commitData.authKey,
            commitInfo,
            keyInfo: data
        }
    },
    /** 能正常执行完就是有权限，没权限会抛出异常 */
    async auth({req, res, params}){
        let { authKey } = params;
        // 查询服务器地址
        let url = (await getCodeMapService().getByName({params: {name: "辅助服务器地址"}}))[0].code;
        url = paramUtils.appendUri(url, "auth");
        // 查询权限
        let { data: auth } = await axios.post(url, {authKey});
        if(auth != true) throw Error ("鉴权失败");
    },
})};
module.exports = services;