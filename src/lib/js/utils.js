const lightThemes = ['light']

export function getColor(percent, theme = 'amoled') {
	const isLight = lightThemes.includes(theme)
	const score = Number(percent)
	if (!Number.isFinite(score) || score < 0) return null

	const clamped = Math.max(0, Math.min(100, score))

	if (clamped >= 90) {
		return isLight ? 'rgb(22, 163, 74)' : 'rgb(74, 222, 128)'
	}

	if (clamped >= 80) {
		return isLight ? 'rgb(132, 204, 22)' : 'rgb(190, 242, 100)'
	}

	if (clamped >= 70) {
		return isLight ? 'rgb(245, 158, 11)' : 'rgb(251, 191, 36)'
	}

	if (clamped >= 60) {
		return isLight ? 'rgb(249, 115, 22)' : 'rgb(251, 146, 60)'
	}

	return isLight ? 'rgb(220, 38, 38)' : 'rgb(248, 113, 113)'
}

export function fourToPercent(grade) {
	if (grade === 4.0) return 100
	else if (grade === 0) return 0
	else return grade * 10 + 55
}

export function percentToLetter(grade) {
	if (grade >= 90) return 'A'
	else if (grade >= 80) return 'B'
	else if (grade >= 70) return 'C'
	else if (grade >= 60) return 'D'
	else return 'F'
}

export function HSLtoRGB(h, s, l) {
	let a = s * Math.min(l, 1 - l)
	let f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
	return `rgb(${Math.round(f(0) * 255)}, ${Math.round(f(8) * 255)}, ${Math.round(f(4) * 255)})`
}
