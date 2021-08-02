import { Entity } from "./Entity";



export class User extends Entity {
    constructor(public fullName: string, public email: string) {
        super();
    }
}