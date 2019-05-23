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

function makeFillStyle(rgb) {
	// convert value between 0 and 1 to "00" -> "ff"
	// if value is not between 0 and 1, you get garbage
	function hexify(value) {
		let n = Math.round(value * 255.0)
		let s = n.toString(16).slice(0, 2)
		if (s.length < 2) {
			return '0' + s
		}
		return s
	}
	let { r, g, b } = rgb
	return '#' + hexify(r) + hexify(g) + hexify(b)
}
function update() {
	for (let ball of balls) {
		ball.update()
	}
}

function overlaps(range1, range2) {
	if (range1.min < range2.min) {
		return range1.max > range2.min
	} else {
		return range2.max > range1.min
	}
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
		ctx.fillStyle = 'black'
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
		this.collisionDebugColor = {
			r: 0,
			g: 0,
			b: 0
		}

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

	update() {
		this.checkWallCollisions()
		this.checkCollisions()

		this.x += this.velocity.x * FRAME_LENGTH
		this.y += this.velocity.y * FRAME_LENGTH
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

		ctx.fillStyle = makeFillStyle(this.collisionDebugColor)
		ctx.fill()
		ctx.closePath()
	}

	checkWallCollisions() {
		if (this.x - this.radius < 0) {
			this.velocity.x = Math.abs(this.velocity.x)
			this.collisionDebugColor.b = 1
		}
		if (this.x + this.radius > WORLD_WIDTH) {
			this.velocity.x = -Math.abs(this.velocity.x)
			this.collisionDebugColor.b = 1
		}
		if (this.y - this.radius < 0) {
			this.velocity.y = Math.abs(this.velocity.y)
			this.collisionDebugColor.b = 1
		}
		if (this.y + this.radius > WORLD_HEIGHT) {
			this.velocity.y = -Math.abs(this.velocity.y)
			this.collisionDebugColor.b = 1
		}
	}

	checkCollisions() {
		let MULTIPLIER = 0.985
		this.collisionDebugColor = {
			r: this.collisionDebugColor.r * MULTIPLIER,
			g: this.collisionDebugColor.g * MULTIPLIER,
			b: this.collisionDebugColor.b * MULTIPLIER,
		}
		for (let box of boxes) {
			this.collide(box)
		}
	}

	collide(box) {
		let ballRanges = this.ranges
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
			if (this.contains(corner)) {
				// The box pushes the ball into this direction
				let forceDirection = minus2d(this, corner)
				// log('Force direction', forceDirection)
				this.collisionDebugColor.r = 1
				cornerOverlap = true
			}
		}

		let sideOverlap = false
		// Top?
		if (distance1d(this.y, box.top) < this.radius) {
			if (between(this.x, box.left, box.right)) {
				this.velocity.y = -Math.abs(this.velocity.y)
				this.collisionDebugColor.g = 1
			}
		}

		// Bottom?
		if (distance1d(this.y, box.bottom) < this.radius) {
			if (between(this.x, box.left, box.right)) {
				this.velocity.y = Math.abs(this.velocity.y)
				this.collisionDebugColor.g = 1
			}
		}

		// Left?
		if (distance1d(this.x, box.left) < this.radius) {
			if (between(this.y, box.top, box.bottom)) {
				this.velocity.x = -Math.abs(this.velocity.x)
				this.collisionDebugColor.g = 1
			}
		}

		// Right?
		if (distance1d(this.x, box.right) < this.radius) {
			if (between(this.y, box.top, box.bottom)) {
				this.velocity.x = Math.abs(this.velocity.x)
				this.collisionDebugColor.g = 1
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
