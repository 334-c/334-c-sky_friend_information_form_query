const local = {
    /**
     * 获取请求参数对象，query的参数优先级比body的高
     * @param {Requets} req 
     * @returns {Object} 
     */
    getRequestParams(req){
        let re = {};
        if(typeof req.body == "object") {
            re = Object.assign(re, req.body);
        }
        if(typeof req.query == "object") {
            re = Object.assign(re, req.query);
        }
        return  re;
    },
    /**
     * 读取错误信息，不是Error类型就返回自己
     * @param {Error} err 
     * @returns {message:string, stack: Error.stack}
     */
    readError(err) {
        return (err instanceof Error) ? {
            message: err.message, 
            stack: err.stack
        } : err;
    },
    /**
     * 区间取值，如果最大值比最小值小，那么取最小值
     * @param {Number} num 
     * @param {Number} min 
     * @param {Number} max 
     */
    limitNumber(num, min, max) {
        let re = num;
        if(isNaN(num)) {
            if(typeof min == "number") {
                re = min;
            } else {
                re = min || max;
            }
        } else {
            if(typeof num != "number") {
                re = num = Number(num);
            }
            if(max != undefined) {
                if(max < num) {
                    re = max;
                }
            }
            if(min != undefined) {
                if(num < min) {
                    re = min;
                }
            }
        }
        return re;
    },
    /**
     * 去掉字符串的空白字符
     * @param {String} str 
     * @returns 
     */
    trim(str){
        return str.replace(/(^\s*)|(\s*$)/g,"")
        // return str.replace(/\s+/g,"")
    },
    /**
     * 通过类创建对象
     * @param {Class} Class 类
     * @param {Object} params 参数
     * @returns {class: Class}
     */
    createClassObjectByParams(Class, params) {
        let obj = new Class();
        for (const key in obj) {
            if (params[key] != undefined) {
                obj[key] = params[key];
            } else delete obj[key];
        }
        return obj
    }
}
module.exports = local;