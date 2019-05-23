function log(...args) {
	console.log(...args)
}

let canvas = document.querySelector("#content")

// width: 1600, height: 900
let { width, height } = canvas

// coords are x: 0.0-16.0, y: 0.0-9.0
// multiple with SCALE to get canvas coordinates
let SCALE = width / 16
let ctx = canvas.getContext("2d")

function update() {
	for (let box of boxes) {
		box.x += 0.01
	}
}

let boxes = []
let balls = []

// x: 0..15
// y: 0..8
function newBox(x, y) {
	boxes.push({
		x: x + 0.05,
		y: y + 0.05,
		width: 0.9,
		height: 0.9
	})
}

function newBall(x, y) {
	balls.push({
		x,
		y,
		radius: 0.5
	})
}

function draw() {
	log("draw")

	// ctx.clearRect(0, 0, width, height)

	for (let box of boxes) {
		ctx.fillStyle = "white"
		ctx.fillRect(
			box.x * SCALE,
			box.y * SCALE,
			box.width * SCALE,
			box.width * SCALE
		)
	}

	for (let ball of balls) {
		ctx.beginPath()
		ctx.arc(
			ball.x * SCALE,
			ball.y * SCALE,
			ball.radius * SCALE,
			0,
			2 * Math.PI,
			false
		)

		ctx.fillStyle = "white"
		ctx.fill()
		ctx.closePath()
	}
}

function loop() {
	update()
	draw()
	requestAnimationFrame(loop)
}

newBox(1, 1)
newBox(2, 1)
newBox(3, 1)
newBox(4, 1)
newBox(5, 5)

newBall(8, 7)

loop()
