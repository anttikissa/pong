
let canvas = document.querySelector('#content')
let ctx = canvas.getContext('2d')

// width: 1600, height: 900
let { width, height } = canvas

let WORLD_WIDTH = 16
let WORLD_HEIGHT = 9

// coords are x: 0.0-16.0, y: 0.0-9.0
// multiple with SCALE to get canvas coordinates
let SCALE = width / WORLD_WIDTH

// in seconds (let's just assume this)
let FRAME_LENGTH = 1 / 60

function update() {
	for (let ball of balls) {
		ball.update()
	}
}

let boxes = []
let balls = []

// x: 0..15
// y: 0..8
function newBox(x, y) {
	boxes.push(
		new Box({
			x: x + 0.05,
			y: y + 0.05,
			width: 0.9,
			height: 0.9
		})
	)
}

function newBall(x, y, velocity, radius = 0.4) {
	balls.push(
		new Ball({
			x,
			y,
			radius,
			velocity
		})
	)
}

function draw() {
	ctx.clearRect(0, 0, width, height)

	for (let box of boxes) {
		box.draw()
	}

	for (let ball of balls) {
		ball.draw()
	}
}

function loop() {
	update()
	draw()
	requestAnimationFrame(loop)
}


newBall(6.4, 6.2, { x: -0.05, y: -0.025 })
newBall(4.4, 6.0, { x: 0.5, y: 0.1 })
newBall(4.0, 4.8, { x: 0.9, y: -0.05 })
newBall(6.0, 4.0, { x: 0.09, y: 0.95 })

newBall(6.4, 5.5, { x: -0.5, y: -0.025 }, 0.2)
newBall(5.4, 4.5, { x: -0.0, y: 0.5 }, 0.2)

newBox(5, 5)

function doBox(x) {
	newBox(x, 1)
	newBall(x * 0.99 + 0.13, 3, { x: 0, y: -1 }, 0.3)
}

for (let i = 0.75; i < 15; i += 1.5) {
	doBox(i)
}

// newBall(4, 4.5, 0, 0.1)
// newBall(4, 4.5, 0, 0.1)
// newBall(4, 4.5, 0, 0.1)
// newBall(4, 4.5, 0, 0.1)
// newBall(4, 4.5, 0, 0.1)

loop()
