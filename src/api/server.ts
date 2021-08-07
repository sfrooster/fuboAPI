import * as http from 'http';
import { App } from './App';
import { Settings } from '../utilities';



const server = http.createServer(App.express);

const port = Settings.apiListenPort >= 0 ? Settings.apiListenPort : 4226;
App.express.set('port', port);

const onError = (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;

    let errMsg: string;
    switch (error.code) {
        case 'EACCES':
            errMsg = `${bind} requires elevated privileges`;
            console.error(errMsg);
            // process.exit(1);
            process.exitCode = 2;
            throw new Error(errMsg);

        case 'EADDRINUSE':
            errMsg = `${bind} requires elevated privileges`;
            console.error(`${bind} is already in use`);
            // process.exit(1);
            process.exitCode = 3;
            throw new Error(errMsg);

        default:
            throw error;
    }
};

const onListening = () => {
    const addr = server.address() ?? 'localhost';
    const bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Listening on ${bind}`);
};

async function main() {
    await App.ready();

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
}

main();