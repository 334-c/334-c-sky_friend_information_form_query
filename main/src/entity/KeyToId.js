class KeyToId {
    id; key; userId; isDelete;
    /**
     * 
     * @param {String} id 数据
     * @param {String} key 数据
     * @param {String} userId 可背搜索的句子，该数据未编码，为明文数据
     * @param {Boolean} isDelete 是否删除
     */
    constructor(id, key, userId, isDelete) {
      this.id = id;
      this.key = key;
      this.userId = userId;
      this.isDelete = isDelete;
    }
}
module.exports = KeyToId;