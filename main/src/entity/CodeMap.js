class CodeMap {
    id; data; code; isDelete;
    /**
     * 
     * @param {String} id 数据
     * @param {String} name 数据
     * @param {String} code 可背搜索的句子，该数据未编码，为明文数据
     * @param {Boolean} isDelete 是否删除
     */
    constructor(id, name, code, isDelete) {
      this.id = id;
      this.name = name;
      this.code = code;
      this.isDelete = isDelete;
    }
}
module.exports = CodeMap;