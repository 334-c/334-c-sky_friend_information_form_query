const {
    repository,
    service,
    config,
    Class,
    utils
} = require("./baseService")("KeyToId");
const {
    createServiceHint
} = utils;
/** @type {import("./TYPEDEF").TKeyToId} */
const KeyToId = Class;

const services = {...service, ...createServiceHint(KeyToId, {
    // 在这里可以添加其他服务...
})};
module.exports = services;