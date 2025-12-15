export declare const processPaginated: <T>(dataLoader: (page: number) => Promise<T[]>, processor: (data: T[]) => Promise<boolean | void>) => Promise<void>;
export declare class BatchProcessor<T> {
    private readonly batchSize;
    private readonly timeoutSeconds;
    private readonly processor;
    private readonly errorHandler;
    private batch;
    private timer?;
    constructor(batchSize: number, timeoutSeconds: number, processor: (batch: T[]) => Promise<void>, errorHandler: (batch: T[], err: any) => Promise<void>);
    addToBatch(element: T): Promise<void>;
    private startTimer;
    private processBatch;
}
export declare const escapeNullByte: (str: string | null | undefined) => string;
