export declare abstract class HttpStatusError extends Error {
    readonly status: number;
    constructor(message: string, status: number);
}
export declare class Error400BadRequest extends HttpStatusError {
    constructor(message: string);
}
export declare class Error401Unauthorized extends HttpStatusError {
    constructor(message: string);
}
export declare class Error404NotFound extends HttpStatusError {
    constructor(message: string);
}
export declare class Error500InternalServerError extends HttpStatusError {
    constructor(message: string);
}
