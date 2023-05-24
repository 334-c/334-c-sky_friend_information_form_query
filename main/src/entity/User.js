class User {
  id; data; sentences; isDelete;
  /**
   * 
   * @param {String} id 数据
   * @param {String} data 数据
   * @param {String} sentences 可背搜索的句子，该数据未编码，为明文数据
   * @param {Boolean} isDelete 是否删除
   */
  constructor(id, data, sentences, isDelete) {
    this.id = id;
    this.data = data;
    this.sentences = sentences;
    this.isDelete = isDelete;
  }
}
module.exports = User;