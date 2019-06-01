let first = true
function makeFillStyle(rgb) {
	let { r, g, b } = rgb
	return `rgb(${(r * 255) | 0}, ${(g * 255) | 0}, ${(b * 255) | 0})`
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
