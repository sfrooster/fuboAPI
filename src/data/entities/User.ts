import { Expose } from 'class-transformer';
import { Entity } from "./Entity";



export class User extends Entity {
    @Expose()
    public fullName: string;

    @Expose()
    public email: string;

    constructor(fullName: string, email: string) {
        super();

        this.fullName = fullName;
        this.email = email;
    }
}