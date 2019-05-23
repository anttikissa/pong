function log(...args) {
    console.log(...args)
}

let canvas = document.querySelector('#content')

let { width, height } = canvas

let ctx = canvas.getContext('2d')

function update() {

}

function draw() {
    log('draw')

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = 'red'
    ctx.fillRect(10, 10, 200, 200)
}

function loop() {
    update()
    draw()
    requestAnimationFrame(loop)
}

loop()
