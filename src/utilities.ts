import * as util from 'util';



export const getRandomIntInclusive = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const isError = util.types.isNativeError;

export const sleep = (millisToSleep: number) => new Promise(resolve => setTimeout(resolve, millisToSleep));

export class Settings {
    private static readonly _debug = ['1', 'true'].includes((process.env.FUBO_DEBUG ?? 'false').toLocaleLowerCase());
    public static get debug() {
        return Settings._debug;
    }
    
    private static readonly _projectRoot = __dirname;
    public static get projectRoot() {
        return Settings._projectRoot;
    }

    private constructor() {}
}