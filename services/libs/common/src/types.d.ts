export interface PageData<T> {
    rows: T[];
    count: number;
    limit: number;
    offset: number;
}
export declare class TimeoutError extends Error {
    readonly timeout: number;
    readonly unit: string;
    constructor(timeout: number, unit: string);
}
