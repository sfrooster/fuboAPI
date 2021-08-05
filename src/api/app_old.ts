import { User } from '../data/entities/User';
import { UserRepository } from '../data/repositories/UserRepository';
import { isError } from '../utilities';



async function main() {
    const users = new UserRepository();
    await users.ready();

    const u0a = users.findAll(u => u.fullName === 'michael');
    if (!isError(u0a)) {
        console.log(`u0a: ${JSON.stringify(u0a, null, 2)}`);
    }

    const u1 = users.create(new User('M Stafford', 'ms@ms.com'));
    if (!isError(u1)) {
        console.log(`u1: ${u1}`);
    }

    const u2 = users.create(new User('J Goff', 'jg@jg.com'));
    if (!isError(u2)) {
        console.log(`u2: ${u2}`);
    }

    const u3 = users.create(new User('Mom', 'mom@aol.com'));
    if (!isError(u3)) {
        console.log(`u3: ${u3}`);
    }

    const u4 = users.create(new User('Dad', 'dad@aol.com'));
    if (!isError(u4)) {
        console.log(`u4: ${u4}`);
    }

    const u0b = users.findAll(u => u.fullName === 'michael');
    if (!isError(u0b)) {
        console.log(`u0b: ${JSON.stringify(u0b, null, 2)}`);
    }

    if (!isError(u1)) {
        const u1a = users.findByEntityId(u1);
        if (!isError(u1a)) {
            console.log(`u1a: ${JSON.stringify(u1a, null, 2)}`);
        }
    }
    else {
        console.log(`skipping u1a`);
    }

    const u2a = users.findFirst(u => u.fullName === 'J Goff');
    if (!isError(u2a)) {
        console.log(`u2a: ${JSON.stringify(u2a, null, 2)}`);
    }

    const u34a = users.findAll(u => u.email.toLocaleLowerCase().endsWith('@aol.com'));
    if (!isError(u34a)) {
        console.log(`u34a: ${JSON.stringify(u34a, null, 2)}`);

        const u34b = u34a.forEach((user) => {
            const newEmailAddress = `${user.email.split('@')[0]}@gmail.com`;

            console.log(`updating ${user.entityId} email from ${user.email} to ${newEmailAddress}...`);
            const updateResult = users.updateOne(user.entityId, { email: newEmailAddress });

            if (updateResult === null) {
                console.warn(`user with entityId = ${user.entityId}, cannot be found`);
            }
            else if (!isError(updateResult)) {
                console.log(`...${user.entityId} updated = ${updateResult}`);
                console.log(`......updateResult(${user.entityId}) by entityId: ${JSON.stringify(users.findByEntityId(user.entityId), null, 2)}`);
            }
        });
    }

    const u1v2 = users.create(new User('M Stafford', 'ms@ms.com'));
    if (!isError(u1v2)) {
        console.log(`u1v2: ${u1v2}`);
    }

    const u5 = users.create(new User('Nenem', 'nenem@mes.edu'));
    if (!isError(u5)) {
        console.log(`u5: ${u5}`);
    }

    if (!isError(u2)) {
        const looper = setInterval(() => {
            const userPre = users.findByEntityId(u2);
            if (!isError(userPre) && userPre !== null) {
                const [ userInbox, addressDomin ] = userPre.email.split('@');
                const newDomain = addressDomin === 'larams.com' ? 'lions.com' : 'larams.com';
                const updateResult = users.updateOne(u2, { email: `${userInbox}@${newDomain}`});

                if (!isError(updateResult) && updateResult !== null) {
                    const userPost = users.findByEntityId(u2);
                    if (!isError(userPost) && userPost !== null) {
                        console.log(`user ${userPre.entityId} email was ${userPre.email}, email is ${userPost.email}`);
                    }
                }
            }
        }, 3000);

        process.on('SIGINT', function() {
            clearInterval(looper);
            console.log(`caught SIGINT - shutting down gracefully`);
            process.exit(0);
        });
    }
}

main();