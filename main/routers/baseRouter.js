const { 
    createService, createSimpleRouter
} = require("../utils");

/**
 * @param {import("../services/codeMap")} service 服务
 */
module.exports = (service)=> createService({
    add: createSimpleRouter("添加成功", "添加失败", (...args)=>service.hot().add.apply(service, args)),
    deleteById: createSimpleRouter("删除成功", "删除失败", (...args)=>service.hot().deleteById.apply(service, args)),
    updateById: createSimpleRouter("更新成功", "更新失败", (...args)=>service.hot().updateById.apply(service, args)),
    getAll: createSimpleRouter("获取成功", "获取失败", (...args)=>service.hot().getAll.apply(service, args)),
    getById: createSimpleRouter("获取成功", "获取失败", (...args)=>service.hot().getById.apply(service, args)),
    getByName: createSimpleRouter("获取成功", "获取失败", (...args)=>service.hot().getByName.apply(service, args)),
});