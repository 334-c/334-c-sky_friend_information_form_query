let xlsx = require('node-xlsx');
let fs = require('fs');
let path = require('path');
const anyPath = (filename)=>path.join(process.cwd().replace("\\main\\scripts", ""), "main/scripts/", filename); 
const conf = {
    filepath: anyPath("（收集结果）.xlsx")
}
console.log(conf.filepath)
// 模板
const dataFormatTemplate = getDataMappingTemplate()
// 提示信息
const { formData } = Bodys();
try{ main() }catch(err){};
module.exports = main;
/**
 * 主程序
 * @param {String} filepath 文件路径
 * @param {Boolean} hideLog 隐藏日志
 * @returns {{
        "updateTime": "2023年5月8日 16:09",
        "language": "中文",
        "agereement": true,
        "server": [
            1
        ],
        "auth": [],
        "wantType": [
            "固玩",
            "监护",
            "崽崽",
            "对象（特指可奔现）",
            "CP（特指仅游戏cp）",
            "普友"
        ],
        "contact": [],
        "age": "16",
        "gender": 1,
        "introduction": "牛波一",
        "request": "牛波二",
        "pictures": []
    }} 数据
 */
function main(filepath, api){
    const data = readXlsx(filepath || conf.filepath);
    // console.log(data)
    let re = [];
    data.forEach(e=>{
        if(typeof e == "object") {
            re.push(analyData(e, dataFormatTemplate));
        }
    });
    if(!api) {
        console.log(re);
        fs.writeFileSync(anyPath("data.json"), JSON.stringify(re, " ", 4));
    }
    return re;
}

/**
 * 获取数据映射模板
 */
function getDataMappingTemplate() {
    // 主语言字段
    const serverMap = {
        "国服": 1,
        "国际服": 2,
        "测试服": 3,
    };
    // 其他语言字段
    Object.assign(serverMap, {
        "Chinese server": serverMap.国服,
        "International server": serverMap.国际服,
        "Test server": serverMap.测试服
    });

    const authMap = {
        "删除信息": "updateTime",
        "区服": "server",
        "交友类型": "wantType",
        "年龄": "age",
        "性别": "gender",
        "联系方式": "contact",
        "自介": "introduction",
        "需求": "request",
        "图片": "pictures",
        "允许系统自动进行配对": "matching",
    };
    Object.assign(authMap, {
        "Delete information": authMap.删除信息,
        "Server": authMap.区服,
        "Desired type of friends": authMap.交友类型,
        "Age": authMap.年龄,
        "Gender": authMap.性别,
        "Contact information": authMap.联系方式,
        "What kind of sky kid are you": authMap.自介,
        "What kind of sky kid are you looking for": authMap.需求,
        "Pictures": authMap.图片,
        "Allow the system to automatically pair": authMap.允许系统自动进行配对,
    });

    const genderMap = {
        "男孩子": 1,
        "女孩子": 2,
        "光之子": 3,
    };
    Object.assign(genderMap, {
        def: genderMap.光之子,
        "boy": genderMap.男孩子,
        "girl": genderMap.女孩子,
        "Sky children": genderMap.光之子,
    });
    return TemplateTip().data({
        "updateTime":   (d) => d['提交时间（自动）'],
        "language":     (d) => d['中文/English'],
        "agereement":   (d) => !!getData(d, "协议"),
        "server":       (d) => {
            let re = [];
            let temp = getData(d, '区服（必填）')
            if(temp != null) {
                temp.split("\n").forEach(e=>{
                    let serve = serverMap[e];
                    if(serve && re.indexOf(serve) < 0) {
                        re.push(serve)
                    }
                });
            }
            return re;
        },
        "auth": 		(d) => {
            let re = [];
            let temp = getData(d, '资料可见权限设置（必填）');
            if(temp != null) {
                temp.split("\n").forEach(e=>{
                    let serve = authMap[e];
                    if(serve && re.indexOf(serve) < 0) {
                        re.push(serve)
                    }
                });
            }
            return re;
        },
        "wantType": 	(d) => {
            let temp = getData(d, "期望交友类型（必填）");
            if(temp != null) {
                return temp.split("\n")
            }
            return [];
        },
        "contact":      (d) => {
            let re = [];
            let temp = getData(d, '联系方式（必填）');
            if(temp != null) {
                re = temp.split(/\s/);
            }
            if(1 < re.length) re.shift();
            return re;
        },
        "age":          (d) => getData(d, "年龄"),
        "gender":       (d) => genderMap[getData(d, "性别")] || genderMap.def,
        "introduction": (d) => getData(d, "您是什么样的光之子"),
        "request": 		(d) => getData(d, "您想要寻找什么样的光之子"),
        "pictures":     (d) => {
            let temp = getData(d, "或许这份收集表单不足以展示您的闪光点，您可以通过图片来说明你的特长！");
            if(temp != null) {
                return temp.split("\n")
            }
            return [];
        },
    })
}
/**
 * 抽取数据
 * @param {Object} data 数据 {k1:v1, k2:v2}
 * @param {Object} toData 要转的数据 {k: (data)=>{return data.k1} }
 * @returns 
 */
function analyData(data, toData) {
    let re = {};
    for (const k in toData) {
        re[k] = typeof toData[k] == "function" ? toData[k](data) : toData[k];
    }
    return re;
}

/**
 * 根据选择的语言进行解析
 * @param {String} p 文件路径
 * @returns 
 */
function readXlsx(p){
    
    let re = readExcelFile(p);
    
    return re;
}

/**
 * 读取一个表格页面的数据并且转成对象列表
 * @param {String} path 文件路径
 * @param {Number} titleLine 字段起始行数（从0开始）
 * @param {String|Number} sheetName 页名或第几页（从0开始）
 * @returns {Array} [{}, {}]
 */
function readExcelFile(path, titleLine = 0, sheetName = 0) {
    let sheetList = xlsx.parse(path);
    let re;
    if(typeof sheetName == "number") {
        sheetList.some((sheet, i)=>{
            if(i == sheetName) {
                re = readSheet(sheet, titleLine)
            }
        })
    } else {
        sheetList.some(sheet=>{
            if(sheet.name == sheetName) {
                re = readSheet(sheet, titleLine)
            }
        })
    }
    return re;
}
/**
 * 读取 Sheet
 * @param {Object} sheet sheet对象 {name: "名字", data: []}
 * @param {Number} titleLine 字段名位于的行数
 * @returns {Array} [{}, {}]
 */
function readSheet(sheet, titleLine = 0) {
    let re = [];
    let keys = [];
    for (let i = 0, lineData = sheet.data[titleLine]; i < lineData.length; i++) {
        keys.push(lineData[i] || i)
    }
    for (let i = titleLine + 1; i < sheet.data.length; i++) {
        let obj = {};
        let lineData = sheet.data[i];
        keys.forEach((key, j)=>{
            obj[key] = lineData[j];
        })
        re.push(obj);
    }
    return re;
}

/**
 * 读取数据，根据data中的字段来选择指定的属性，没有的话就会使用默认的key
 * @param {formData} data 数据
 * @param {String} key 属性名
 * @return {Any} 对应语言的对应翻译字段的数据
 */
function getData(data, key){
    let k = getKeysMap()[data['中文/English']];
    if(k) {
        k = k[key];
    } else {
        console.log("没有读取这个分类！", data['中文/English'], key);
        k = key;
    }
    if(!k) {
        console.log("没有读取到key！", key, data);
        k = key;
    }
    return data[k] || data[key];
}

/**
 * 用于提示信息
 * @example 示例1，直接调用函数(每次调用都会生成新对象，不推荐)
 *	TemplateTip().jbxx({
 *		zgswskfjmc: (d)=>d.aaa
 *	})
 * @example 示例2，定一个对象（推荐）
 * const tempTip = TemplateTip();
 *	tempTip.jbxx({
 *		zgswskfjmc: (d)=>d.aaa
 *	})
 * @tip 需要创建相关模板需要的对象
 */
 function TemplateTip(){
	return {
		/**
		 * 创建基本信息的模板
		 * 实际上还是返回参数本身，这个用来做提示信息
		 * @param {{
		 *	"updateTime":   (d:formData) => 1683640000000,
		 *	"language":     (d:formData) => "cn",
		 *	"agereement":   (d:formData) => true,
		 *	"server":       (d:formData) => ["国服"],
		 *	"auth": 		(d:formData) => ["language", "server"],
		 *	"wantType": 	(d:formData) => ["交友类型", "崽崽"],
		 *	"contact":      (d:formData) => "联系方式",
		 *	"age":          (d:formData) => 22,
		 *	"gender":       (d:formData) => "男",
		 *	"introduction": (d:formData) => "自我介绍",
		 *	"request": 		(d:formData) => "要求",
		 *	"pictures":     (d:formData) => ["图片地址"],
		 * }} T 
		 * @returns 
		 */
        data(T){return T},
	}
}
/**
 * 用于提示信息
 * body 数据模板
 * 
 * 这里放入每一种请求的官方返回数据
 */
function Bodys(){
	return {
		formData: {
            '提交时间（自动）': '2023年5月1日 05:20',
            '中文/English': '中文',
            '欢迎来到光遇（全服）交友申请收集表单（必填）': '我同意协议（版本：2023.5.8）',
            'Welcome to sky Friend Information Collection form（必填）': undefined,
            '协议': '《查看协议》',
            Agreement: undefined,
            '协议详情': '协议修订时间：2023年5月8日 16:20:56',
            'Details of the agreement': undefined,
            '区服（必填）': '国服\n国际服',
            'Server（必填）': undefined,
            '资料可见权限设置（必填）': '区服\n交友类型\n性别\n联系方式\n自介\n需求\n图片\n允许系统自动进行配对',
            'Data visibility permission Settings（必填）': undefined,
            '期望交友类型（必填）': '对象（特指可奔现）\nCP（特指仅游戏cp）\n监护\n崽崽\n固玩',
            'Desired type of friends（必填）': undefined,
            '自定义期望交友类型': undefined,
            'Desired type of friends you want': undefined,
            '联系方式（必填）': 'qq:12345',
            'Contact information（必填）': undefined,
            '年龄': '23',
            Age: undefined,
            '性别': '男孩子',
            Gender: undefined,
            '您是什么样的光之子': '这是\n' +
              '用来\n' +
              '测试\n' +
              '的\n' +
              '\n' +
              '数据\n' +
              '\n',
            'What kind of sky kid are you': undefined,
            '您想要寻找什么样的光之子': '测试数据',
            'What kind of sky kid are you looking for': undefined,
            '或许这份收集表单不足以展示您的闪光点，您可以通过图片来说明你的特长！': 'test_2023-05-01 05.20.00_picture-0_01.png\ntest_2023-05-01 05.20.00_picture-0_01.png',
            'Perhaps this collection form is not enough to showcase your shining points, you can illustrate your talents through pictures!': undefined,
            '提交者（自动）': 'test'
        }
	}
}

/**
 * 这里编写翻译对应的属性名
 * @returns {{
 *       "English": {
 *           '欢迎来到光遇（全服）交友申请收集表单（必填）': 'Welcome to sky Friend Information Collection form（必填）',
 *           '协议': 'Agreement',
 *           '协议详情': 'Details of the agreement',
 *           '区服（必填）': 'Server（必填）',
 *           '资料可见权限设置（必填）': 'Data visibility permission Settings（必填）',
 *           '期望交友类型（必填）': 'Desired type of friends（必填）',
 *           '自定义期望交友类型': 'Desired type of friends you want',
 *           '联系方式（必填）': 'Contact information（必填）',
 *           '年龄': "Age",
 *           '性别': "Gender",
 *           '您是什么样的光之子': 'What kind of sky kid are you',
 *           '您想要寻找什么样的光之子': 'What kind of sky kid are you looking for',
 *           '或许这份收集表单不足以展示您的闪光点，您可以通过图片来说明你的特长！': 'Perhaps this collection form is not enough to showcase your shining points, you can illustrate your talents through pictures!',
 *       }
 *   }}
 */
function getKeysMap(){
    return {
        "中文": {
              '欢迎来到光遇（全服）交友申请收集表单（必填）'                     : '欢迎来到光遇（全服）交友申请收集表单（必填）'
            , '协议'                                                      : '协议'
            , '协议详情'                                                   : '协议详情'
            , '区服（必填）'                                                : '区服（必填）'
            , '资料可见权限设置（必填）'                                      : '资料可见权限设置（必填）'
            , '期望交友类型（必填）'                                         : '期望交友类型（必填）'
            , '自定义期望交友类型'                                           : '自定义期望交友类型'
            , '联系方式（必填）'                                            : '联系方式（必填）' 
            , '年龄'                                                      : '年龄'
            , '性别'                                                      : '性别'
            , '您是什么样的光之子'                                           : '您是什么样的光之子'
            , '您想要寻找什么样的光之子'                                      : '您想要寻找什么样的光之子'
            , '或许这份收集表单不足以展示您的闪光点，您可以通过图片来说明你的特长！'  : '或许这份收集表单不足以展示您的闪光点，您可以通过图片来说明你的特长！'
        },
        "English": {
            '欢迎来到光遇（全服）交友申请收集表单（必填）': 'Welcome to sky Friend Information Collection form（必填）',
            '协议': 'Agreement',
            '协议详情': 'Details of the agreement',
            '区服（必填）': 'Server（必填）',
            '资料可见权限设置（必填）': 'Data visibility permission Settings（必填）',
            '期望交友类型（必填）': 'Desired type of friends（必填）',
            '自定义期望交友类型': 'Desired type of friends you want',
            '联系方式（必填）': 'Contact information（必填）',
            '年龄': "Age",
            '性别': "Gender",
            '您是什么样的光之子': 'What kind of sky kid are you',
            '您想要寻找什么样的光之子': 'What kind of sky kid are you looking for',
            '或许这份收集表单不足以展示您的闪光点，您可以通过图片来说明你的特长！': 'Perhaps this collection form is not enough to showcase your shining points, you can illustrate your talents through pictures!',
        }
    }
}