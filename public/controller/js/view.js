export default class View {
    constructor() {
        this.btnStart = document.getElementById('start')
        this.btnStop = document.getElementById('stop')

        this.buttons = () => Array.from(document.querySelectorAll('button'))
        this.ignoreButtons = new Set(['unassigned'])
        async function onBtnClick() {}
        this.onBtnClick = onBtnClick
    }

    onLoad() {
        this.changeCommandButtonsVisibility()
        this.btnStart.onclick = this.onStartClicked.bind(this)
    }

    changeCommandButtonsVisibility(hide = true) {
        Array.from(document.querySelectorAll('[name=command]'))
            .forEach(btn => {
                const fn = hide ? 'add' : 'remove'
                btn.classList[fn]('unassigned')

                function onClickReset() {}
                btn.onclick = onClickReset
            })
    }

    configureOnBtnClick(fn) {
        this.onBtnClick = fn
    }

    async onStartClicked({
        srcElement: {
            innerText
        }
    }) {
        this.toggleBtnStart()
        await this.onBtnClick(innerText)
        this.changeCommandButtonsVisibility(false)
        this.buttons()
            .filter(btn => this.notIsUnsignedButton(btn))
            .forEach(this.setupBtnAction.bind(this))
    }

    setupBtnAction(btn) {
        const text = btn.innerText.toLowerCase()
        if(text.includes('start')) {
            return
        }

        if(text.includes('stop')) {
            btn.onclick = this.onStopBtn.bind(this)
            return
        }

        btn.onclick = this.onCommandClick.bind(this)
    }

    async onCommandClick(btn) {
        const {
            srcElement: {
                classList,
                innerText
            }
        }  =  btn

        this.toggleDisableCommandBtn(classList)
        await this.onBtnClick(innerText)

        setTimeout(() => this.toggleDisableCommandBtn(classList), 600)
    }

    toggleDisableCommandBtn(classList) {
        if(!classList.contains('active')) {
            classList.add('active')
            return
        }

        classList.remove('active')
    }

    onStopBtn({
        srcElement: {
            innerText
        }
    }) {
        this.toggleBtnStart(false)
        this.changeCommandButtonsVisibility(true)

        return this.onBtnClick(innerText)
    }

    notIsUnsignedButton(btn) {
        const classes = Array.from(btn.classList)

        return !(!!classes.find(item => this.ignoreButtons.has(item)))
    }

    toggleBtnStart(active = true) {
        if(active) {
            this.btnStart.classList.add('hidden')
            this.btnStop.classList.remove('hidden')
            return;
        }

        this.btnStop.classList.add('hidden')
        this.btnStart.classList.remove('hidden')
    }
}