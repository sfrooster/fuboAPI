import { Config, JsonDB, DatabaseError, DataError } from '../node-json-db-adapter';
import { Entity } from '../entities/Entity';
import { Settings } from '../../utilities';



type Predicate<T extends Entity> = (entity: T) => boolean;
type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

interface RepositoryWriter<E extends Entity> {
    create: (entity: E) => string | Error;
    updateOne: (entityId: string, mergeEntity: DeepPartial<E>) => true | null | Error;
}

interface RepositoryReader<E extends Entity> {
    findAll(predicate: Predicate<E>): E[] | Error;
    findFirst(predicate: Predicate<E>): E | null | Error ;
    findByEntityId(entityId: string): E | null | Error;
}


export abstract class Repository<E extends Entity> implements RepositoryWriter<E>, RepositoryReader<E> {

    private readonly db: JsonDB;
    protected readonly path: { base: string; list: string; forIndex: (index: number) => string; }
    
    protected constructor(entityName: string) {
        const dataStoreFile = `${Settings.projectRoot}/.storage/fubo-data.json`;
        console.log(`storing data at ${dataStoreFile}`);

        this.db = new JsonDB(new Config(dataStoreFile, true, true, '/'));
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

    public updateOne(entityId: string, mergeEntity: DeepPartial<E>): true | null | Error {
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

    public findAll(predicate: Predicate<E>): E[] | Error {
        try {
            return this.db.filter<E>(this.path.list, (entity: E, index: number | string) => predicate(entity)) ?? [];
        }
        catch (e) {
            return this.handleError(e);
        }
    }

    public findFirst(predicate: Predicate<E>): E | null | Error {
        try {
            return this.db.getObject<E[]>(this.path.list).find((entity) => predicate(entity)) ?? null;
        }
        catch (e) {
            return this.handleError(e);
        }
    }

    public findByEntityId(entityId: string): E | null | Error {
        try {
            const index = this.db.getIndex(this.path.list, entityId, "entityId");
            return index > -1 ? this.db.getObject<E>(this.path.forIndex(index)) : null;
        }
        catch (e) {
            return this.handleError(e);
        }
    }
}