import fs from "fs";
import config from "./config.js";
import {randomUUID} from "crypto";
import path, {join, extname} from "path";
import {PassThrough, Writable} from "stream";
import Throttle from "throttle";
import childProcess from "child_process";
import {logger} from "./utils.js";
import streamPromises from 'stream/promises';
import {once} from "events";

const {
    dir: {
        publicDircetory
    }
} = config

export class Service {
    constructor() {
        this.clientStreams = new Map()
        this.currentSong = config.constants.englishConversation
        this.currentBitRate = 0
        this.throttleTransform = {}
        this.currentReadable = {}
    }

    broadCast() {
        return new Writable({
            write: (chunk, encoding, callback) => {
                for(const [id, stream] of this.clientStreams) {
                    if(stream.writableEnded) {
                        this.clientStreams.delete(id)
                        continue
                    }

                    stream.write(chunk)
                }

                callback()
            }
        })
    }

    async startStream() {
        logger.info(`Starting song ${this.currentSong}`)
        const bitRate = this.currentBitRate = await this.getBitRate(this.currentSong) / config.constants.bitRateDivisor
        const throttleTransform = this.throttleTransform = new Throttle(bitRate)
        const songReadable = this.currentReadable = this. createFileStream(this.currentSong)

        return streamPromises.pipeline(
            songReadable,
            throttleTransform,
            this.broadCast()
        )
    }

    async stopStream() {
        this.throttleTransform?.end?.()
    }

    createClientStream() {
        const id = randomUUID()
        const clientStream = new PassThrough()
        this.clientStreams.set(id, clientStream)

        return {
            id,
            clientStream
        }
    }

    removeClientStream(id) {
        this.clientStreams.delete(id)
    }

    _executeCommand(args) {
        return childProcess.spawn('sox', args)
    }

    async getBitRate(song) {
        try {
            const args = [
                '--i',
                '-B',
                song
            ]
            const {
                stderr,
                stdout
            } = this._executeCommand(args)

            await Promise.all([
                once(stderr, 'readable'),
                once(stdout, 'readable'),
            ])

            const [success, error] = [stdout, stderr].map(stream => stream.read())
            if(error) {
                return await Promise.reject(error)
            }

            return success
                .toString()
                .trim()
                .replace(/k/, '000')
        } catch (error) {
            logger.error(`Bitrate error: ${error}`)
            return config.constants.fallbackBitRate
        }
    }

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

    async readFxByName(fxName) {
        const songs = await fs.promises.readdir(config.dir.fxDirectory)
        const chosenSong = songs.find(filename => filename.toLowerCase().includes(fxName))

        if(!chosenSong) {
            return Promise.reject(`Song ${fxName} couldn't be found`)
        }

        return path.join(config.dir.fxDirectory, chosenSong)
    }

    appendFxStream(fx) {
        const throttleTransformable = new Throttle(this.currentBitRate)
        streamPromises.pipeline(
            throttleTransformable,
            this.broadCast()
        )

        const unpipe = () => {
            const transformStream = this.mergeAudioStream(fx, this.currentReadable)
            this.throttleTransform = throttleTransformable
            this.currentReadable = transformStream
            this.currentReadable.removeListener('unpipe', unpipe)

            streamPromises.pipeline(
                transformStream,
                throttleTransformable
            )
        }

        this.throttleTransform.on('unpipe', unpipe)
        this.throttleTransform.pause()
        this.currentReadable.unpipe(this.throttleTransform)
    }

    mergeAudioStream(song, readable) {
        const transformStream = PassThrough()
        const args = [
            '-t', config.constants.audioMediaType,
            '-v', config.constants.songVolume,
            '-m', '-',
            '-t', config.constants.audioMediaType,
            '-v', config.constants.fxVolume,
            song,
            '-t', config.constants.audioMediaType,
            '-'
        ]

        const {
            stdout,
            stdin
        } = this._executeCommand(args)

        streamPromises.pipeline(
            readable,
            stdin
        )

        streamPromises.pipeline(
            stdout,
            transformStream
        )

        return transformStream
    }
}