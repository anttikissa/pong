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
