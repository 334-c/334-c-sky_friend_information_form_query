const {
    repository,
    service,
    config,
    Class,
    utils
} = require("./baseService")("CodeMap");
const {
    createServiceHint
} = utils;
const { T } = require("./TYPEDEF");
/** @type {T.CCodeMap} */
const CodeMap = Class;

const services = {...service, ...createServiceHint(CodeMap, {
    // 在这里可以添加其他服务...
})};
module.exports = services;