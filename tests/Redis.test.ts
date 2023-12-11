import Redis from '../databases/Redis.ts';
import { expect, describe, beforeEach, afterEach, it } from "bun:test";

describe('Redis', () => {
    let redis: Redis;

    beforeEach(async () => {
        redis = Redis.getInstance();
        await redis.connect();
    });

    afterEach(async () => {
        await redis.disconnect();
    });

    it('should set and get a key-value pair', async () => {
        const key = 'test-key';
        const value = 'test-value';
        await redis.setKeyValuePair('test-set-key-method', key, value);
        const retrievedValue = await redis.getKeyValuePair('test-set-key-method', key);
        expect(retrievedValue).toEqual(value);
    });

    it('should set and get a hash object', async () => {
        const key = 'test-key';
        const object = { name: 'John Doe', age: '30' };
        await redis.setHashObject('test-set-get-methods', key, object);
        const retrievedObject = await redis.getHashObject('test-set-get-methods', key);
        expect(retrievedObject).toEqual(object);
    });

    it('should get a specific property from a hash object', async () => {
        const key = 'test-key';
        const property = 'name';
        const expectedValue = 'Jim Test';
        await redis.setHashObject('test-get-property-method', key, { name: 'Jim Test', age: '32' });
        const retrievedValue = await redis.getHashObjectProperty('test-get-property-method', key, property);
        expect(retrievedValue).toEqual(expectedValue);
    });

    it('should get multiple properties from a hash object', async () => {
        const key = 'test-key';
        const properties = ['name', 'age'];
        const expectedValues = ['John Doe', '30'];
        await redis.setHashObject('test-get-properties-method', key, { name: 'John Doe', age: '30' });
        const retrievedValues = await redis.getHashObjectProperties('test-get-properties-method', key, properties);
        expect(retrievedValues).toEqual(expectedValues);
    });

    it('should delete a key successfully', async () => {
        const key = 'test-key';
        await redis.setKeyValuePair('test-hash', key, 'test-value');
        await redis.deleteKey('test-delete-method', key);
        const retrievedValue = await redis.getKeyValuePair('test-delete-method', key);
        expect(retrievedValue).toBeNull();
    });
});