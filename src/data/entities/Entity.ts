import isEqual from 'lodash.isequal';
import omit from 'lodash.omit';
import { v4 as uuidV4 } from 'uuid';
import { Settings } from '../../utilities';



export abstract class Entity {
    public static get entityName(): string {
        return this.name;
    }

    public static areEqual(entity1: Entity, entity2: Entity): boolean {
        const disregard = ['entityId'];

        if (Settings.debug) {
            const e1 = omit(entity1, disregard);
            const e2 = omit(entity2, disregard);
            console.debug(`comparing ${JSON.stringify(e1)} to ${JSON.stringify(e2)}`);
            const match = isEqual(e1, e2);
            if (match) {
                console.debug(`MATCHED: ${entity1.entityId} to ${entity2.entityId}`);
            }
            return match;
        }
        else {
            return isEqual(omit(entity1, disregard), omit(entity2, disregard));
        }
    }

    public readonly entityId: string;

    protected constructor() {
        this.entityId = uuidV4();
    }
}