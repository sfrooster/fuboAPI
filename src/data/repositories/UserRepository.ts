import { Repository } from './Repository';
import { User } from '../entities/User';



export class UserRepository extends Repository<User> {
    constructor() {
        super(User.entityName);
    }
}