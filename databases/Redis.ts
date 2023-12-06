/* Redis - Database */
/* reference: https://github.com/redis/node-redis */
import {createClient} from 'redis';

type RedisClient = ReturnType<typeof createClient>;

export default class Redis {
    private static instance: Redis | null = null;
    private readonly client: RedisClient;

    private constructor() {
        this.client = createClient();
        this.client.on('error', err => console.log('Redis Client Error', err));

        // const username: string | undefined = typeof process.env.REDIS_USERNAME === "string"
        //     ? process.env.REDIS_USERNAME
        //     : '';
        // const password: string | undefined = typeof process.env.REDIS_PASSWORD === "string"
        //     ? process.env.REDIS_PASSWORD
        //     : '';
        // const host: string | undefined = typeof process.env.REDIS_PORT === "string"
        //     ? process.env.REDIS_HOST
        //     : '';
        // const port: number = typeof process.env.REDIS_PORT === "string" && process.env.REDIS_PORT !== ''
        //     ? parseInt(process.env.REDIS_PORT)
        //     : 6379;

        // this.client = createClient({
        //     username: username,
        //     password: password,
        //     socket: {
        //         host: host,
        //         port: port
        //     }
        // }).on('error', err => console.log('Redis Client Error', err));
    }

    static getInstance(): Redis
    {
        if (!Redis.instance) {
            console.log('\n ::: calling new Redis() ::: \n')
            Redis.instance = new Redis();
        }
        return Redis.instance;
    }

    async connect(): Promise<boolean>
    {
        await this.client.connect();
        return true;
    }

    async disconnect(): Promise<boolean>
    {
        await this.client.quit();
        return true;
    }

    isConnected(): boolean
    {
        //todo:jtatarakis add logging here for when we aren't connected
        if (!this.client.isReady) {
            console.log('Database not connected!')
        }

        return this.client.isReady;
    }

    async setKeyValuePair(hash: string, key: string, value: string): Promise<boolean>
    {
        hash  = this.sanitizeString(hash);
        key   = this.sanitizeString(key);
        value = this.sanitizeString(value);

        if (!this.isConnected() || key.length === 0 || value.length === 0) {
            return false;
        }

        try {
            const client: { [index: string]: any } = this.client;
            await client.set(`${hash}:${key}`, value);

            return true;
        } catch (error) {
            console.error('\n ::: Error in getKeyValuePair::: \n', error);
            return false;
        }
    }

    async getKeyValuePair(hash:string, key: string): Promise<string | null>
    {
        /* reference: https://redis.io/docs/get-started/data-store/ */
        key = this.sanitizeString(key);

        if (!this.isConnected() || key === '') {
            return null;
        }

        try {
            return await this.client.get(`${hash}:${key}`);
        } catch (error) {
            console.error('\n ::: Error in getKeyValuePair::: \n', error);
            return null;
        }
    }

    async setHashObject(hash : string, key : string, object : object): Promise<boolean>
    {
        /* reference: https://redis.io/docs/get-started/data-store/ */
        hash = this.sanitizeString(hash)
        key = this.sanitizeString(key);
        console.log('before sanitization')
        console.log(object)
        object = this.sanitizeObject(object);

        if (!this.isConnected() || key.length === 0 || Object.keys(object).length === 0) {
            return false;
        }

        try {
            console.log('setHashObject ::: made it to the try block - start')
            const client: { [index: string]: any } = this.client;
            console.log('after sanitization')
            console.log(object)
            // const fieldsAdded: number = await client.hSet(key, object);
            const fieldsAdded: number = await client.hSet(`${hash}:${key}`, object)
            console.log('fields added ::: \n', fieldsAdded)
            return fieldsAdded > 0;
        } catch (error) {
            console.error('\n ::: Error in setHashObject::: \n', error);
            return false;
        }
    }

    async getHashObject(hash : string, key: string): Promise<object | null>
    {
        /* reference: https://redis.io/docs/get-started/data-store/ */
        hash = this.sanitizeString(hash);
        key = this.sanitizeString(key);

        if (!this.isConnected() || key.length === 0) {
            return null;
        }

        try {
            return await this.client.hGetAll(`${hash}:${key}`);
        } catch (error) {
            console.error('\n ::: Error in getHashObject::: \n', error);
            return null;
        }
    }

    async getHashObjectProperty(hash : string, key : string, property : string) : Promise<any>
    {
        /* reference: https://redis.io/docs/get-started/data-store/ */
        hash = this.sanitizeString(hash);
        key = this.sanitizeString(key);
        property = this.sanitizeString(property);

        if (!this.isConnected() || key.length === 0 || property.length === 0) {
            return null;
        }

        try {
            return await this.client.hGet(`${hash}:${key}`, property);
        } catch (error) {
            console.error('\n ::: Error in getHashObjectProperty::: \n', error);
            return null;
        }
    }

    // on error or item not found, return null
    // return properties otherwise
    async getHashObjectProperties(hash : string, key : string, properties : any[]) : Promise<any>
    {
        /* reference: https://redis.io/docs/data-types/hashes/ */
        const sanitizedProperties: any[] = [];
        hash = this.sanitizeString(hash);
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
            return await this.client.hmGet(`${hash}:${key}`, sanitizedProperties);
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
        //todo:jtatarakis *** add object handling **,
        // we need to json stringify value in order to be able to use it in redis
        const sanitizedResult :{[index :string] :any} = {};
        const keysFilteredOfFunctions :string[] = Object.keys(object)
            .filter((key: any): boolean => typeof object[key] !== 'function');
        keysFilteredOfFunctions.forEach((filteredKey: string) => {
            sanitizedResult[filteredKey] = object[filteredKey];
        })

        return sanitizedResult;
    }
    //todo:jtatarakis add post retrieval object handler, destringify object properties
}