import { runInThisContext } from "vm";
import { User } from "./data/entities/User";
import { UserRepository } from "./data/repositories/UserRepository";



const users = new UserRepository();

const u1 = users.create(new User("M Stafford", "ms@ms.com"));
console.log(`u1: ${u1}`);
const u2 = users.create(new User("J Goff", "jg@jg.com"));
console.log(`u2: ${u2}`);

const u1a = users.find(u => u.fullName === "michael");
console.log(`u1a: ${JSON.stringify(u1a, null, 2)}`);
const u2a = users.find(u => u.fullName === "J Goff");
console.log(`u2a: ${JSON.stringify(u2a, null, 2)}`);
const u3a = users.findOne(u1 as string);
console.log(`u3a: ${JSON.stringify(u3a, null, 2)}`);
