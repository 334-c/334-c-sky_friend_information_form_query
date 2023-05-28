const { 
    createService, container, getServiceId
} = require("../utils");
/** @type {import("../services/keyToId")} */
const keyToIdService = container.get(getServiceId("KeyToId"));

module.exports = {
    ...require("./baseRouter")(keyToIdService),
    ...createService({
        // 可以在这里继续编写路由...
    })
}
