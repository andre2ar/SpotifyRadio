import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {JSDOM} from "jsdom";

describe('#View - test suit for presentation layer', () => {
    const dom = new JSDOM()
    global.document = dom.window.document
    global.window = dom.window

    function makeBtnElement({text, classList} = {text: '', classList: {add: jest.fn, remove: jest.fn}}) {
        return {
            onclick: jest.fn,
            classList,
            innerText: text
        }
    }

    beforeEach(() => {
        jest.restoreAllMocks()
        jest.resetAllMocks()
        jest.clearAllMocks()

        jest.spyOn(
            document,
            document.querySelectorAll.name
        ).mockReturnValue([makeBtnElement()])

        jest.spyOn(
            document,
            document.getElementById.name
        ).mockReturnValue(makeBtnElement())
    })

    test('#changeCommandButtonsVisibility - give hide=true it should add unassigned class and rese onclick', () => {

    })

    test('#changeCommandButtonsVisibility - give hide=false it should remove unassigned class and rese onclick', () => {

    })
})