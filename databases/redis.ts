/* Redis - Database */
/* reference: https://github.com/redis/node-redis */
import { createClient } from 'redis';

class Redis {
    client: object|null
    url: string
    constructor(url: string) {
        this.url = url;
        this.client = this.#connectClient();
    }

    async #connectClient(): Promise<object | null>
    {
        // Tip - redis[s]://[[username][:password]@][host][:port][/db-number]
        return await createClient({url: this.url})
            .on('error', (err) => {
                console.log('Redis Client Error', err)
                return null;
            })
            .connect();
    }

    #isConnected(): boolean
    {
        //todo:jtatarakis add logging here for when we aren't connected
        if (this.client === null) {
            console.log('Database not connected!')
        }

        return this.client !== null;
    }

    async setKeyValuePair(key: string, value: string): Promise<boolean>
    {
        key = await this.sanitizeString(key);
        value = await this.sanitizeString(value);

        if (!this.#isConnected() || key.length === 0 || value.length === 0) {
            return false;
        }

        const client = this.client;

        // @ts-ignore ts freaks out if I call client here because it thinks it could be null.
        // However #isConnected() is checked.
        await client.set(key, value);

        return true;
    }

    async getKeyValuePair(key: string): Promise<string>
    {
        key = await this.sanitizeString(key);

        if (!this.#isConnected() || key.length === 0) {
            return '';
        }

        const client = this.client;

        // @ts-ignore ts freaks out if I call client here because it thinks it could be null.
        // However #isConnected() is checked.
        const result = await client.get(key, value);
        console.log(result);

        return result;
    }

    async setHashObject(key: string, object: object): Promise<boolean>
    {
        /* reference: https://redis.io/docs/get-started/data-store/ */
        key = await this.sanitizeString(key);
        object = await this.sanitizeObject(object);

        if (!this.#isConnected() || key.length === 0) {
            return false;
        }

        // @ts-ignore
        const fieldsAdded = await this.client.hSet(key, object)

        console.log(`\n ::: setHashKeyObject - fieldsAdded ::: \n ${fieldsAdded}`);
        // Number of fields were added: 4

        return fieldsAdded > 0;
    }

    async getHashObject(key: string): Promise<boolean>
    {
        /* reference: https://redis.io/docs/get-started/data-store/ */
        key = await this.sanitizeString(key);

        if (!this.#isConnected() || key.length === 0) {
            return false;
        }

        // @ts-ignore
        const result = await this.client.hGetAll(key);

        console.log(`\n ::: getHashKeyObject - fieldsAdded ::: \n`, result);

        return result;
    }

    async getHashObjectProperty(key: string, property: string): Promise<boolean>
    {
        /* reference: https://redis.io/docs/get-started/data-store/ */
        key = await this.sanitizeString(key);
        property = await this.sanitizeString(property);

        if (!this.#isConnected() || key.length === 0 || property.length === 0) {
            return false;
        }

        // @ts-ignore
        const result = await this.client.hGet(key, property);

        console.log(`\n ::: getHashKeyObject - fieldsAdded ::: \n`, result);

        return result;
    }

    async sanitizeString(string: string): Promise<string>
    {
        return string.replace(/[@!{}()|\-=>]/g, '');
    }

    async sanitizeObject(object: {[index: string]: any}): Promise<object>
    {
        const result :{[index :string] :any} = {};
        const keysFilteredOfFunctions :string[] = Object.keys(object)
            .filter((key: any): boolean => typeof object[key] !== 'function');
        keysFilteredOfFunctions.forEach((filteredKey: string) => {
            result[filteredKey] = object[filteredKey];
        })
        console.log(`\n ::: sanitizedObject - result ::: \n ${result}`)

        return result;
    }
}