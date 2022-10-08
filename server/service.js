import fs from "fs";
import config from "./config.js";
import {join, extname} from "path";

const {
    dir: {
        publicDircetory
    }
} = config

export class Service {
    createFileStream(filename) {
        return fs.createReadStream(filename)
    }

    async getFileInfo(file) {
        const fullFilePath = join(publicDircetory, file)
        await fs.promises.access(fullFilePath)

        const fileType = extname(fullFilePath)

        return {
            name: fullFilePath,
            type: fileType
        }
    }

    async getFileStream(file) {
        const {
            name,
            type
        } = await this.getFileInfo(file)

        return {
            stream: this.createFileStream(name),
            type
        }
    }
}