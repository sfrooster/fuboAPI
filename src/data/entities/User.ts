import { v4 as uuidV4, } from 'uuid';
import { Entity } from "./Entity";
import { isString, Settings } from '../../utilities';



export class User extends Entity {
    public fullName: string | null = null;

    public email: string | null =  null;

    constructor();
    constructor(entityId: string);
    constructor(entityId: string = uuidV4()) {
        super(entityId);
    }

    public static fromLiteral<L extends {[key: string]: any}>(literal: L, acceptEntityId: boolean = false): User | Error | number {
        if (!acceptEntityId && literal.entityId) {
            if (Settings.debug) {
                console.error(`fromLiteral: acceptEntityId = ${acceptEntityId} but literal.entityId = ${literal.entityId} - returning 400`);
            }
            return 400;
        }

        const user = new User(literal.entityId);

        if (isString(literal.fullName)) {
            user.fullName = literal.fullName;
        }
        else {
            return new Error(`${literal.fullName} is not a valid value for fullName`);
        }

        if (isString(literal.email)) {
            user.email = literal.email;
        }
        else {
            return new Error(`${literal.email} is not a valid value for email`);
        }

        return user;
    }
}