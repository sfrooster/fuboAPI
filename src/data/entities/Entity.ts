import { v4 as uuidV4 } from 'uuid';



export abstract class Entity {
    public static get entityName(): string {
        return this.name;
    }

    public readonly entityId: string;

    protected constructor() {
        this.entityId = uuidV4();
    }
}