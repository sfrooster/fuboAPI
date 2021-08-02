
export const isError = (candidate: any): candidate is Error => candidate instanceof Error;

export class Settings {
    private static readonly _projectRoot = __dirname;
    public static get projectRoot() {
        console.log(`returing ${Settings._projectRoot} for projectRoot`);
        return Settings._projectRoot;
    }

    private constructor() {}
}