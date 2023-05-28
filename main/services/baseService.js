const utils = require("../utils");
const { T } = require("./TYPEDEF");

module.exports = (Class)=>{
    const config = {
        TAG: typeof Class == "string" ? Class : Class.name
    }
    
    Class = utils.container.get(config.TAG);
    /** @type {T.TRepository} */
    const repository = utils.container.get(utils.getRepositoryId(config.TAG));
    const service = utils.createServiceHint(Class, {
        async add({req, res, params}) {
            let obj = utils.paramUtils.createClassObjectByParams(Class, params);
            return await repository.save(obj);
        },
        async addAll({req, res, params}) {
            let objList = [];
            params.forEach(param=>{
                if(typeof param == "object") objList.push(utils.paramUtils.createClassObjectByParams(Class, param))
            })
            return await repository.save(objList);
        },
        async deleteById({req, res, params}) {
            if(!params.id) throw new Error("id不存在!");
            return await repository.delete(params.id);
        },
        async updateById({req, res, params}) {
            if(!params.id) throw new Error("id不存在!");
            let obj = utils.paramUtils.createClassObjectByParams(Class, params);
            return await repository.update(params.id, obj);
        },
        async getAll({req, res, params}) {
            return await repository.find();
        },
        async getById({req, res, params}) {
            return await repository.find({where: {id: params.id}});
        },
        async getByName({req, res, params}) {
            return await repository.find({where: {name: params.name}});
        },
    });
    return {
        repository,
        service: {
            // 给导出的服务添加 name 属性，用于在添加到容器时可以读取到 id
            name: config.TAG,
            // 给热更新提示信息
            hot(){return this},
            ...service
        },
        config,
        Class,
        utils,
        T   // 这里导出的提示信息无效
    };
};
