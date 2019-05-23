function log(...args) {
	console.log(...args)
}

let canvas = document.querySelector('#content')

// width: 1600, height: 900
let { width, height } = canvas

let WORLD_WIDTH = 16
let WORLD_HEIGHT = 9

// coords are x: 0.0-16.0, y: 0.0-9.0
// multiple with SCALE to get canvas coordinates
let SCALE = width / WORLD_WIDTH
let ctx = canvas.getContext('2d')

// in seconds (let's just assume this)
let FRAME_LENGTH = 1 / 60

// basic math
let square = x => x * x
let distance1d = (a, b) => Math.abs(a - b)
let between = (value, min, max) => min < value && value < max

// vector operations
let minus2d = (a, b) => ({ x: a.x - b.x, y: a.y - b.y })
let mul2d = (scalar, v) => ({ x: scalar * v.x, y: scalar * v.y })
let distance = (a, b) => Math.sqrt(square(a.x - b.x) + square(a.y - b.y))
let length = v => Math.sqrt(square(v.x) + square(v.y))
// returns null if vector length is zero
function normalize(v) {
	let len = length(v)
	if (!len) {
		return null
	}
	return mul2d(1 / len, v)
}

function update() {
	for (let ball of balls) {
		ball.checkWallCollisions()
		ball.checkCollisions()

		ball.x += ball.velocity.x * FRAME_LENGTH
		ball.y += ball.velocity.y * FRAME_LENGTH
	}
}

function overlaps(range1, range2) {
	if (range1.min < range2.min) {
		return range1.max > range2.min
	} else {
		return range2.max > range1.min
	}
}

function collides(ball, box) {
	let ballRanges = ball.ranges
	let boxRanges = box.ranges

	// Do the containing boxes overlap? This is always true when the ball and the box collide.
	let containingBoxOverlap = false
	if (
		overlaps(ballRanges.x, boxRanges.x) &&
		overlaps(ballRanges.y, boxRanges.y)
	) {
		containingBoxOverlap = true
	}

	// Does the ball overlap with one of the corners?
	let cornerOverlap = false
	for (let corner of box.corners) {
		if (ball.contains(corner)) {
			// The box pushes the ball into this direction
			let forceDirection = minus2d(ball, corner)
			// log('Force direction', forceDirection)
			cornerOverlap = true
		}
	}

	let sideOverlap = false
	// Top?
	if (distance1d(ball.y, box.top) < ball.radius) {
		if (between(ball.x, box.left, box.right)) {
			ball.velocity.y = -Math.abs(ball.velocity.y)
			sideOverlap = true
		}
	}

	// Bottom?
	if (distance1d(ball.y, box.bottom) < ball.radius) {
		if (between(ball.x, box.left, box.right)) {
			ball.velocity.y = Math.abs(ball.velocity.y)
			sideOverlap = true
		}
	}

	// Left?
	if (distance1d(ball.x, box.left) < ball.radius) {
		if (between(ball.y, box.top, box.bottom)) {
			ball.velocity.x = -Math.abs(ball.velocity.x)
			sideOverlap = true
		}
	}

	// Right?
	if (distance1d(ball.x, box.right) < ball.radius) {
		if (between(ball.y, box.top, box.bottom)) {
			ball.velocity.x = Math.abs(ball.velocity.x)
			sideOverlap = true
		}
	}

	return sideOverlap || cornerOverlap
}

let boxes = []
let balls = []

class Box {
	constructor(args) {
		Object.assign(this, args)
	}

	get ranges() {
		return {
			x: {
				min: this.x,
				max: this.x + this.width
			},
			y: {
				min: this.y,
				max: this.y + this.height
			}
		}
	}

	get top() {
		return this.y
	}

	get bottom() {
		return this.y + this.height
	}

	get left() {
		return this.x
	}

	get right() {
		return this.x + this.width
	}

	get corners() {
		return [
			{ x: this.x, y: this.y },
			{ x: this.x + this.width, y: this.y },
			{ x: this.x + this.width, y: this.y + this.height },
			{ x: this.x, y: this.y + this.height }
		]
	}

	draw() {
		ctx.fillStyle = 'white'
		ctx.fillRect(
			this.x * SCALE,
			this.y * SCALE,
			this.width * SCALE,
			this.width * SCALE
		)
	}
}

class Ball {
	constructor(args) {
		Object.assign(this, args)
		this.overlaps = false

		if (!this.x) {
			this.x = Math.random() * WORLD_WIDTH
		}
		if (!this.y) {
			this.y = Math.random() * WORLD_HEIGHT
		}

		if (!this.velocity) {
			this.velocity = {
				x: Math.random() * 20 - 10,
				y: Math.random() * 20 - 10
			}
		}
	
	
	}

	get ranges() {
		return {
			x: {
				min: this.x - this.radius,
				max: this.x + this.radius
			},
			y: {
				min: this.y - this.radius,
				max: this.y + this.radius
			}
		}
	}

	contains(point) {
		return distance(this, point) < this.radius
	}

	get speed() {
		return length(this.velocity)
	}

	set speed(newSpeed) {
		let direction = normalize(this.velocity) || { x: 1, y: 0 }
		this.velocity = mul2d(newSpeed, direction)
	}

	draw() {
		ctx.beginPath()
		ctx.arc(
			this.x * SCALE,
			this.y * SCALE,
			this.radius * SCALE,
			0,
			2 * Math.PI,
			false
		)

		ctx.fillStyle = this.collides ? 'red' : 'white'
		ctx.fill()
		ctx.closePath()
	}

	checkWallCollisions() {
		if (this.x - this.radius < 0) {
			this.velocity.x = Math.abs(this.velocity.x)
		}
		if (this.x + this.radius > WORLD_WIDTH) {
			this.velocity.x = -Math.abs(this.velocity.x)
		}
		if (this.y - this.radius < 0) {
			this.velocity.y = Math.abs(this.velocity.y)
		}
		if (this.y + this.radius > WORLD_HEIGHT) {
			this.velocity.y = -Math.abs(this.velocity.y)
		}
	}

	checkCollisions() {
		this.collides = false
		for (let box of boxes) {
			if (collides(this, box)) {
				this.collides = true
			}
		}
	}
}

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

newBox(1, 1)
newBox(2, 1)
newBox(3, 1)
newBox(4, 1)
newBox(5, 5)

newBall(6.4, 6.2, { x: -0.05, y: -0.025 })
newBall(4.4, 6.0, { x: 0.5, y: 0.1 })
newBall(4.0, 4.8, { x: 0.9, y: -0.05 })
newBall(6.0, 4.0, { x: 0.09, y: 0.95 })

newBall(6.4, 5.5, { x: -0.5, y: -0.025 }, 0.2)
newBall(5.4, 4.5, { x: -0.0, y: 0.5 }, 0.2)

newBall(4, 4.5, 0, 0.1)
newBall(4, 4.5, 0, 0.1)
newBall(4, 4.5, 0, 0.1)
newBall(4, 4.5, 0, 0.1)
newBall(4, 4.5, 0, 0.1)

loop()
