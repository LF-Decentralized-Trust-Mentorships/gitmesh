import { JsonColumnInfo } from '@gitmesh/types';
export declare class RawQueryParser {
    static parseFilters(filters: any, columnMap: Map<string, string>, jsonColumnInfos: JsonColumnInfo[], params: any): string;
    private static parseJsonColumnCondition;
    private static parseColumnCondition;
    private static getJsonColumnInfo;
    private static getOperator;
    private static isJsonPropertyText;
    private static getParamName;
    private static getJsonParamName;
    private static isOperator;
}
