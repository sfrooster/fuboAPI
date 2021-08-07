# fubo-api
### Assumptions
I ended-up not filling this section in as most of the relevant information is beloew  
<br/>

### Design Decisions
- Sorry, I didn't use Go. I thought about it, then realized I had a better chance of showing the things I wanted to if I didn't also take on the task of shaking the rust (bad choice of words) off my Go. I also considered doing i minimal version of the bigger Node project in Go, but... time
- In the interest of time, I'm doing some things (like relying on `Function.name` to get the runtime entity name) that wouldn't do in the "real world". I'lll try to address each time I do that and what the "real world" alternative is. For example, `Function.name` wouldn't survive a minimization/obfuscation. For the "real world", one option for implementing that same feature would be code-generation via an AST processor (which I have done before) where we'd take the source files, load them into an AST and then programatically generate a static readonly string member on the class. This would run as a pre-transpilation task
- I've decided that the approch most consistent with the assignment involves persisting data. I found a possibly-immature npm package which implements a sort of document store, and then I've wrapped it in the Repository pattern
- **Special Note Here**: I also went a little overboard and built the project with horizontal scaling (including some interesting monitoring and logging features - not built by me, but there nonetheless), and the default configuration runs two instances of the service in a clustered mode, with auto-restart etc (you can set the configuration to run up to as many cores as your machine has but I've gone with 2 for demo purposes and also for what you're about to read next). For simplicity, I chose persistence provided by a single npm package vs requiring someone to install and configure say, mongo. In exchange for making that piece easy I got a data store that is essentially a simple document store but which, more importantly, wasn't built with the idea of being a shared resource in mind. Not their fault, and I decided to take on the challenge anyway. So, I've built some oddities in which seem to addess sharing this single store among multiple clients (for example, a randomized delay at data store instantiation so that - hopefully - one client is up first and initializes things rather than the two stepping on each other). And in my testing is seems to have done the trick (but I'm keeping the instances low so as to not press my luck). The things to keep in mind are: I wanted to not only speak to these considerations but actually demonstrate them, but do so in a way that would not require external infrastructure, which required taking some unusual but time-aware steps towards addressing inherit challenges with all this. Finally, if in the course of playing with it, it turns-out my efforts to make the data store shareable fail, then there are several options: wipe it and run again, drop the clustering instance count down to 1, run it without clustering - these are the first few that come to mind. I'll provide specifics below
- I'm not creating different run configuration for dev vs production - only "production"
- I have not pulled-in a logging package (like Winston) because I don't want to burn time setting it up. In "the real world", I would. As a consequene there are places where I've left debug logging code that are... clunky, vs the normal situation of setting a log-level and making appropriate logger calls. Again, I'm aware, but in the interest of time I'm leaving the clunk and just acknowledging it
- The more I look at my ad-hoc debug logging the more I think I wish I'd just spent the time to pull in a package
- `Repository` is a bit bloated, maybe, and I know it should probably have an associated `interface` etc.
- constants for more things like HTTP status codes would be better
<br/>

### Miscellany
- I wouldn't (probably) normally include the .npmrc, but I am here because there's nothing sensitive in it and it has settings to address "mismatched" node binaries versions and enforcing that a node version is being used which supports the targeted TypeScript feature set
- I don't agree with how the author of node-json-db has organized their package (JsonDB and JsonDBConfig, along with probably several other items) should probably been "barrelled" together, but... nevermind - I created my own barrell in node-json-db-adapter
- There are artifacts - like interfaces (and separate at that) for RepositoryWriter and RepositoryReader which aren't really serving a purpose, but I've put them in because they help to more closely resemble a more real world approach (and in doing so counter-balance some short-cuts I've taken)
- I explored supporting meta-data at the "collection" level, but it became a time-suck so I stopped
- I'm not implementing or pulling-in a proper logging sub-system
- I know it wasn't mentioned but I was implementing (at the data store level) an "update" (update a set of Users that match a predicate, vs update a single user identified by and id) but it was going to introduce a whole lot of work to try and make it ACID that I changed my mind
- Speaking of ACID, I know the data store wasn't required yet I've implemented one anyway, but it is likely (I don't see assurances to the contrary, nor am I concerning myself with them for this project) the data store is weak on the CI parts of ACID
- I considered implementing partial update with PUT, but changed my mind  
<br/>

### Building the Project
The project is located at https://github.com/sfrooster/fuboAPI. It shouldn't let you run with a node version lower than v14.x.x. I'm using v14.17.4 which (I believe) is the latest LTS.
- `git clone` the repo
- You're running node so you have `npm`, but you want `yarn` (and not v2, not yet), so `npm install --global yarn`
- `yarn --version` should report v1.22.5
- `yarn` by itself to install all the dependencies  
<br/>

### Running the Project
I wanted to support clustering, load balancing, auto instance restart, logging, and resource utilization monitoring among other things and, in fact that is all supported. With a big caveat. Because I sort of had to go with a... feeble data store that doesn't really support a multi-user scenario, you can run a load-balanced cluster with a number of instances upto the number of cores your machine has. You can configure that in the config/pm2/pm2.config.json file via the `instances` setting. And it will run a cluster with the specifies number of instances all load-balancing on the same port and the cluster will act as expected as long as you get lucky and all requests for a given entityId are sent to the same instance. Otherwise the store, which has really now been split into `instances` number of data stores, won't know anything about that entityId and you'll get a result you didn't expect. So, I encourage you to try it with an `instances` value greater than 1, and then go back to a cluster size of 1.
- To run in clustered mode with additional debug logging and all the bells and whistles, even with just a single instance  
    - open 3 terminals and `cd` into the project root in each of them. In one, run `yarn rebuild`, in a second, run `yarn monitor` and and in the third run `yarn start:cluster:debug:logs`  
    - the cluster will start-up (with some pauses I built-in to try and address race conditions witht the data store)
    - you can then run a `bash` script (`./scripts/runTests`) with some `curl` commands that will add some users, try to add a user incorrectly, modify a user, try to modify some users incorrectly, and retrieve users
    - or, you can run your own commands using mine as an example
- You can also run a single instance without the clustering layer from the root directory with `node ./dist/api/server.js` (make sure you did a `yarn rebuild` first)
- The cluster will run on port 8080, running independently will default to port 4226, but you can configure that by setting env variable `FUBO_API_PORT`. You can also turn-on additional debug logging in non-clustefed mode by setting env variable `FUBO_DEBUG=true`
- Look in the scripts section of package.jsom for several pre-set commands. `yarn bounce:cluster:debug:logs:clean`, for example, will tear-down the entire cluster including the God process, rebuild the app, clear the terminal, and restart the cluster. Note that anything which altimately runs `yarn clean` will wipe the data store (which is stored in (`./dist/.storage/fubo-data.json`).
<br/>

### Excercising the Project
See `./scripts/runTests` above  
<br/>

### Testing the Project
See `./scripts/runTests` above  
<br/>