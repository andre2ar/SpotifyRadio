import {Service} from "./service.js";
import {logger} from "./utils.js";

export default class Controller {
    constructor() {
        this.service = new Service()
    }

    async getFileStream(filename) {
        return this.service.getFileStream(filename)
    }

    async handleCommand({command}) {
        logger.info(`Command received: ${command}`)
        const cmd = command.toLowerCase()

        const result = {
            sucess: true
        }
        if(cmd.includes('start')) {
            this.service.startStream()
        } else if(cmd.includes('stop')) {
            this.service.stopStream()
        } else {
            result.sucess = false
        }

        return result
    }

    createClientStream() {
        const {id, clientStream} = this.service.createClientStream()

        const onClose = () => {
            logger.info(`Client ${id} disconnected`)
            this.service.removeClientStream(id)
        }

        return {
            stream: clientStream,
            onClose
        }
    }
}