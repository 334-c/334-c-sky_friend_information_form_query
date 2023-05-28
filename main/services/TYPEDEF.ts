import classes from "../utils/classes";
import User from "../src/entity/User";
import skyService from "./sky";
import CodeMap from "../src/entity/CodeMap";
import CodeMapService from "./codeMap";
import KeyToId from "../src/entity/KeyToId";
import KeyToIdService from "./keyToId";
import { Repository } from "typeorm/repository/Repository";

/**
 * 类型提示信息
 */
export class T {
    /** Page 分页对象类 */
    static CPage = classes.Page;
    /** User/Sky 用户对象类 */
    static CUser= User;
    /** CodeMap 代码表对象类 */
    static CCodeMap = CodeMap;
    /** KeyToId 密钥id映射对象类 */
    static CKeyToId = KeyToId;
    /** Repository 数据储存对象类 */
    static CRepository = Repository;


    /** Page 分页对象 */
    static TPage: classes.Page;
    /** User/Sky 用户对象 */
    static TUser: User;
    /** 用户服务 */
    static TUserService = skyService;
    /** 用户服务 */
    static TSkyService = skyService;
    /** CodeMap 代码表对象 */
    static TCodeMap: CodeMap;
    /** CodeMap 代码表服务 */
    static TCodeMapService = CodeMapService;
    /** KeyToId 密钥id映射对象 */
    static TKeyToId: KeyToId;
    /** TKeyToId 密钥id映射服务 */
    static TKeyToIdService = KeyToIdService;
    /** Repository 数据储存对象 */
    static TRepository: Repository<User>;
    /** 查询请求参数词组对象 */
    static TWords: { 
        data: "每个字都是独立的" | { 
            words: "每个字都是独立的", 
            sentences: ["句子1", "句子2"] 
        }
    }
}
