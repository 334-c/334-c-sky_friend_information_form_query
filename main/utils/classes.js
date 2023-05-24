
class KeyNotInContainerError extends Error {
    constructor(message) {
        super(message);
        this.name = "KeyNotInContainerError";
    }
}
class containerValueIsUndefinedError extends Error {
    constructor(message) {
        super(message);
        this.name = "containerValueIsUndefinedError";
    }
}
/**
 * 容器
 */
class Container {
    objects = {};

    constructor() {
    }

    set(key, object) {
        return (this.objects[key] = object)
    }
    get(key) {
        if(key in this.objects) {
            let re = this.objects[key];
            if(re === undefined) {
                throw new containerValueIsUndefinedError("容器中的这个值是未定义");
            }
            return re;
        } else {
            throw new KeyNotInContainerError("容器中没有这个key:" + key);
        }
    }
}
class Result{
    code; msg; data; type = "cli";
    constructor(code, msg, data, type) {
        this.code = code;
        this.msg = msg;
        this.data = data;
        this.type = type;
    }
}
/**
 * 不是服务错误
 */
class NotIsServiceError extends Error{
    constructor(message){
        super(message);
        this.name = "NotIsServiceError";
    }
}
/**
 * 热更新提示
 */
class Hot{
    constructor(){}
    hot(){
        return this
    }
}
/**
 * 页面参数
 */
class Page {
    pageSize;
    pageNum;
    constructor(pageSize, pageNum) {
        this.pageSize = pageSize;
        this.pageNum = pageNum;
    }
}
module.exports = {
    Container, NotIsServiceError, Result, Hot, Page
}