const SPEED = 0.02

export default class Paddle {
    constructor(paddleElem) {
        this.paddleElem = paddleElem
        this.reset()
    }

    get position() {
        let getprop = parseFloat(getComputedStyle(this.paddleElem).getPropertyValue("--position"));
        return getprop;
    }

    set position(value) {
        this.paddleElem.style.setProperty("--position", value)
    }

    rect() {
        return this.paddleElem.getBoundingClientRect()
    }

    reset() {
        this.position = 50
    }

    update(delta, ballHeight) {
        this.position += SPEED * delta * (ballHeight - this.position)
    }
}