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
			b: this.collisionDebugColor.b * MULTIPLIER
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

		let sideOverlap = false
		// Top?
		if (distance1d(this.y, box.top) < this.radius) {
			if (between(this.x, box.left, box.right)) {
				this.velocity.y = -Math.abs(this.velocity.y)
				this.collisionDebugColor.g = 1
				sideOverlap = true
			}
		}

		// Bottom?
		if (distance1d(this.y, box.bottom) < this.radius) {
			if (between(this.x, box.left, box.right)) {
				this.velocity.y = Math.abs(this.velocity.y)
				this.collisionDebugColor.g = 1
				sideOverlap = true
			}
		}

		// Left?
		if (distance1d(this.x, box.left) < this.radius) {
			if (between(this.y, box.top, box.bottom)) {
				this.velocity.x = -Math.abs(this.velocity.x)
				this.collisionDebugColor.g = 1
				sideOverlap = true
			}
		}

		// Right?
		if (distance1d(this.x, box.right) < this.radius) {
			if (between(this.y, box.top, box.bottom)) {
				this.velocity.x = Math.abs(this.velocity.x)
				this.collisionDebugColor.g = 1
				sideOverlap = true
			}
		}

		// To prevent the case of both side overlap and corner overlap from happening,
		// exit early here. sideOverlap, which was already handled, takes precedence.
		if (sideOverlap) {
			return
		}

		// Does the ball overlap with one of the corners?
		let cornerOverlap = false
		for (let corner of box.corners) {
			if (this.contains(corner)) {
				// The box pushes the ball into this direction (towards its midpoint)
				let forceDirection = minus2d(this, corner)
				if (length(forceDirection) === 0) {
					// Force majeure, wait for the next frame to avoid division by zero
					log(
						'Length of a vector was zero where it should not have been. Sorry.'
					)
					return
				}

				// We reverse the ball's velocity to that direction (speed, hopefully, should
				// stay the same)
				this.velocity = minus2d(
					this.velocity,
					mul2d(2, projection(this.velocity, forceDirection))
				)

				// log('Force direction', forceDirection)
				this.collisionDebugColor.r = 1
				cornerOverlap = true
			}
		}
	}
}
