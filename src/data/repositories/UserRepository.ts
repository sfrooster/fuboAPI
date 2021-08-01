import { Repository } from './Repository';
import { User } from '../entities/User';



class UserRepository extends Repository<User> {
    constructor() {
        super(User.entityName);
    }
}