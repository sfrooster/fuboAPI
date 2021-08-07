import express from 'express';
import { User } from '../data/entities/User';
import { UserRepository } from '../data/repositories/UserRepository';
import { isError, isNumber, isUuidV4, Settings } from '../utilities';



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
                    console.debug(`attempting POST /users body: ${JSON.stringify(req.body)}`);
                }

                const user = User.fromLiteral(req.body);

                if (isError(user)) {
                    console.error(`POST could not hydrate User from body: ${user.message}`);
                    res.sendStatus(500);
                }
                else if (isNumber(user)) {
                    console.error(`POST bad reqquest: ${JSON.stringify(req.body)}`);
                    res.sendStatus(400);
                }
                else if (req.body.entityId) {
                    console.error(`POST /users/: 400 (bad reqquest), cannot specify entityId in the body`);
                    res.sendStatus(400);
                }
                else {
                    if (Settings.debug) {
                        console.debug(`POST /users using: ${JSON.stringify(user)}`);
                    }

                    const result = this.userRepository.create(user as User);

                    if (Settings.debug) {
                        console.debug(`POST /users result: ${JSON.stringify(result)}`);
                    }

                    if (isError(result)) {
                        console.error(`POST /users error: ${result.message}`);
                        res.sendStatus(500);
                    }
                    else {
                        if (Settings.debug) {
                            console.debug(`POST /users success result: ${JSON.stringify(result)}`);
                        }
                        res.status(200).json(result);
                    }
                }
            }
            catch (err) {
                const errMsg  = `POST /users error body = ${req.body}, message = ${(err as Error).message}`;
                console.error(errMsg);
                res.sendStatus(500);
            }
        });

        router.put('/users/:entityId', (req: express.Request, res: express.Response, next: {}) => {
            try {
                const entityId = req.params.entityId;

                if (Settings.debug) {
                    console.debug(`attempting PUT /users/${entityId}, body: ${JSON.stringify(req.body)}`);
                }

                if (!isUuidV4(entityId)) {
                    console.error(`PUT /users/${entityId}: 400 (bad reqquest)`);
                    res.sendStatus(400);
                }
                else if (req.body.entityId) {
                    console.error(`PUT /users/${entityId}: 400 (bad reqquest), cannot specify entityId in the body`);
                    res.sendStatus(400);
                }
                else {
                    const user = this.userRepository.findByEntityId(entityId);

                    if (!isError(user)) {
                        if (user === null) {
                            console.error(`PUT /users/${entityId}: 404 (not found)`);
                            res.sendStatus(404);
                        }
                        else {
                            if (Settings.debug) {
                                console.debug(`PUT /users/${entityId} is currently: ${JSON.stringify(user)}`);
                            }

                            // TODO: fix, this is a hack
                            const literalToUse = {
                                ...req.body
                            };
                            literalToUse.entityId = entityId;

                            console.debug(`WONT USE: ${JSON.stringify(req.body)}`);
                            console.debug(`WILL USE: ${JSON.stringify(literalToUse)}`);
                            const updatedUser = User.fromLiteral(literalToUse, true);

                            if (isError(updatedUser)) {
                                console.error(`PUT /users/${entityId} could not hydrate User from body: ${updatedUser.message}`);
                                res.sendStatus(500);
                            }
                            else if (isNumber(updatedUser)) {
                                console.error(`PUT /users/${entityId}: 400 (bad reqquest), body = ${JSON.stringify(req.body)}`);
                                res.sendStatus(400);
                            }
                            else {
                                const updateResult = this.userRepository.updateOne(entityId, updatedUser);

                                if (isError(updateResult)) {
                                    console.error(`PUT /users/${entityId}: 500 (internal error) - ${updateResult.message}`);
                                    res.sendStatus(500);
                                }
                                else if (updateResult === null) {
                                    console.error(`PUT /users/${entityId}: 404 (not found)`);
                                    res.sendStatus(404);
                                }
                                else {
                                    if (Settings.debug) {
                                        console.debug(`PUT /users/${entityId} should now be: ${JSON.stringify(updatedUser)}`);
                                    }

                                    res.sendStatus(200);
                                }
                            }
                        }
                    }
                }
            }
            catch (err) {
                const errMsg  = `PUT /users/${req.params.entityId}: 500 (internal error), body = ${req.body}, message = ${(err as Error).message}`;
                console.error(errMsg);
                res.sendStatus(500);
            }
        });

        router.get('/users/:entityId', (req: express.Request, res: express.Response, next: {}) => {
            try {
                const entityId = req.params.entityId;

                if (Settings.debug) {
                    console.debug(`attempting GET /users/${entityId}`);
                }

                if (!isUuidV4(entityId)) {
                    console.error(`GET bad reqquest: /users/${entityId}`);
                    res.sendStatus(400);
                }
                else {
                    const user = this.userRepository.findByEntityId(entityId);

                    if (!isError(user)) {
                        if (user === null) {
                            if (Settings.debug) {
                                console.debug(`GET /users/${entityId}: 404 (not found)`);
                            }

                            res.sendStatus(404);
                        }
                        else {
                            if (Settings.debug) {
                                console.debug(`GET /users/${entityId}: ${JSON.stringify(user)}`);
                            }

                            res.status(200).json(user);
                        }
                    }
                    else {
                        if (Settings.debug) {
                            console.debug(`GET /users/${entityId}: 500 (internal error) = ${JSON.stringify(user.message)}`);
                        }

                        res.sendStatus(500);
                    }
                }
            }
            catch (err) {
                const errMsg  = `GET /users/${req.params.entityId}, message = ${(err as Error).message}`;
                console.error(errMsg);
                res.sendStatus(500);
            }
        });

        this.express.use('/', router);
    }

}

export const App = new AppInternal();