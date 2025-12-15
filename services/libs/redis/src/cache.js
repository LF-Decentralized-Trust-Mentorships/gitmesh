"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
const logging_1 = require("@gitmesh/logging");
class RedisCache extends logging_1.LoggerBase {
    constructor(name, client, parentLog) {
        super(parentLog, { cacheName: name });
        this.name = name;
        this.client = client;
        this.directory = `cache_${name}`;
        this.prefixRegex = new RegExp(`^${this.directory}:`);
        this.prefixer = (key) => `${this.directory}:${key}`;
    }
    getDirectory() {
        return this.directory;
    }
    async get(key) {
        const actualKey = this.prefixer(key);
        const value = await this.client.get(actualKey);
        return value;
    }
    async set(key, value, ttlSeconds) {
        const actualKey = this.prefixer(key);
        if (ttlSeconds !== undefined) {
            await this.client.setEx(actualKey, ttlSeconds, value);
        }
        else {
            await this.client.set(actualKey, value);
        }
    }
    async increment(key, incrementBy = 1, ttlSeconds) {
        const actualKey = this.prefixer(key);
        if (ttlSeconds !== undefined) {
            const [incrResult] = await this.client
                .multi()
                .incrBy(actualKey, incrementBy)
                .expire(actualKey, ttlSeconds)
                .exec();
            return incrResult;
        }
        const result = await this.client.incrBy(actualKey, incrementBy);
        return result;
    }
    async decrement(key, decrementBy = 1, ttlSeconds) {
        const actualKey = this.prefixer(key);
        if (ttlSeconds !== undefined) {
            const [decrResult] = await this.client
                .multi()
                .decrBy(actualKey, decrementBy)
                .expire(actualKey, ttlSeconds)
                .exec();
            return decrResult;
        }
        const result = await this.client.decrBy(actualKey, decrementBy);
        return result;
    }
    setIfNotExistsAlready(key, value) {
        const actualKey = this.prefixer(key);
        return this.client.setNX(actualKey, value);
    }
    async delete(key) {
        const actualKey = this.prefixer(key);
        return this.client.del(actualKey);
    }
    async hget(key, field) {
        const actualKey = this.prefixer(key);
        return this.client.hGet(actualKey, field);
    }
    async hset(key, field, value) {
        const actualKey = this.prefixer(key);
        return this.client.hSet(actualKey, field, value);
    }
    async hgetall(key) {
        const actualKey = this.prefixer(key);
        return this.client.hGetAll(actualKey);
    }
    async deleteByPattern(pattern) {
        const script = `
local delpattern = ARGV[1]
local limit = 5000
local count = 0
local valuelist = redis.call('keys', delpattern)
if valuelist then
  if #valuelist ~= 0 then
    for i=1,#valuelist,limit do
      local tempCount = redis.call('del', unpack(valuelist, i, math.min(i+limit-1, #valuelist)))
      count = count + tempCount
    end
  end
end
return count`;
        const result = await this.client.eval(script, {
            arguments: [pattern],
        });
        return result;
    }
    deleteByKeyPattern(keyPattern) {
        const actualPattern = this.prefixer(keyPattern);
        return this.deleteByPattern(actualPattern);
    }
    deleteAll() {
        return this.deleteByPattern(this.prefixer('*'));
    }
    async getKeys(pattern, removeCacheName = true) {
        const actualPattern = this.prefixer(pattern);
        const keys = await this.client.keys(actualPattern);
        if (removeCacheName) {
            return keys.map((k) => k.replace(this.prefixRegex, ''));
        }
        return keys;
    }
    getAllValues() {
        return this.getValueByKeyPattern('*');
    }
    async getValueByKeyPattern(keyPattern, removeCacheName = true) {
        const actualPattern = this.prefixer(keyPattern);
        const script = `
local keypattern = ARGV[1]
local limit = 5000

local valuelist = redis.call('keys', keypattern)
local results = {}

results['keys'] = {}
results['values'] = {}

local values = results['values']

if valuelist then
  if #valuelist ~= 0 then
    results['keys'] = valuelist
    for i=1,#valuelist,limit do
      local tmp = redis.call('mget', unpack(valuelist, i, math.min(i+limit-1, #valuelist)))
      for j=1, #tmp do
        values[#values+1] = tmp[j]
      end
    end
  end
end
return cjson.encode(results)`;
        const results = await this.client.eval(script, {
            arguments: [actualPattern],
        });
        const json = JSON.parse(results);
        const map = new Map();
        if (json.keys !== undefined && Array.isArray(json.keys)) {
            json.keys.forEach((key, index) => {
                if (removeCacheName) {
                    map.set(key.replace(this.prefixRegex, ''), json.values[index]);
                }
                else {
                    map.set(key, json.values[index]);
                }
            });
        }
        return map;
    }
}
exports.RedisCache = RedisCache;
//# sourceMappingURL=cache.js.map