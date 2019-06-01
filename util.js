let first = true
function makeFillStyle(rgb, opacity = 1) {
	let { r, g, b } = rgb
	if (opacity === 1) {
		return `rgb(${(r * 255) | 0}, ${(g * 255) | 0}, ${(b * 255) | 0})`
	} else {
		return `rgba(${(r * 255) | 0}, ${(g * 255) | 0}, ${(b * 255) | 0}, ${opacity})`
	}
}

function log(...args) {
	console.log(...args)
}

function assert(fact) {
	if (!fact) {
		log('Assertion is about to fail. Hope you had a debugger open!')
		debugger
		throw new Error('assertion failed')
	}
}

function equals(a, b) {
	// Close enough
	return JSON.stringify(a) === JSON.stringify(b)
}
