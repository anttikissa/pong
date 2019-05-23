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

function dotProduct(a, b) {
    return a.x * b.x + a.y * b.y
}

// projection of a in the direction of b
function projection(a, b) {
    let bLength = length(b)
    return mul2d(dotProduct(a, b) / bLength, normalize(b))
}

assert(equals(projection({ x: 3, y: 4 }, { x: 5, y: 0 }), { x: 3, y: 0 }))
assert(equals(projection({ x: 3, y: 4 }, { x: 1, y: 0 }), { x: 3, y: 0 }))
assert(equals(projection({ x: 3, y: 4 }, { x: 0, y: 1.5 }), { x: 0, y: 4 }))

function overlaps(range1, range2) {
	if (range1.min < range2.min) {
		return range1.max > range2.min
	} else {
		return range2.max > range1.min
	}
}

assert(equals(normalize({ x: 2, y: 0 }), { x: 1, y: 0 }))
