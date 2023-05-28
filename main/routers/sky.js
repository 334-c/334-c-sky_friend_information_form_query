const { 
    createService, createSimpleRouter, container, getServiceId
} = require("../utils");
/** @type {import("../services/sky")} */
const skyService = container.get(getServiceId("User"));

module.exports = {
    ...require("./baseRouter")(skyService),
    ...createService({
        find: createSimpleRouter("查询成功", "查询失败", (...args)=>skyService.hot().find.apply(skyService, args)),
        commit: createSimpleRouter("提交成功", "提交失败", (...args)=>skyService.hot().commit.apply(skyService, args)),
    })
}