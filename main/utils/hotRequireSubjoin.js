const cleanCache = require('clear-module');
const fs = require('fs');
const path = require('path');
const exclude = [
    "config.js"
];
const mds = {};
let openStatus = true,              // 默认打开
    nextReadTime = 0,               // 默认首次刷新
    hotRequireTimeStep = 60 * 1000, // 默认 1分钟
    hotRequireTag = "HotRequireTag",// 热更新标记
    readTimeStepMax = 5*60*1000;    // 最大间隔 5分钟

const local = {
    getOpenStatus(){
        readOpenStatus();
        return openStatus;
    },
    /**
     * 检测模块，当 hot 属性返回自身时将被允许
     * @param {Object} module 导出的模块
     * @param {String} path 模块路径
     * @param {Boolean} reRequire 重复引入
     * @param {String} msg 消息 
     * @returns 
     */
    detectionModule(module, path, reRequire, msg){
        let errMsg;
        if(module instanceof Object ) {
            if(module._hotInfo instanceof Object) {
                if(reRequire && module._hotInfo.hotRequireTag == hotRequireTag) {
                    // 重复引入
                    return;
                }
                // 字段被占用
                errMsg = "该模块无法附加热更新，因为_hotInfo字段被占用！";
            }
            if(module.hot !== undefined) {
                errMsg = "该模块无法附加热更新，因为hot字段被占用！";
                if(typeof module.hot == "function") {
                    try{
                        if(module.hot() == module) {
                            // 顺利通过检测就取消抛出异常 
                            errMsg = false;
                        }
                    }catch(e){} // 不处理异常
                }
            } else module._hotInfo = {
                // 热更新标记，用于鉴定重复引入的时候
                hotRequireTag: hotRequireTag,
                // 模块引入时间
                refreshTime: Date.now()
            };
        } else errMsg = "该模块无法进行热更新，因为它不是一个对象或其子类！";
        if(errMsg) {
            console.error("引入的异常模块：", module);
            throw new Error((msg ? (msg + "\n") : "") +  errMsg + `(${path})`);
        }
    },
    /**
     * ! 仅支持导出对象
     * ! 会添加 hot 属性，hot为热更新函数
     * 当 hot 属性返回自身时将被允许加载
     * 从栈中计算文件路径
     * @param {String} modulePath 文件名
     * @param {Boolean} absolute 是否绝对路径
     * @returns {Object} 导入模块的函数，用这个函数调用的话每次都会去检查是否已经更新
     */
    import(modulePath, absolute) {
        // 计算绝对路径
        modulePath = local.calcPath(modulePath, absolute)
        // 导出
        let module = local.require(modulePath, true);
        // 首次导出
        let fisrtRequire = !module._hotInfo;
        // 检测新模块，可以是重复引用
        local.detectionModule(module, path, true, "初始化中...允许重复引用");

        // 如果是重复导出那么就不要重复设置 hot 函数
        if(fisrtRequire) {
            const hot = ()=>{
                let moduleNewState = local.require(modulePath, true)
                if(moduleNewState != module) {
                    let update;
                    if(typeof moduleNewState._hotInfo == "object") {
                        // 需要添加更新时间，用来判断是否是重新引入的模块 
                        if(moduleNewState._hotInfo.refreshTime != module._hotInfo.refreshTime) {
                            update = true;
                        }
                    } else update = true;    // 不存在热更新信息 

                    if(update) {
                        // 检测新模块 ? 不知道这里需不需要重复引用，先不给吧
                        local.detectionModule(moduleNewState, path, false, "热更新中...");
                        // 清空原模块内容
                        for (const key in module) {
                            delete module[key]
                        }
                        // 覆盖原模块内容
                        for (const key in moduleNewState) {
                            module[key] = moduleNewState[key];
                        }
                        // 恢复当前热更新函数
                        module.hot = hot;
                    }
                }
                return module;
            };
            module.hot = hot;
        }
        return module
    },
    /**
     * 从栈中计算文件路径
     * @param {String} modulePath 文件名
     * @param {Boolean} absolute 是否绝对路径
     * @param {Number} depth [4]默认值用于计算直接调用 require的，如果包装过就必须进行修改
     * @returns {String} path 模块文件路径
     */
    calcPath(modulePath, absolute, depth){
        let dir;
        if(absolute) {
            dir = modulePath;
        } else {
            // 自动去读取真实文件路径
            dir = readStackInfo(depth || 4).path;
            dir = dir.substring(0, dir.lastIndexOf("\\")) + "/";
            dir = path.join(dir, modulePath);
        }
        return dir;
    },
    /**
     * 导入模块
     * @param {String} modulePath 文件名
     * @param {Boolean} absolute 是否绝对路径
     * @param {Number} depth [4]默认值用于计算直接调用 require的，如果包装过就必须进行修改
     * @returns {Any} 模块导出的数据
     */
    require(modulePath, absolute, depth) {
        readOpenStatus();
        let dir = local.calcPath(modulePath, absolute, depth);
        let modPath;
        if(!fs.existsSync(dir)) {
            if(fs.existsSync(dir + ".js")) {
                dir += ".js";
            } else if(fs.existsSync(dir + "/index.js")) {
                dir += "/index.js";
            }
        }
        modPath = dir;
        let nowModule = mds[modPath];
        let reload;
        if(!nowModule) {
            // 首次加载
            reload = true;
        } else if(openStatus){
            // 检测文件大小是否一样
            if(fs.statSync(modPath).size != nowModule.size) {
                // 清理
                cleanCache(modPath);
                // 重新加载
                reload = true;
            }   // 如果需要检测文件 md5的话写在这里
        }
        if(reload) {
            mds[modPath] = myRequire(modPath);
        }
        return mds[modPath].exports;
    }
}
module.exports = local;
/**
 * 读取热更新打开状态，
 * @deprecated 当前项目中不需要读取是否打开 
 */
function readOpenStatus(){
    if(nextReadTime < Date.now()) {
        let conf = "../config/conf";
        cleanCache(conf);
        conf = require(conf);
        if(0 < conf.readTimeStep && conf.readTimeStep <= readTimeStepMax) {
            hotRequireTimeStep = conf.hotRequireTimeStep
        }
        nextReadTime = Date.now() + hotRequireTimeStep;
        openStatus = conf.hotRequire;
    }
}
/**
 * 读取热更新打开状态，
 */
function readOpenStatus(){
    return true
}
/**
 * 导入模块
 * @param {String} path 模块路径
 * @returns {Object} {exports, size}
 */
function myRequire(path) {
    if(!fs.existsSync(path)) {
        throw new Error("模块不存在！" + `(${path})`)
    }
    return {
        exports: require(path),
        size: fs.statSync(path).size
    }
}


/**
 * 读取栈信息
 * @param {Number} depth 深度
 * @param {String} stackStr 栈信息
 * @returns {{status: 状态, path: 路径, name: 名字}} 
 */
function readStackInfo(depth = 2, stackStr = new Error().stack) {
    let re, info = stackStr.split("at ");
    if (info.length < depth) {
        re = { status: false }
    } else {
        let stackStrLine = info[depth];
        if (-1 < stackStrLine.indexOf(")")) {
            if (-1 < stackStrLine.indexOf(":")) {
                re = read1(stackStrLine);
            } else re = read2(stackStrLine);
        } else re = read3(stackStrLine);
    }
    return Object.assign({ stetus: true, name: "", path: "", line: "" }, re);
}
/**
 * 解析这种类型的栈信息
     at D:\Work\poject\reptile\nodejs\rep-tax\routers\hunan\info.js:156:18
* @param {String} stackStrLine 要解析的一条栈信息
* @returns {Object} {status, name, path, line}
*/
function read3(stackStrLine) {
    let info = stackStrLine.split("at ").pop().split(":");
    let path = [info.shift(), info.shift()].join(":");
    let line = [info.shift(), info.shift()].join(":");
    return { path, line }
}
/**
 * 解析这种类型的栈信息
     at new Promise (<anonymous>)
* @param {String} stackStrLine 要解析的一条栈信息
* @returns {Object} {status, name, path, line}
*/
function read2(stackStrLine) {
    let info = stackStrLine.split("at ").pop();
    info = info.split(" (");
    let name = info.shift();
    let path = info.shift().split(")").shift();
    return { name, path }
}
/**
 * 解析这种类型的栈信息
     at log (D:\Work\poject\reptile\nodejs\rep-tax\utils\log.js:135:25)
* @param {String} stackStrLine 要解析的一条栈信息
* @returns {Object} {status, name, path, line}
*/
function read1(stackStrLine) {
    let info = stackStrLine.split("at ").pop().split(" (");
    let name = info.shift();
    info = info.shift().split(")").shift().split(":");
    let path = [info.shift(), info.shift()].join(":");
    let line = [info.shift(), info.shift()].join(":");
    return { name, path, line }
}