"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWithLock = exports.releaseLock = exports.acquireLock = void 0;
const common_1 = require("@gitmesh/common");
const common_2 = require("@gitmesh/common");
const acquireLock = async (client, key, value, expireAfterSeconds, timeoutAfterSeconds) => {
    const now = new Date().getTime();
    let result = await client.set(key, value, {
        EX: expireAfterSeconds,
        NX: true,
    });
    while (!result) {
        const time = new Date().getTime();
        const diff = time - now;
        if (diff > timeoutAfterSeconds * 1000) {
            throw new common_1.TimeoutError(diff / 1000, 's');
        }
        // Randomize timeout between 100ms and 300ms
        const randomTimeout = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
        await (0, common_1.timeout)(randomTimeout);
        result = await client.set(key, value, {
            EX: expireAfterSeconds,
            NX: true,
        });
    }
};
exports.acquireLock = acquireLock;
const releaseLock = async (client, key, value) => {
    const script = `
    if redis.call("get",KEYS[1]) == ARGV[1] then
      return redis.call("del",KEYS[1])
    else
      return 0
    end
  `;
    await client.eval(script, {
        keys: [key],
        arguments: [value],
    });
};
exports.releaseLock = releaseLock;
const processWithLock = async (client, key, expireAfterSeconds, timeoutAfterSeconds, process) => {
    const value = (0, common_2.generateUUIDv4)();
    await (0, exports.acquireLock)(client, key, value, expireAfterSeconds, timeoutAfterSeconds);
    // TODO: we can add logic to extend the lock here if we want to
    let result;
    try {
        result = await process();
    }
    finally {
        await (0, exports.releaseLock)(client, key, value);
    }
    return result;
};
exports.processWithLock = processWithLock;
//# sourceMappingURL=mutex.js.map