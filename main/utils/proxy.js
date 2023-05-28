
const resultCode = {
    SUCC: 200,
    FAULT: 210,
    Exception: 400,
    ERROR: 500,
}
const express = require('express'),
    formidable = require('formidable'),
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
// 解析上传的文件
const uploadForm = new formidable.IncomingForm(config.uploadForm);
// 连接数据库
const dataSource = new typeorm.DataSource(config.typeormDatabaseConfig);
// 异步初始化，过早执行数据库可能会错误
dataSource.initialize();
const utils = {
    // 当前页面创建的变量
    resultCode, logger, container, app, dataSource, uploadForm,
    createService, isService, result, createSimpleRouter, createServiceHint, 
    getRepositoryId, getServiceId, getEntityManagerId, appendHotHint, getServiceFun, 
    parseFormFile, createPathDirSync,

    // 其他模块
    express, formidable, fs, path, typeorm, glob, axios, 
    // 其他地方的变量或模块
    config, classes, hotRequireSubjoin, paramUtils, 
}
module.exports = utils;

/**
 * 
 * @param {Request} req 请求体
 * @param {IncomingForm} form 默认为系统的 uploadForm
 * @returns {Promise<{ fields: {
 *  "filename": "123465"
 *  }, files: {
 *      "myFile": {
 *          "size": 8722754,
 *          "filepath": "D:\\Project\\光遇交友查询系统\\uploads\\0acea5fba843ba3ec392a5800.2.28.zip",
 *          "newFilename": "0acea5fba843ba3ec392a5800.2.28.zip",
 *          "mimetype": "application/x-zip-compressed",
 *          "mtime": "2023-05-28T14:52:39.828Z",
 *          "originalFilename": "REP-TAX_v1.2.28.zip"
 *      }
 *  } }>} 
 */
async function parseFormFile(req, form){
    if(typeof form != "object") form = uploadForm;
    createPathDirSync(form.uploadDir, true)
    return new Promise((resolve, reject)=>{
        form.parse(req, (err, fields, files) => {
            if (err) {
              reject(err);
            } else {
              resolve({ fields, files });
            }
        });
    });
}

/**
 * 
 * @template T
 * @param {String} serviceId 服务id
 * @param {T} hint 提示信息
 * @returns {()=>T} 
 */
function getServiceFun(serviceId, hint) {
    let id = getServiceId(serviceId);
    return ()=> container.get(id);
}

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
 * @ deprecated 这段注释信息时无效的，存在 bug
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
 * 可以使用 hot(){return this} 来做热更新提示 
 * 使用 name: "System" 来做容器名称
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

/**
 * 创建文件的前置文件夹
 * @param {String} dirPath 文件路径
 * @param {Boolean} endDir 创建最后一个文件名为文件夹
 * @returns 
 */
function createPathDirSync(dirPath, endDir) {
    if (dirPath == null || dirPath == "") return;
    dirPath = isAbsolute(dirPath) ? path.normalize(dirPath) : path.join(process.cwd(), dirPath);
    if (fs.existsSync(dirPath)) return;
    var arr = (dirPath).split(path.sep);
    var index = arr.length - 1;
    var tempStr = arr[index];
    while (tempStr == "" && arr.length > 0) {
        index--;
        tempStr = arr[index];
    }
    if (tempStr == "") return;
    var newPath = dirPath.substring(0, dirPath.length - tempStr.length - 1);
    if (!fs.existsSync(newPath)) createPathDirSync(newPath, true);
    if(endDir) fs.mkdirSync(dirPath);
}
function isAbsolute(filePath) {
    filePath = path.normalize(filePath);
    if (filePath.substring(0, 1) == "/") return true;
    if (filePath.search(/[\w]+:/) == 0) return true;
    return false;
}