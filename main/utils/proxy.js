
const resultCode = {
    SUCC: 200,
    FAULT: 210,
    Exception: 400,
    ERROR: 500,
}
const express = require('express'),
    fs = require("fs"),
    path = require("path"),
    glob = require("glob"),
    typeorm = require("typeorm"),
    classes = require("./classes"),
    config = require("../config/config.json"),
    hotRequireSubjoin = require("./hotRequireSubjoin"),
    paramUtils = require("./param"),
    axios = require("axios").default
;
const logger = console;
const container = new classes.Container();
// 创建 express app
const app = express();
// 连接数据库
const dataSource = new typeorm.DataSource(config.typeormDatabaseConfig);
// 异步初始化，过早执行数据库可能会错误
dataSource.initialize();
const utils = {
    // 当前页面创建的变量
    resultCode, logger, container, app, dataSource, 
    createService, isService, result, createSimpleRouter, createServiceHint, 
    getRepositoryId, getServiceId, getEntityManagerId, appendHotHint,

    // 其他模块
    express, fs, path, typeorm, glob, axios,
    // 其他地方的变量或模块
    config, classes, hotRequireSubjoin, paramUtils,
}
module.exports = utils;

/**
 * 获取在容器中的 EntityManager Id
 * @template T
 * @param {T} obj 类名或名字前缀
 * @returns {T&{hot: ()=>T&{hot: ()=>T&{hot: ()=>T}}}} 返回值
 */
function appendHotHint(obj) {
    return obj
}
/**
 * 获取在容器中的 EntityManager Id
 * @param {String|Class} name 类名或名字前缀
 */
function getEntityManagerId(name) {
    return getContainerId(name, "EntityManager")
}
/**
 * 获取在容器中的 Service Id
 * @param {String|Class} name 类名或名字前缀
 */
function getServiceId(name) {
    return getContainerId(name, "Service")
}
/**
 * 获取在容器中的 Repository Id
 * @param {String|Class} name 类名或名字前缀
 */
function getRepositoryId(name) {
    return getContainerId(name, "Repository")
}
/**
 * 获取容器中的 Id
 * @param {String|Class} name 类名或名字前缀
 * @param {String} idTag 标识标签/后缀
 */
function getContainerId(name, idTag = "Id") {
    if(typeof name == "object" || typeof name == "function") name = name.name;
    return name + idTag;
}
/**
 * 创建简单的服务
 * @param {String} okMsg 成功消息
 * @param {String} errMsg 错误消息
 * @param {({req: Request, res: Response, params: object)=>any} runFun 服务
 * @returns {(req: Request, res: Response)=>any}
 */
function createSimpleRouter(okMsg, errMsg, runFun) {
    return async function(req, res){
        req.errorMessage = errMsg;
        let re = await runFun({req, res, params: paramUtils.getRequestParams(req)});
        re = result(resultCode.SUCC, okMsg, re);
        res.send(re);
        return re;
    }
}
/**
 * 创建服务函数时提供提示信息，返回值中的提示信息不完整，无法提供服务的isService字段提示,而且参数的 resultCode 字段的属性也无法提供
 * @template T
 * @param {T | {[key: string]: (req: express.Request, res: express.Response) => void, resultCode: resultCode, result: result}} serviceObject 服务对象，里面的每一个函数都是接口函数
 * @returns {T | {[key: string]: (req: express.Request, res: express.Response) => void & {isService: true}, resultCode: resultCode, result: result}} serviceObject 服务对象
 */
/**
 * 创建服务函数时提供提示信息，返回值不提供提示信息
 * @param {{[key: string]: (req: express.Request, res: express.Response) => void, resultCode: resultCode, result: result}} serviceObject 服务对象，里面的每一个函数都是接口函数
 * @returns {{[key: string]: (req: express.Request, res: express.Response) => void & {isService: true}, resultCode: resultCode, result: result}} serviceObject 服务对象
 */
function createService(serviceObject) {
    for (const key in serviceObject) {
        if(typeof serviceObject[key] == "function") {
            serviceObject[key].isService = true;
        }
    }
    serviceObject.result = result;
    serviceObject.resultCode = resultCode;
    return serviceObject;
}
/**
 * 创建服务函数时提供提示信息，返回值不提供提示信息
 * @template T
 * @template M
 * @param {T} Class
 * @ param {M | {[key: string]: (p: {req: express.Request, res: express.Response, params: T}) => void}} serviceObject 服务对象，里面的每一个函数都是接口函数
 * @param {M & {[key: string]: (p: {req: express.Request, res: express.Response, params: T}) => void}} serviceObject 服务对象，里面的每一个函数都是接口函数
 * @returns {M} serviceObject 服务对象
 */
function createServiceHint(Class, serviceObject) {
    return serviceObject;
}

/**
 * 检测是否是一个服务
 * @param {Object} service 
 * @returns {Boolean}
 */
function isService(service) {
    return !!service.isService
}
/**
 * 返回值，发送给客户端的数据格式
 * 支持多次封装时不会嵌套更改
 * @param {Number} code 返回码
 * @param {String} msg 消息
 * @param {Object} data 数据
 * @param {Object} type 类型
 * @returns {classes.Result} 
 */
function result(code, msg, data, type) {
    if(data instanceof classes.Result) {
        data.code = code;
        data.msg = msg;
        data.type = type;
        return data;
    }
    if(data instanceof Error) {
        data = {
            message: data.message,
            stack: data.stack
        }
    }
    return new classes.Result(code, msg, data, type);
}