import {jest} from "@jest/globals"
import {Readable, Writable} from "stream"

export default class TestUtil {
    static defaultHandleParams() {
        const requestStream = TestUtil.generateReadableStream(['body'])
        const responseStream = TestUtil.generateWritableStream(() => {})
        const data = {
            request: Object.assign(requestStream, {
                headers: {},
                method: '',
                url: ''
            }),
            response: Object.assign(responseStream, {
                setHeader: jest.fn(),
                writeHead: jest.fn(),
                end: jest.fn()
            }),
        }
        return {
            values: () => Object.values(data),
            ...data
        }
    }

    static generateReadableStream(data) {
        return new Readable({
            objectMode: true,
            read() {
                for (const item of data) {
                    this.push(item)
                }

                this.push(null)
            }
        })
    }

    static generateWritableStream(onData) {
        return new Writable({
            objectMode: true,
            write(chunk, encoding, callback) {
                onData(chunk)

                callback(null, chunk)
            }
        })
    }
}