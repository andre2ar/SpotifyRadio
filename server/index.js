import server from "./server.js";
import {logger} from "./utils.js";
import config from "./config.js";

server.listen(config.port)
.on('listening', () => logger.info(`Server running ${config.port}`))

process.on('uncaughtException', (error) => logger.error(`UnhandledException happend: ${error.stack || error}`))
process.on('unhandledRejection', (error) => logger.error(`UnhandledRejection happend: ${error.stack || error}`))