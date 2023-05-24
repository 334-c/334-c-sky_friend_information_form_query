const { EntitySchema } = require('typeorm');
const CodeMap = require("./CodeMap");
/*
  name：列的名称。
  type：列的数据类型。
  length：列的长度。
  precision：列的精度。
  scale：列的小数位数。
  default：列的默认值。
  nullable：列是否可以为空。
  unique：列是否唯一。
  primary：列是否为主键。
  generated：列是否为自动生成的。
  enum：列的枚举值。
  array：列是否为数组类型。
  transformer：列的转换器。
  comment：列的注释。
 */
const CodeMapSchema = new EntitySchema({
  name: "CodeMap",
  target: CodeMap,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
      comment: "序号",
    },
    name: {
      type: String,
      nullable: true,
      comment: "代码名",
    },
    code: {
      type: String,
      nullable: true,
      comment: "代码值",
    },
    isDelete: {
      type: Boolean,
      default: false,
      comment: "删除状态",
    },
  },
});

module.exports = CodeMapSchema;