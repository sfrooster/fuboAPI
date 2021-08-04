# fubo-api
### Assumptions
- assumption 1
- assumption 2  
<br/>

### Design Decisions
- Sorry, I didn't use Go. I thought about it, then realized I had a better chance of showing the things I wanted to if I didn't also take on the task of shaking the rust (bad choice of words) off my Go. I also considered doing i minimal version of the bigger Node project in Go, but... time
- In the interest of time, I'm doing some things (like relying on `Function.name` to get the runtime entity name) that wouldn't do in the "real world". I'lll try to address each time I do that and what the "real world" alternative is. For example, `Function.name` wouldn't survive a minimization/obfuscation. For the "real world", one option for implementing that same feature would be code-generation via an AST processor (which I have done before) where we'd take the source files, load them into an AST and then programatically generate a static readonly string member on the class. This would run as a pre-transpilation task
- I've decided that the approch most consistent with the assignment involves persisting data. I found a possibly-immature npm package which implements a sort of document store, and then I've wrapped it in the Repository pattern
- **Special Note Here**: I also went a little overboard and built the project with horizontal scaling (including some interesting monitoring and logging features - not built by me, but there nonetheless), and the default configuration runs two instances of the service in a clustered mode, with auto-restart etc (you can set the configuration to run up to as many cores as your machine has but I've gone with 2 for demo purposes and also for what you're about to read next). For simplicity, I chose persistence provided by a single npm package vs requiring someone to install and configure say, mongo. In exchange for making that piece easy I got a data store that is essentially a simple document store but which, more importantly, wasn't built with the idea of being a shared resource in mind. Not their fault, and I decided to take on the challenge anyway. So, I've built some oddities in which seem to addess sharing this single store among multiple clients (for example, a randomized delay at data store instantiation so that - hopefully - one client is up first and initializes things rather than the two stepping on each other). And in my testing is seems to have done the trick (but I'm keeping the instances low so as to not press my luck). The things to keep in mind are: I wanted to not only speak to these considerations but actually demonstrate them, but do so in a way that would not require external infrastructure, which required taking some unusual but time-aware steps towards addressing inherit challenges with all this. Finally, if in the course of playing with it, it turns-out my efforts to make the data store shareable fail, then there are several options: wipe it and run again, drop the clustering instance count down to 1, run it without clustering - these are the first few that come to mind. I'll provide specifics below
- I'm not creating different run configuration for dev vs production - only "production"
- I have not pulled-in a logging package because I don't want to burn time setting it up. In "the real world", I would. As a consequene there are places where I've left debug logging code that are... clunky, vs the normal situation of setting a log-level and making appropriate logger calls. Again, I'm aware, but in the interest of time I'm leaving the clunk and just acknowledging it
- The more I look at my ad-hoc debug logging the more I think I should've ust spent the time to pull in a package
- `Repository` is a bit bloated, maybe, and I know it should probably have an associated `interface` etc.
<br/>

### Miscellany
- I wouldn't (probably) normally include the .npmrc, but I am here because there's nothing sensitive in it and it has settings to address "mismatched" node binaries versions and enforcing that a node version is being used which supports the targeted TypeScript feature set
- I don't agree with how the author of node-json-db has organized their package (JsonDB and JsonDBConfig, along with probably several other items) should probably been "barrelled" together, but... nevermind - I created my own barrell in node-json-db-adapter
- There are artifacts - like interfaces (and separate at that) for RepositoryWriter and RepositoryReader which aren't really serving a purpose, but I've put them in because they help to more closely resemble a more real world approach (and in doing so counter-balance some short-cuts I've taken)
- I explored supporting meta-data at the "collection" level, but it became a time-suck so I stopped
- I'm not implementing or pulling-in a proper logging sub-system
- I know it wasn't mentioned but I was implementing (at the data store level) an "update" (update a set of Users that match a predicate, vs update a single user identified by and id) but it was going to introduce a whole lot of work to try and make it ACID that I changed my mind
- Speaking of ACID, I know the data store wasn't required yet I've implemented one anyway, but it is likely (I don't see assurances to the contrary, nor am I concerning myself with them for this project) the data store is weak on the CI parts of ACID.
<br/>

### Building the Project
  
<br/>

### Running the Project
  
<br/>

### Excercising the Project
  
<br/>

### Testing the Project