const { 
    createService, hotRequireSubjoin, createSimpleRouter, appendHotHint, container, getServiceId
} = require("../utils");
/** @type {import("../services/sky")} */
const skyService = container.get(getServiceId("User"));
// const skyService = hotRequireSubjoin.import("../services/sky");

module.exports = {
    ...require("./baseRouter")(skyService),
    ...createService({
        find: createSimpleRouter("查询成功", "查询失败", (...args)=>skyService.hot().find.apply(skyService, args)),
        commit: createSimpleRouter("提交成功", "提交失败", (...args)=>skyService.hot().commit.apply(skyService, args)),
        /** 解密接口示例 */
        decode(req, res) {
            /** @type {[ { id: 1, data: 'ausfgvaisfbvgabfgljkaugbka', isDelete: false } ]} */
            let data = req.body.data;
            let id = req.body.id;
            data.forEach(e=>{
                e.data = id + "已解密" + e.data;
            });
            res.send(data);
        },
    })
}