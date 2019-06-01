
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

function update(frames = 1) {
	for (let ball of balls) {
		ball.update(frames)
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

function newBall(x, y, velocity, radius = 0.12) {
	balls.push(
		new Ball({
			x,
			y,
			radius,
			velocity
		})
	)
}

function clear() {
	ctx.clearRect(0, 0, width, height)
}

function drawBoxes() {
	for (let box of boxes) {
		box.draw()
	}
}
function drawBalls(frames = 1) {
	for (let ball of balls) {
		ball.draw(frames)
	}
}

function loop() {
	clear()
	for (let i = 0; i < 10; i++) {
		update(0.1)
	}
	drawBoxes()
	drawBalls(0.1)
	requestAnimationFrame(loop)
}


loop()

for (let i = 0; i < 100; i++) {
	setTimeout(() => {
		newBall(5, 8.8, { x: 6.5, y: -15 })
	}, 30 * i)
}

for (let i = 0; i < 16; i++) {
	for (let j = 0; j < 5; j++) {
		if (j < 1) {
			if (i % (j + 7)) {
				continue;
			}
		}
		if (j < 2) {
			if (i % (j + 2)) {
				continue;
			}
		}
		if ((i + 1) % j) {
			continue
		}
		newBox(i, j)
	}
}
