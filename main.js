
let START_TIME = Date.now()
let perf = function() {
	return Date.now() - START_TIME
}

if (typeof performance !== 'undefined') {
	perf = function() {
		return performance.now()
	}
}

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

let DEBUG_HEIGHT = SCALE

function clear() {
	ctx.clearRect(0, 0, width, height - DEBUG_HEIGHT)
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

let frame = 0

function loop() {
	clear()

	// Simulate (and draw) this many frames per second
	let MULTIPLIER = 10

	let debugUpdateStart = perf()
	for (let i = 0; i < MULTIPLIER; i++) {
		update(1 / MULTIPLIER)
		// Interesting way of drawing it 10 times per frame
		// drawBalls(1 / MULTIPLIER)
	}
	let debugUpdateTime = perf() - debugUpdateStart

	let debugDrawStart = perf()
	drawBoxes()
	drawBalls(1)
	let debugDrawTime = perf() - debugDrawStart

	// log('update', debugUpdateTime)
	// log('draw', debugDrawTime)
	let frameMs = FRAME_LENGTH * 1000
	ctx.fillStyle = 'black'
	ctx.fillRect(frame % width, height - SCALE, 1, SCALE)
	ctx.fillStyle = 'rgba(255, 0, 0, 1)'
	let updateH = SCALE * debugUpdateTime / frameMs
	ctx.fillRect(frame % width, height - SCALE, 1, updateH)
	ctx.fillStyle = 'rgba(0, 255, 255, 0.5)'
	let drawH = SCALE * debugDrawTime / frameMs
	ctx.fillRect(frame % width, height - drawH, 1, drawH)

	frame++
	requestAnimationFrame(loop)
}

loop()

let ballCount = 50

for (let i = 0; i < ballCount; i++) {
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
