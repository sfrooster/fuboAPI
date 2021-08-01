import { Config, JsonDB, DatabaseError, DataError } from '../node-json-db-adapter';
import { Entity } from '../entities/Entity';



type Predicate<T extends Entity> = (entity: T) => boolean;

interface RepositoryWriter<E extends Entity> {
    create: (entity: E) => string | Error;
    updateOne: (ntityId: string, mergeEntity: E) => true | null | Error;
}

interface RepositoryReader<E extends Entity> {
    find: (predicate: Predicate<E>) => E[] | Error;
    findOne: (entityId: string) => E | null | Error;
}


export abstract class Repository<E extends Entity> implements RepositoryWriter<E>, RepositoryReader<E> {

    private readonly db: JsonDB;
    protected readonly path: { base: string; list: string; forIndex: (index: number) => string; }
    
    protected constructor(entityName: string) {
        this.db = new JsonDB(new Config('./.storage/fubo-data.json', true, true, '/'));
        this.path = {
            base: `/${entityName.toLocaleLowerCase()}`,
            get list() {
                return `${this.base}/list`;
            },
            forIndex: function(index: number): string {
                return `${this.list}[${index}]`;
            }
        };
    }

    private handleError(error: any): Error {
        switch (Object.getPrototypeOf(error)?.constructor.name) {
            case DataError.name:
                const dataError = error as DataError;
                const dataErrorMsg = `${DataError.name}: id=${dataError.id}, name=${dataError.name}, message=${dataError.message}`;
                console.error(dataErrorMsg);
                return new Error(dataErrorMsg);

            case DatabaseError.name:
                const databaseError = error as DatabaseError;
                const databaseErrorMsg = `${DatabaseError.name}: id=${databaseError.id}, name=${databaseError.name}, message=${databaseError.message}`;
                console.error(databaseErrorMsg);
                return new Error(databaseErrorMsg);

            case Error.name:
                const err = error as Error;
                console.error(`${Error.name}: name=${err.name}, message=${err.message}`);
                return err;

            default:
                console.error(`Error: ${error}`);
                return new Error(error?.toString() ?? "unknown");
        }
    }

    public create(entity: E): string | Error {
        try {
            if (!this.db.exists(this.path.base)) {
                this.db.push(`${this.path.list}[0]`, entity, true);
            }
            else {
                this.db.push(`${this.path.list}[]`, entity, true);
            }

            return entity.entityId;
        }
        catch (e) {
            return this.handleError(e);
        }
    }

    public updateOne(entityId: string, mergeEntity: E): true | null | Error {
        try {
            const index = this.db.getIndex(this.path.list, entityId, "entityId");
            console.log(`DEBUG: ${index}`);
            if (index === -1) {
                return null;
            }
            this.db.push(this.path.forIndex(index), mergeEntity, false);
            return true;
        }
        catch (e) {
            return this.handleError(e);
        }
    }

    public find(predicate: Predicate<E>): E[] | Error {
        try {
            const matches = this.db.filter<E>(this.path.list, (entity: E, index: number | string) => predicate(entity));
            return matches ? matches : [];
        }
        catch (e) {
            return this.handleError(e);
        }
    }

    public findOne(entityId: string): E | null | Error {
        try {
            const match = this.db.find<E>(this.path.list, (entity: E, index: number | string) => entity.entityId === entityId);
            return match ? match : null;
        }
        catch (e) {
            return this.handleError(e);
        }
    }
}