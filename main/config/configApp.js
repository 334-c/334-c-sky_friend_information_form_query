
/** @param {import("../utils/proxy")} utils  */
module.exports = (utils)=>{
    const conf = {
        routersDir: utils.path.join(__filename, "../../routers"),
        routerExcludes: [
            "idnex.js"
        ],
        entityDir: utils.path.join(__filename, "../../src/entity"),
        entityExcludes: [],
        servicesDir: utils.path.join(__filename, "../../services"),
        serviceExcludes: [],
    }
    // 扫描实体
    utils.fs.readdirSync(conf.entityDir).forEach(name=>{
        let path = conf.entityDir + "/" + name;
        if(name.endsWith(".js") && utils.fs.statSync(path).isFile() && conf.entityExcludes.indexOf(name) < 0) {
            let EntityClass = require(path);
            if(typeof EntityClass == "function" 
            && typeof EntityClass.constructor == "function" 
            && typeof EntityClass.name == "string") {
                // 添加类到容器中
                utils.container.set(EntityClass.name, EntityClass);
                utils.container.set(utils.getRepositoryId(EntityClass), utils.dataSource.getRepository(EntityClass));
            }
        }
    });

    // 扫描服务
    utils.fs.readdirSync(conf.servicesDir).forEach(name=>{
        let path = conf.servicesDir + "/" + name;
        if(name.endsWith(".js") && utils.fs.statSync(path).isFile() && conf.serviceExcludes.indexOf(name) < 0) {
            let servicePath = path;
            // 对该服务模块提供热更新操作，使用热更新需要调用 hot() 属性函数
            let service = utils.hotRequireSubjoin.import(servicePath, true);
            let id = utils.getServiceId(service);
            if(["undefinedService", "Service", "nullService"].indexOf(id) < 0) {
                utils.container.set(id, service);
            } else {
                utils.logger.log(id, "服务未被添加到容器中", servicePath)
            }
        }
    });
    
    // 配置 express
    configExpress(utils)
    let routers = new utils.express.Router();
    let apiList = [];
    // 扫描接口
    utils.fs.readdirSync(conf.routersDir).forEach(name=>{
        let path = conf.routersDir + "/" + name;
        if(name.endsWith(".js") && utils.fs.statSync(path).isFile() && conf.routerExcludes.indexOf(name) < 0) {
            let routerPath = path;
            // 对该服务模块提供热更新操作，使用热更新需要调用 hot() 属性函数
            let router = utils.hotRequireSubjoin.import(routerPath, true);
            utils.container.set(name, router);
            for (const k in router) {
                if(utils.isService(router[k])) {
                    let apiPath = "/" + name.substring(0, name.length - ".js".length) + "/" + k;
                    // 添加接口，没有被添加的接口将不会被监听热更新操作，也就是说程序启动后只可以修改现有接口
                    routers.all(apiPath, async function(req, res){
                        try{
                            // hot 属性来自热更新, 后面使用apply是为了把参数全部转移过去
                            await router.hot()[k].apply(router, arguments);
                        }catch(err){
                            utils.logger.error(apiPath, err);
                            // 异常处理
                            res.json(utils.result(utils.resultCode.FAULT, req.errorMessage || "操作失败",  utils.config.faultErrMsgStack ? err : err.message));
                        }
                    });
                    apiList.push(apiPath);
                }
            }
        }
    });
    utils.app.use(routers);

    utils.logger.log("接口总数" + apiList.length, apiList);

    // 全局异常捕获，需要放到路由之后
    utils.app.use((err, req, res, next)=>{
        return res.json(utils.result(utils.resultCode.ERROR, "服务器错误", err));
    });
}
/**
 * 配置 Express 
 * @param {import("../utils/proxy")} param0 
 */
function configExpress({app, result, resultCode, logger, express, path}) {
    const timeout = require('connect-timeout'); //express v4
    const session = require("express-session");
    const cookieParser = require('cookie-parser');
    const NedbStore = require('nedb-session-store')(session);
    require('express-async-errors');
    
    // parse cookie
    app.use(cookieParser())
    // express session 读取方式：req.session
    app.use(session({
        secret: "luoluo334",
        name: "SkyFriend",
        // 不使用本地文件存储 session 
        cookie: {
            maxAge: 10 * 24 * 60 * 60 * 1000 // 超时10天
        },
        resave: false,              // 无论情况，每次都重新设置一个cookie
        // 设置为 true会增加ck的保存频率，增加服务器负担，设置为 false不会给前端设置 ck
        saveUninitialized: false,    // 即使没有被修改，也保存
        // 本地存储 session 
        store: new NedbStore({
            filename: path.join(process.cwd(), "run-data", 'path_to_nedb_persistence_file.db')
        })
    }))
    
    // 超时5分钟
    app.use(timeout(5 * 60 * 1000));
    // json 数据解析
    app.use(express.json({}));
    // form 数据解析
    app.use(express.urlencoded({ extended: true /* 是否转换成对象 */}));

    /**
     * 保存用户最后一次访问时间
     */
    app.use(function (req, res, next) {
        next();
        if(typeof req.body != "object" || !req.body.systemRequest) {
            res.once('close', ()=>{
                req.session.lastRequest = Date.now();
            });
        }
    });

    // 静态资源
    app.use('/static', express.static(path.join(__dirname, "../src/view")));
}