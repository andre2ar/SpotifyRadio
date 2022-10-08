import {expect, describe, test, beforeEach, jest} from '@jest/globals'
import config from "../../../server/config.js";
import TestUtil from "../_util/testUtil.js";
import {handler} from "../../../server/routes.js";
import Controller from "../../../server/controller.js";

describe('#Routes', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        jest.clearAllMocks()
    })

    test('GET / - should redirect to homepage', async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/'

        await handler(...params.values())

        expect(params.response.writeHead).toBeCalledWith(302, {
            'Location': config.location.home
        })

        expect(params.response.end).toHaveBeenCalled()
    })

    test(`GET /home - should respond with ${config.pages.homeHTML} file stream`, async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/home'

        const mockFileStream = TestUtil.generateReadableStream(['file content'])
        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream
        })

        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        await handler(...params.values())

        expect(Controller.prototype.getFileStream)
            .toBeCalledWith(config.pages.homeHTML)
        expect(mockFileStream.pipe).toBeCalledWith(params.response)
    })

    test(`GET /controller - should respond with ${config.pages.controllerHTML} file stream`, async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/controller'

        const mockFileStream = TestUtil.generateReadableStream(['file content'])

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream
        })

        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        await handler(...params.values())

        expect(Controller.prototype.getFileStream)
            .toBeCalledWith(config.pages.controllerHTML)
        expect(mockFileStream.pipe).toBeCalledWith(params.response)
    })

    test(`GET /index.html - should respond with a file stream`, async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/index.html'

        const mockFileStream = TestUtil.generateReadableStream(['file content'])

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream,
            type: '.html'
        })

        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        await handler(...params.values())

        expect(Controller.prototype.getFileStream)
            .toBeCalledWith('/index.html')
        expect(mockFileStream.pipe).toBeCalledWith(params.response)
        expect(params.response.writeHead).toBeCalledWith(200, {
            'Content-Type': config.constants.CONTENT_TYPE['.html']
        })
    })

    test(`GET /file.ext - should respond with a file stream`, async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/file.ext'

        const mockFileStream = TestUtil.generateReadableStream(['file content'])

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream,
            type: '.ext'
        })

        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        await handler(...params.values())

        expect(Controller.prototype.getFileStream)
            .toBeCalledWith('/file.ext')
        expect(mockFileStream.pipe).toBeCalledWith(params.response)
        expect(params.response.writeHead).not.toBeCalledWith(200, {
            'Content-Type': config.constants.CONTENT_TYPE['.html']
        })
    })

    test(`POST /unknown - given an inexistent route it should responde with 404`, async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'POST'
        params.request.url = '/unknown'


        await handler(...params.values())

        expect(params.response.writeHead).toHaveBeenCalledWith(404)
        expect(params.response.end).toHaveBeenCalled()
    })

    describe('exceptions', () => {
        test('Given inexistent file it should repond with 404', async () => {
            const params = TestUtil.defaultHandleParams()
            params.request.method = 'GET'
            params.request.url = '/index.png'

            jest.spyOn(
                Controller.prototype,
                Controller.prototype.getFileStream.name
            ).mockRejectedValue(new Error('Error: ENOENT: no such file or directory'))


            await handler(...params.values())

            expect(params.response.writeHead).toHaveBeenCalledWith(404)
            expect(params.response.end).toHaveBeenCalled()
        })

        test('Given an error it should repond with 404', async () => {
            const params = TestUtil.defaultHandleParams()
            params.request.method = 'GET'
            params.request.url = '/index.png'

            jest.spyOn(
                Controller.prototype,
                Controller.prototype.getFileStream.name
            ).mockRejectedValue(new Error('Error'))


            await handler(...params.values())

            expect(params.response.writeHead).toHaveBeenCalledWith(500)
            expect(params.response.end).toHaveBeenCalled()
        })
    })
})