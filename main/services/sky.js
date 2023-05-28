const {
    repository,
    service,
    config,
    Class,
    utils
} = require("./baseService")("User");
const {
    createServiceHint, paramUtils, axios, getServiceId, container, getRepositoryId, getServiceFun
} = utils;
const { T } = require("./TYPEDEF");

/** @type {T.CUser} */
const User = Class;

/** @type {T.TRepository} */
const keyToIdRepository = container.get(getRepositoryId("KeyToId"));

/** @type {T.TCodeMapService} */
let codeMapServiceHint;
const getCodeMapService = getServiceFun("CodeMap", codeMapServiceHint);

/** @type {T.TCodeMapService} */
let systemServiceHint;
const getSystemService = getServiceFun("System", systemServiceHint);

const conf = {
    ...{
        pageSizeMax: 50
    }, ...config
}
const services = {...service, hot(){return this}, ...createServiceHint(User, {
    /** 查询数据接口 */
    async find({req, res, params}) {
        /** @type {T.TUser & T.TPage & T.TWords} */
        let p = params;
        let pageNum = paramUtils.limitNumber(p.pageNum, 1);
        let pageSize = paramUtils.limitNumber(p.pageSize, 1, conf.pageSizeMax);
        /** @type {import("typeorm/repository/Repository").Repository} */
        let query = repository.createQueryBuilder('user');
        let words = [];
        let sentences = [];
        try{    // 对 GET 请求的字符串参数做处理，让他支持传递对象
            if(p.data != "object") p.data = JSON.parse(p.data)
        }catch(e){}
        if(typeof p.data == "object") {
            if(p.data.sentences  instanceof Array) {
                sentences = p.data.sentences;
            }
            p.data = p.data.words;
        }
        if(typeof p.data == "string") {
            // 字符串处理，清除对象都有的符号
            p.data.replace(/[\s{}"'.,:]/g, "");
            p.data.split("").forEach(k=>{
                if(0 < paramUtils.trim(k).length && words.indexOf(k) < 0) {
                    words.push(k)
                }
            });
        }

        // 添加条件
        words.forEach((ch, i)=>{
            let key = "data" + i;
            query.orWhere('user.data like :' + key, {[key]: `%${ch}%`});
        });
        sentences.forEach((sentence, i)=>{
            let key = "sentence" + i;
            query.orWhere('user.sentences like :' + key, {[key]: `%${sentence}%`});
        });

        let total = await query.getCount();                     // 获取总数
        query.skip(pageSize * (pageNum - 1)).take(pageSize);    // 分页
        query.addOrderBy("user.time", "DESC");                  // 倒序

        // 修改异常信息进度
        req.errorMessage = "查询异常";
        let re = await query.getMany();
        // 清除 user对象中的 sentences 字段
        re.forEach(user => delete user.sentences);
        // 提交数据到解密，id是当前服务器id，需要保存到数据库中
        let id = (await getCodeMapService().getByName({params: {name: "服务器id"}}))[0].code;
        let url = (await getCodeMapService().getByName({params: {name: "辅助服务器地址"}}))[0].code;
        url += url.endsWith("/") ? "decode" : "/decode";
        // 通过字典表查询当前id和服务器地址
        let resp = await axios.post(url, {data: re, id});
        return {
            users: resp.data,
            pageNum, pageSize, total,
            words, sentences
        };
    },
    /** 提交数据接口 */
    async commit({req, res, params}) {
        req.errorMessage = "data数据无效! 它不是一个有效的数组, 它的类型" + typeof params.data;
        let { data, authKey } = params;
        let userList = [], mapList = [];
        data.forEach((user,  i)=>{
            if(user.id == undefined) throw new Error(`第${i}条数据不存在id`);
            if(user.data == undefined) throw new Error(`第${i}条数据不存在data`);
            if(user.key == undefined) throw new Error(`第${i}条数据不存在key`);
            user.data = JSON.stringify(user.data);
            userList.push(new User(user.id))
        });
        
        req.errorMessage = "提交失败";
        await getSystemService().auth({params});

        let re;
        if(0 < userList.length) {
            // 清空数据库
            await repository.createQueryBuilder().delete().execute();
            // 保存数据到数据库
            re = await repository.insert(data);
        }
        if(0 < mapList.length) {
            // 清空数据库
            await keyToIdRepository.createQueryBuilder().delete().execute();
            // 保存数据到数据库
            re = await keyToIdRepository.insert(data);
        }

        return re.raw.affectedRows;
    }
})};
module.exports = services;