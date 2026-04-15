import { fourToPercent, percentToLetter } from './utils.js'

function toArray(value) {
	if (!value) return []
	return Array.isArray(value) ? value : [value]
}

function hasGrade(assignment) {
	if (assignment.points == null || assignment.total == null) return false
	if (assignment.total <= 0) return false
	if (
		assignment.Notes &&
		String(assignment.Notes).toLowerCase().includes('not for grading')
	) {
		return false
	}
	return true
}

export function getCategoryWeights(course) {
	const gradeCalc = toArray(course?.Marks?.Mark?.GradeCalculationSummary?.AssignmentGradeCalc)
	const weighted = {}

	for (const item of gradeCalc) {
		const weight = Number.parseFloat(item?.Weight ?? '')
		if (Number.isFinite(weight) && weight !== 100) {
			weighted[item.Type] = weight
		}
	}

	if (Object.keys(weighted).length > 0) return weighted
	return { All: 100 }
}

export function getCourseTotals(course, extraAssignments = []) {
	const weights = getCategoryWeights(course)
	const totals = Object.fromEntries(
		Object.entries(weights).map(([name, weight]) => [name, { score: 0, total: 0, weight }])
	)

	for (const assignment of [
		...toArray(course?.Marks?.Mark?.Assignments?.Assignment),
		...extraAssignments
	]) {
		if (!hasGrade(assignment)) continue
		const category = Object.prototype.hasOwnProperty.call(totals, assignment.Type)
			? assignment.Type
			: 'All'

		if (!totals[category]) {
			totals[category] = { score: 0, total: 0, weight: 100 }
		}

		totals[category].score += Number(assignment.points)
		totals[category].total += Number(assignment.total)
	}

	return totals
}

export function getProjectedCourseMetrics(course, extraAssignments = []) {
	const totals = getCourseTotals(course, extraAssignments)
	let weightedScore = 0
	let activeWeight = 0

	for (const category of Object.values(totals)) {
		if (!category.total || !category.weight) continue
		weightedScore += (category.score / category.total) * category.weight
		activeWeight += category.weight
	}

	if (!activeWeight) {
		return {
			letter: 'N/A',
			displayPercent: null,
			scoreValue: null,
			deltaPercent: null,
			totals
		}
	}

	const rawPercent = (weightedScore / activeWeight) * 100
	const scoreValue = course?.fourPoint ? rawPercent * 0.04 : rawPercent
	const displayPercent = course?.fourPoint ? fourToPercent(scoreValue) : rawPercent

	return {
		letter: percentToLetter(displayPercent),
		displayPercent,
		scoreValue,
		deltaPercent:
			course?.scorePercent >= 0 ? displayPercent - Number(course.scorePercent) : null,
		totals
	}
}

export function getRequiredPointsForTarget(course, category, pointsPossible, targetPercent) {
	const possible = Number(pointsPossible)
	const target = Number(targetPercent)

	if (!Number.isFinite(possible) || possible <= 0) return null
	if (!Number.isFinite(target)) return null

	const weights = getCategoryWeights(course)
	const totals = getCourseTotals(course)
	const bucket = Object.prototype.hasOwnProperty.call(weights, category) ? category : 'All'
	const categoryWeight = Number(weights[bucket] ?? 0)

	if (!categoryWeight) return null

	let fixedWeightedScore = 0
	let denominator = 0

	for (const [name, meta] of Object.entries(weights)) {
		const current = totals[name] ?? { score: 0, total: 0, weight: Number(meta) }
		const isSelected = name === bucket

		if (!isSelected && current.total > 0) {
			fixedWeightedScore += ((current.score / current.total) * 100) * Number(meta)
			denominator += Number(meta)
		}
	}

	const selectedCurrent = totals[bucket] ?? { score: 0, total: 0 }
	denominator += categoryWeight

	const neededCategoryPercent = (target * denominator - fixedWeightedScore) / categoryWeight
	const neededPoints =
		(neededCategoryPercent / 100) * (selectedCurrent.total + possible) - selectedCurrent.score

	return Number.isFinite(neededPoints) ? neededPoints : null
}
