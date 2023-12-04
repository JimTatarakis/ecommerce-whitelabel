/* Redis - Database */
/* reference: https://github.com/redis/node-redis */
import {createClient} from 'redis';

type RedisClient = ReturnType<typeof createClient>;

export default class Redis {
    private static instance: Redis | null = null;
    private readonly client: RedisClient;
    private readonly url: string;

    private constructor(url: string) {
        this.url = url;
        this.client = createClient({ url: this.url });
        this.client.on('error', (err: any) => {
            console.log('Redis Client Error', err);
        });
    }

    static getInstance(url: string): Redis
    {
        if (!Redis.instance) {
            Redis.instance = new Redis(url);
        }

        return Redis.instance;
    }

    isConnected(): boolean
    {
        //todo:jtatarakis add logging here for when we aren't connected
        if (!this.client.isReady) {
            console.log('Database not connected!')
        }

        return this.client.isReady;
    }

    async setKeyValuePair(key: string, value: string): Promise<boolean>
    {
        key = this.sanitizeString(key);
        value = this.sanitizeString(value);

        if (!this.isConnected() || key.length === 0 || value.length === 0) {
            return false;
        }

        try {
            const client: { [index: string]: any } = this.client;
            await client.set(key, value);

            return true;
        } catch (error) {
            console.error('\n ::: Error in getKeyValuePair::: \n', error);
            return false;
        }
    }

    async getKeyValuePair(key: string): Promise<string | null>
    {
        /* reference: https://redis.io/docs/get-started/data-store/ */
        key = this.sanitizeString(key);

        if (!this.isConnected() || key === '') {
            return null;
        }

        try {
            return await this.client.get(key);
        } catch (error) {
            console.error('\n ::: Error in getKeyValuePair::: \n', error);
            return null;
        }
    }

    async setHashObject(key: string, object: object): Promise<boolean>
    {
        /* reference: https://redis.io/docs/get-started/data-store/ */
        key = this.sanitizeString(key);
        object = this.sanitizeObject(object);

        if (!this.isConnected() || key.length === 0 || Object.keys(object).length === 0) {
            return false;
        }

        try {
            const client: { [index: string]: any } = this.client;
            const fieldsAdded: number = await client.hSet(key, object);

            return fieldsAdded > 0;
        } catch (error) {
            console.error('\n ::: Error in setHashObject::: \n', error);
            return false;
        }
    }

    async getHashObject(key: string): Promise<object | null>
    {
        /* reference: https://redis.io/docs/get-started/data-store/ */
        key = this.sanitizeString(key);

        if (!this.isConnected() || key.length === 0) {
            return null;
        }

        try {
            return await this.client.hGetAll(key);
        } catch (error) {
            console.error('\n ::: Error in getHashObject::: \n', error);
            return null;
        }
    }

    async getHashObjectProperty(key: string, property: string): Promise<any>
    {
        /* reference: https://redis.io/docs/get-started/data-store/ */
        key = this.sanitizeString(key);
        property = this.sanitizeString(property);

        if (!this.isConnected() || key.length === 0 || property.length === 0) {
            return null;
        }

        try {
            return await this.client.hGet(key, property);
        } catch (error) {
            console.error('\n ::: Error in getHashObjectProperty::: \n', error);
            return null;
        }
    }

    // on error or item not found, return null
    // return properties otherwise
    async getHashObjectProperties(key: string, properties: any[]): Promise<any>
    {
        /* reference: https://redis.io/docs/data-types/hashes/ */
        const sanitizedProperties: any[] = [];
        key = this.sanitizeString(key);

        properties.forEach((propertyName: string) => {
            const sanitizedProperty: string = this.sanitizeString(propertyName);
            if (sanitizedProperty !== '') {
                sanitizedProperties.push(sanitizedProperty);
            }
        });

        if (!this.isConnected() || key === '' || sanitizedProperties.length === 0) {
            return null;
        }

        try {
            return await this.client.hmGet(key, sanitizedProperties);
        } catch (error) {
            console.error('\n ::: Error in getHashObjectProperties ::: \n', error);
            return null;
        }
    }

    sanitizeString(string: string): string
    {
        return string.replace(/[\\"']/g, '');
    }

    sanitizeObject(object: {[index: string]: any}): object
    {
        const sanitizedResult :{[index :string] :any} = {};
        const keysFilteredOfFunctions :string[] = Object.keys(object)
            .filter((key: any): boolean => typeof object[key] !== 'function');
        keysFilteredOfFunctions.forEach((filteredKey: string) => {
            sanitizedResult[filteredKey] = object[filteredKey];
        })

        return sanitizedResult;
    }
}