import Redis from '../databases/Redis.ts';
import { User } from './UserInterface.ts';
import { v4 as uuidv4 } from 'uuid';
import {CryptoHasher} from "bun";

export class UserModel {
    private readonly db: Redis;

    constructor(db: Redis) {
        this.db = db;
    }

    async createUser(username: string, password: string, email: string): Promise<boolean> {
        //store password in separate hash, then store user, return userObj w/out password.
        const hashedPassword = await Bun.password.hash(password);
        const hasher = new Bun.CryptoHasher("sha256");
        hasher.update(username);
        const key = hasher.digest("base64");
        const user : User = {
            id: uuidv4(),
            username,
            email
        }

        const passwordStored = await this.db.setKeyValuePair(  'user_passwords', key, hashedPassword);

        if (!passwordStored) {
            return false;
        }

        const userStored = await this.db.setHashObject(  'users', key, user);

        if (!userStored) {
            // if we failed to store user. we need to remove stored password.
            await this.db.deleteKey(  'user_passwords', key);

            return false;
        }

        return true;
    }

    async updateUser(user: User): Promise<boolean> {
        const hasher = new Bun.CryptoHasher("sha256");
        hasher.update(user.username);
        const key = hasher.digest("base64");
        return await this.db.setHashObject(  'users', user.id, user);
    }

    async deleteUser(id: string): Promise<boolean> {
        await this.db.deleteKey(  'user_passwords', id);
        return await this.db.deleteKey(  'users', id);
    }

    async getUserByUsername(username: string): Promise<object | null> {
        const hasher = new Bun.CryptoHasher("sha256");
        hasher.update(username);
        const key = hasher.digest("base64");
        const serializedUser = await this.db.getHashObject(  'users', username);

        if (!serializedUser) {
            return null;
        }

        return serializedUser;
    }
}