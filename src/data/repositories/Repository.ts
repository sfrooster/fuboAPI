import { Config, JsonDB, DatabaseError, DataError } from '../node-json-db-adapter';
import { Entity } from '../entities/Entity';
import { getRandomIntInclusive, isError, isNumber, Settings, sleep } from '../../utilities';



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
    private readonly dataStoreFile: string;
    protected readonly paths: { base: string; list: string; forIndex: (index: number) => string; }
    private readyPreviouslyCalled = false;
    
    protected constructor(entityName: string) {
        this.dataStoreFile = `${Settings.projectRoot}/.storage/fubo-data.json`;

        if (Settings.debug) console.debug(`storing data at ${this.dataStoreFile}`);

        this.paths = {
            base: `/${entityName.toLocaleLowerCase()}`,
            get list() {
                return `${this.base}/list`;
            },
            forIndex: function(index: number): string {
                return `${this.list}[${index}]`;
            }
        };

        this.db = new JsonDB(new Config(this.dataStoreFile, true, true, '/'));
    }

    public async ready() {
        if (this.readyPreviouslyCalled) {
            return Promise.resolve();
        }
        this.readyPreviouslyCalled = true;

        const millisToSleep = getRandomIntInclusive(1000, 5000);
        if (Settings.debug) console.debug(`sleeping ${millisToSleep} milliseconds before declaring 'ready'...`);
        await sleep(millisToSleep);

        if (Settings.debug && this.db.exists(this.paths.list)) {
            console.debug(`path ${this.paths.list} exists - doing nothing...`);
        }
        else {
            if (Settings.debug) console.debug(`path ${this.paths.list} does NOT seem to exist - initializing...`);
            this.db.push(this.paths.list, [], false);
        }
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
                return new Error(error?.toString() ?? 'unknown');
        }
    }

    public create(entity: E): string | Error {
        if (Settings.debug) console.debug(`attempting to create ${entity.entityId}, count is: ${this.db.count(this.paths.list)}`);
        try {
            if (!this.db.exists(this.paths.base)) {
                if (Settings.debug) console.debug(`list appears non-existent, pushing ${entity.entityId} to index 0`);
                this.db.push(`${this.paths.list}[0]`, entity, true);
            }
            else {
                if (Settings.debug) console.debug(`list appears to EXIST, conducting duplicate check for ${entity.entityId}`);
                const existing = this.findFirst((candidate: E) => Entity.areEqual(candidate, entity));
                if (!isError(existing)) {
                    if (existing !== null) {
                        if (Settings.debug) console.debug(`${Entity.entityName}(${entity.entityId}) already exists - not adding`);
                        return existing.entityId;
                    }
                    else {
                        if (Settings.debug) console.debug(`${Entity.entityName}(${entity.entityId}) seems new - ADDING`);
                        this.db.push(`${this.paths.list}[]`, entity, true);
                    }
                }
                else {
                    return existing;
                }
            }

            return entity.entityId;
        }
        catch (e) {
            return this.handleError(e);
        }
    }

    public updateOne(index: number, mergeEntity: DeepPartial<E>): true | null | Error;
    public updateOne(entityId: string, mergeEntity: DeepPartial<E>): true | null | Error;
    public updateOne(entityIdOrIndex: string | number, mergeEntity: DeepPartial<E>): true | null | Error {
        try {
            let index: number;

            if (!isNumber(entityIdOrIndex)) {
                index = this.db.getIndex(this.paths.list, entityIdOrIndex, 'entityId');
            }
            else {
                index = entityIdOrIndex;
            }

            if (index === -1) {
                return null;
            }

            this.db.push(this.paths.forIndex(index), mergeEntity, false);
            return true;
        }
        catch (e) {
            return this.handleError(e);
        }
    }

    public findAll(predicate: Predicate<E>): E[] | Error {
        try {
            return this.db.filter<E>(this.paths.list, (entity: E, index: number | string) => predicate(entity)) ?? [];
        }
        catch (e) {
            return this.handleError(e);
        }
    }

    public findFirst(predicate: Predicate<E>): E | null | Error {
        try {
            return this.db.getObject<E[]>(this.paths.list).find((entity) => predicate(entity)) ?? null;
        }
        catch (e) {
            console.error(`findFirst error: ${(e as Error).stack}`);
            return this.handleError(e);
        }
    }

    public findByEntityId(entityId: string): E | null | Error {
        try {
            const index = this.db.getIndex(this.paths.list, entityId, 'entityId');
            return index > -1 ? this.db.getObject<E>(this.paths.forIndex(index)) : null;
        }
        catch (e) {
            return this.handleError(e);
        }
    }

    public findIndexByEntityId(entityId: string): number | null | Error {
        try {
            const index = this.db.getIndex(this.paths.list, entityId, 'entityId');
            return index > -1 ? index : null;
        }
        catch (e) {
            return this.handleError(e);
        }
    }

    public findByIndex(index: number): E | null | Error {
        try {
            return index > -1 ? this.db.getObject<E>(this.paths.forIndex(index)) : null;
        }
        catch (e) {
            return this.handleError(e);
        }
    }
}