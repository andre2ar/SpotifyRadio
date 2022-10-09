import {expect, describe, test, jest} from '@jest/globals'
import superTest from 'supertest'
import portfinder from 'portfinder'
import Server from "../../../server/server.js";
import {Transform} from 'stream'
import {setTimeout} from 'timers/promises'

const getAvailablePort = portfinder.getPortPromise
const RETENTION_DATA_PERIOD = 200

describe('API E2E Suit Test', () => {
    const commandResponse = JSON.stringify({
        sucess: true
    })

    function pipeAndReadStreamData(stream, onChunck) {
        const transform = new Transform({
            transform(chunk, encoding, callback) {
                onChunck(chunk)

                callback(null, chunk)
            }
        })

        return stream.pipe(transform)
    }

    describe('client workflow', () => {
        async function getTestServer() {
            const port = await getAvailablePort()
            const getSuperTest = port => superTest(`http://localhost:${port}`)

            return new Promise((resolve, reject) => {
                const server = Server.listen(port)
                    .once('listening', () => {
                        const testServer = getSuperTest(port)
                        const response = {
                            testServer,
                            kill() {
                                server.close()
                            }
                        }

                        return resolve(response)
                    }).once('error', reject)
            })
        }

        function commandSender(testServer) {
            return {
                async send(command) {
                    const response = await testServer.post('/controller')
                        .send({
                            command
                        })

                    expect(response.text).toStrictEqual(commandResponse)
                }
            }
        }

        test('it should not receive data stream if the process is not playing', async () => {
            const server = await getTestServer()
            const onChunck = jest.fn()
            pipeAndReadStreamData(
                server.testServer.get('/stream'),
                onChunck
            )

            await setTimeout(RETENTION_DATA_PERIOD)

            server.kill()

            expect(onChunck).not.toHaveBeenCalled()
        })

        test('it should receive data stream if the process is playing', async () => {
            const server = await getTestServer()
            const onChunck = jest.fn()
            const {send} = commandSender(server.testServer)
            pipeAndReadStreamData(
                server.testServer.get('/stream'),
                onChunck
            )

            await send('start')
            await setTimeout(RETENTION_DATA_PERIOD)
            await send('stop')

            const [
                [buffer]
            ] = onChunck.mock.calls

            expect(buffer).toBeInstanceOf(Buffer)
            expect(buffer.length).toBeGreaterThan(1000)

            server.kill()
        })
    })
})