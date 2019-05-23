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
