# fubo-api
### Assumptions
- assumption 1
- assumption 2  
<br/>

### Design Decisions
- In the interest of time, I'm doing some things (like relying on `Function.name` to get the runtime entity name) that wouldn't do in the "real world". I'lll try to address each time I do that and what the "real world" alternative is. For example, `Function.name` wouldn't survive a minimization/obfuscation. For the "real world", one option for implementing that same feature would be code-generation via an AST processor (which I have done before) where we'd take the source files, load them into an AST and then programatically generate a static readonly string member on the class. This would run as a pre-transpilation task. 
- I've decided that the approch most consistent with the assignment involves persisting data. I found a possibly-immature npm package which implements a sort of document store, and then I've wrapped it in the Repository pattern.  
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