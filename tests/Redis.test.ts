// redis.test.ts
import Redis from '../databases/Redis.ts'; // Update the path accordingly
import { expect, describe, beforeEach, afterEach, it } from "bun:test";

describe('Redis Class', (): void => {
    let redisInstance: Redis;

    beforeEach(async (): Promise<void> => {
        redisInstance = Redis.getInstance();
        await redisInstance.connect();
    });

    afterEach(async (): Promise<void> => {
        // Assuming you want to disconnect after each test
        if (redisInstance.isConnected()) {
           await redisInstance.disconnect();
        }
    });

    // it('should create a singleton instance of Redis', () => {
    //     const anotherInstance : Redis = Redis.getInstance();
    //     expect(redisInstance).toBe(anotherInstance);
    // });

    it('should connect to the Redis database', () => {
        expect(redisInstance.isConnected()).toBe(true);
    });

    it('should set and get key-value pair', async () => {
        const hash: string = 'user_theme_settings';
        const key: string = 'testKey';
        const value: string = 'testValue';

        const setResult: boolean = await redisInstance.setKeyValuePair(hash, key, value);
        expect(setResult).toBe(true);

        const getResult: string | null = await redisInstance.getKeyValuePair(hash, key);
        expect(getResult).toBe(value);
    });

    it('should set and get hash object', async () => {
        const hash: string = 'user_theme_settings';
        const key: string = 'testSetGetHashObject';
        const object: object = { field1: 'value1', field2: 'value2', field3: 123 };

        const setResult: boolean = await redisInstance.setHashObject(hash, key, object);
        expect(setResult).toBe(true);

        const getResult: object | null = await redisInstance.getHashObject(hash, key);
        expect(getResult).toEqual(object);
    });

    it('should get hash object property', async () => {
        const hash: string = 'user_theme_settings';
        const key: string = 'testHashKey';
        const property: string = 'field1';
        const expectedValue: string = 'value1';

        const getResult = await redisInstance.getHashObjectProperty(hash, key, property);
        expect(getResult).toBe(expectedValue);
    });

    it('should get hash object properties', async () => {
        const hash: string = 'user_theme_settings';
        const key: string = 'testHashKey';
        const properties: string[] = ['field1', 'field2'];
        const expectedValues: string[] = ['value1', 'value2'];

        const getResult = await redisInstance.getHashObjectProperties(hash, key, properties);
        expect(getResult).toEqual(expectedValues);
    });
});
