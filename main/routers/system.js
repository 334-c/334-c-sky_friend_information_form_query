const { 
    createService, createSimpleRouter, container, getServiceId
} = require("../utils");
/** @type {import("../services/system")} */
const skyService = container.get(getServiceId("System"));

module.exports = {
    ...createService({
        updateData: createSimpleRouter("更新成功", "更新失败", (...args)=>skyService.hot().updateData.apply(skyService, args)),
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