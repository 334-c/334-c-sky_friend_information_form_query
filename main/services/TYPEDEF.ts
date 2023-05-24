import classes from "../utils/classes";
import User from "../src/entity/User";
import skyService from "./sky";
import CodeMap from "../src/entity/CodeMap";
import CodeMapService from "./CodeMap";
import KeyToId from "../src/entity/KeyToId";
import KeyToIdService from "./keyToId";
import { Repository } from "typeorm/repository/Repository";
export class T {
    static TPage = typeof classes.Page;
    static TUser = typeof User;
    static TUserService = typeof skyService;
    static TSkyService = typeof skyService;
    static TCodeMap = typeof CodeMap;
    static TCodeMapService = typeof CodeMapService;
    static TKeyToId = typeof KeyToId;
    static TKeyToIdService = typeof KeyToIdService;
    static TRepository = typeof Repository;
}
export type TPage = typeof classes.Page;
export type TUser = typeof User;
export type TUserService = typeof skyService;
export type TSkyService = typeof skyService;
export type TCodeMap = typeof CodeMap;
export type TCodeMapService = typeof CodeMapService;
export type TKeyToId = typeof KeyToId;
export type TKeyToIdService = typeof KeyToIdService;
export type TRepository = typeof Repository;


export type TWords = {data: "每个字都是独立的" | { words: "每个字都是独立的", sentences: ["句子1", "句子2"] }};
