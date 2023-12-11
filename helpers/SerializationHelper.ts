export async function serialize(data: any): Promise<string>
{
    return JSON.stringify(data);
}

export async function deserialize(data: string): Promise<any>
{
    return JSON.parse(data);
}