import express from 'express';
// import { transformAndValidate } from "class-transformer-validator";
import { Entity } from '../data/entities/Entity';
import { User } from '../data/entities/User';
import { UserRepository } from '../data/repositories/UserRepository';
import { isError, Settings } from '../utilities';



class AppInternal {
    public readonly express: express.Application;
    private readonly userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.express = express();
        this.middleware();
        this.routes();
    }

    public async ready() {
        return await this.userRepository.ready();
    }

    private middleware(): void {
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: false }));
    }

    private routes(): void {
        const router = express.Router();

        router.post('/users', async (req: express.Request, res: express.Response, next: {}) => {
            try {
                if (Settings.debug) {
                    console.debug(`route POST /users body: ${JSON.stringify(req.body)}`);
                }

                //const user = Entity.jsonToEntityInstance(User, req.body);
                const user = await Entity.validateAndTransformJson(User, req.body);

                if (Settings.debug) {
                    console.debug(`route POST /users converted: ${JSON.stringify(user)}`);
                }

                const result = this.userRepository.create(user);

                if (Settings.debug) {
                    console.debug(`route POST /users result: ${JSON.stringify(result)}`);
                }

                if (isError(result)) {
                    res.sendStatus(500);
                }
                else {
                    res.status(200).json(result);
                }
            }
            catch (err) {
                const errMsg  = `Error: route = POST /users, body = ${req.body}`;
                console.error(errMsg);
                res.sendStatus(500);
            }
        });

        // router.put('/users/:entityId', (req: express.Request, res: express.Response, next: {}) => {
        //     const entityId = req.params.entityId;

        //     if (Settings.debug) {
        //         console.debug(`route PUT /users/${entityId} => ${req.body}`);
        //     }

        //     const user = Entity.jsonToEntityInstance(User, req.body);

        //     if (Settings.debug) {
        //         console.debug(`route PUT /users converted: ${JSON.stringify(user)}`);
        //     }

        //     // const result = this.userRepository.findByEntityId(entityId);
        //     const findResult = this.userRepository.findIndexByEntityId(entityId);

        //     if (Settings.debug) {
        //         console.debug(`route PUT /users result: ${JSON.stringify(findResult)}`);
        //     }

        //     if (isError(findResult)) {
        //         res.sendStatus(500);
        //     }
        //     else if (findResult === null) {
        //         res.sendStatus(404);
        //     }
        //     else {
        //         const updateResult = this.userRepository.updateOne(findResult, user);

        //         if (isError(updateResult)) {
        //             res.sendStatus(500);
        //         }
        //         else if (updateResult === null) {
        //             res.sendStatus(404);
        //         }
        //         else {
        //             res.sendStatus(204);
        //         }
        //     }
        // });

        // router.patch('/users/:entityId', (req: express.Request, res: express.Response, next: {}) => {
        //     const entityId = req.params.entityId;

        //     if (Settings.debug) {
        //         console.debug(`route PATCH /users/${entityId} => ${req.body}`);
        //     }

        //     // const user = Entity.jsonToEntityInstance(User, req.body);

        //     // if (Settings.debug) {
        //     //     console.debug(`route PATCH /users converted: ${JSON.stringify(user)}`);
        //     // }

        //     // const result = this.userRepository.findByEntityId(entityId);
        //     const findResult = this.userRepository.findIndexByEntityId(entityId);

        //     if (Settings.debug) {
        //         console.debug(`route PATCH /users result: ${JSON.stringify(findResult)}`);
        //     }

        //     if (isError(findResult)) {
        //         res.sendStatus(500);
        //     }
        //     else if (findResult === null) {
        //         res.sendStatus(404);
        //     }
        //     else {

        //         const updaateResult = this.userRepository.updateOne(findResult, user);

        //         if (isError(updaateResult)) {
        //             res.sendStatus(500);
        //         }
        //         else if (updaateResult === null) {
        //             res.sendStatus(404);
        //         }
        //         else {
        //             res.sendStatus(204);
        //         }
        //     }
        // });

        // router.get('/users/:entityId', (req: express.Request, res: express.Response, next: {}) => {
        //     const entityId = req.params.entityId;

        //     if (Settings.debug) {
        //         console.debug(`route GET /users/${entityId}`);
        //     }

        //     const user = this.userRepository.findByEntityId(entityId);
        //     if (!isError(user)) {
        //         if (user === null) {
        //             if (Settings.debug) {
        //                 console.debug(`route get /users/${entityId}: 404(not found)`);
        //             }

        //             res.sendStatus(404);
        //         }
        //         else {
        //             if (Settings.debug) {
        //                 console.debug(`route get /users/${entityId}: ${JSON.stringify(user)}`);
        //             }

        //             res.status(200).json(user);
        //         }
        //     }
        //     else {
        //         if (Settings.debug) {
        //             console.debug(`route get /users/${entityId}: 500(internal error) = ${JSON.stringify(user)}`);
        //         }

        //         res.status(500).json(user);
        //     }
        // });

        this.express.use('/', router);
    }

}

// const _appInternal = new AppInternal();
// export const App = new AppInternal() _appInternal.express;
// export const storeIsReady = _appInternal.ready;

// export const App = {
//     _internal: new AppInternal(),
//     get expressApp() {
//         return this._internal.express;
//     },
//     get storeIsReady() {
//         return this._internal.ready;
//     }
// };

export const App = new AppInternal();