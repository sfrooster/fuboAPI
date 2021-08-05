import * as util from 'util';



export const getRandomIntInclusive = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const isError = util.types.isNativeError;

export const isNumber = (value: any): value is number => typeof value === 'number';

export const parseIntPlus = (value: any, roundingAction = RoundingAction.Down): number =>
    isNumber(value) ?
        Math.round(value) === value ?
            value
            :
            roundingAction === RoundingAction.Down ? Math.floor(value) : Math.ceil(value)
        :
        (/^[-+]?(\d+|Infinity)$/.test(value)) ?
            parseIntPlus(Number(value), roundingAction)
            :
            NaN;

export enum RoundingAction {
    Down,
    None,
    Up
}

export const sleep = (millisToSleep: number) => new Promise(resolve => setTimeout(resolve, millisToSleep));

export class Settings {
    private static readonly _apiListenPort = parseIntPlus(process.env.FUBO_API_PORT);
    public static get apiListenPort() {
        return Settings._apiListenPort;
    }

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