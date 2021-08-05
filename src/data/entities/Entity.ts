import isEqual from 'lodash.isequal';
import omit from 'lodash.omit';
import { v4 as uuidV4 } from 'uuid';
import 'reflect-metadata';
// import { ClassConstructor, ClassTransformOptions, Expose, plainToClass } from 'class-transformer';
import { Expose } from 'class-transformer';
import { ClassType, transformAndValidate, TransformValidationOptions } from "class-transformer-validator";
import { Settings } from '../../utilities';



const defaultTransformValidationOptions: TransformValidationOptions = {
    validator: {
        forbidNonWhitelisted: true,
        forbidUnknownValues: true
    }
};

// const defaultClassTransformOptions: ClassTransformOptions = {
//     excludeExtraneousValues: true,
//     exposeDefaultValues: true
// };

export abstract class Entity {
    public static get entityName(): string {
        return this.name;
    }

    // public static jsonToEntityInstance<T extends Entity>(cls: ClassConstructor<T>, plain: any, options = defaultClassTransformOptions): T {
    //     return plainToClass(cls, plain, options);
    // }

    public static async validateAndTransformJson<T extends Entity>(classType: ClassType<T>, jsonString: string, options = defaultTransformValidationOptions) {
        return await transformAndValidate(classType, jsonString) as T;
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

    // private readonly _entityId: string;
    private _entityId: string;

    @Expose()
    public get entityId(): string {
        return this._entityId;
    }

    @Expose()
    public set setEntityId(entityId: string)
     {
        this._entityId = entityId;;
    }

    protected constructor() {
        this._entityId = uuidV4();
    }
}