const { 
    createService, hotRequireSubjoin, container, getServiceId
} = require("../utils");
/** @type {import("../services/codeMap")} */
const codeMapService = container.get(getServiceId("CodeMap"));
// const codeMapService = hotRequireSubjoin.import("../services/codeMap");

module.exports = {
    ...require("./baseRouter")(codeMapService),
    ...createService({
        // 可以在这里继续编写路由...
    })
}
