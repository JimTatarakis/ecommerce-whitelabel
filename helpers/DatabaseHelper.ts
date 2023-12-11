import { serialize } from './SerializationHelper.ts';

export async function sanitizeStringForRedisHashing(string: string): Promise<string>
{
    // Remove all non-alphanumeric characters and spaces.
    const regex = /[\\"']/g;
    string = await Promise.resolve(string).then((str) => str.replace(regex, ''));

    return string;
}

export async function sanitizeArrayForRedisHashing(array: any[]): Promise<any[]>
{
    const sanitizedArray: any[] = [];

    // Loop through each element in the array
    await Promise.all(
        array.map(async (element) => {
            if (Array.isArray(element)) {
                // Recursively call the method for nested arrays
                sanitizedArray.push(await sanitizeArrayForRedisHashing(element));
            } else if (typeof element === 'object') {
                // Sanitize object and serialize
                const sanitizedObject = await sanitizeObjectForRedisHashing(element);
                sanitizedArray.push(await serialize(sanitizedObject));
            } else if (typeof element === 'string') {
                // Sanitize string
                sanitizedArray.push(await sanitizeStringForRedisHashing(element));
            } else if (typeof element !== 'function') {
                // Add non-object, non-string, non-function values directly
                sanitizedArray.push(element);
            }
        })
    );

    return sanitizedArray;
}

export async function sanitizeObjectForRedisHashing(object: {[index: string]: any}): Promise<object>
{
    const sanitizedResult: { [index: string]: any } = {};

    // Filter out functions from object keys
    const keysFilteredOfFunctions: string[] = Object.keys(object).filter(
        (key) => typeof object[key] !== 'function'
    );

    // Loop through each filtered key
    await Promise.all(
        keysFilteredOfFunctions.map(async (filteredKey) => {
            if (typeof object[filteredKey] === 'object') {
                // Recursively sanitize nested objects
                const sanitizedObject = await sanitizeObjectForRedisHashing(object[filteredKey]);

                sanitizedResult[filteredKey] = await serialize(object[filteredKey]);
            } else if (Array.isArray(object[filteredKey])) {
                // Sanitize array values
                sanitizedResult[filteredKey] = await sanitizeArrayForRedisHashing(object[filteredKey]);
            } else if (typeof object[filteredKey] === 'string') {
                // Sanitize string values
                sanitizedResult[filteredKey] = await sanitizeStringForRedisHashing(object[filteredKey]);
            } else {
                // Assign non-object and non-string values directly
                sanitizedResult[filteredKey] = object[filteredKey];
            }
        })
    );

    return sanitizedResult;
}