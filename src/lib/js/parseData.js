import { getColor, fourToPercent, percentToLetter } from './utils.js'

function getCategoryColor(name = '') {
	if (!name) return 'hsl(0 0% 55%)'
	let hash = 0
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash)
	}
	const hue = Math.abs(hash) % 360
	return `hsl(${hue} 70% 60%)`
}

export function parseData(periods, oldAssignmentsSet, theme = 'amoled') {
	for (let period of periods) {
		if (!period) continue
		if (!period.Courses || !period.Courses.Course) continue
		if (!Array.isArray(period.Courses.Course)) {
			period.Courses.Course = [period.Courses.Course]
		}

		let grades = []
		let assignments = []

		for (let [index, course] of period.Courses.Course.entries()) {
			course.Title = course.Title.replace(/ \([\s\S]*?\)/g, '')
			course.index = index
			course.chartData = []
			course.fourPoint = false
			course.assignmentCount = 0
			course.missingCount = 0

			if (course.Marks.Mark && course.Marks.Mark.CalculatedScoreString !== 'N/A') {
				if (
					course.Marks.Mark.Assignments.Assignment &&
					Array.isArray(course.Marks.Mark.Assignments.Assignment) &&
					course.Marks.Mark.Assignments.Assignment[0].ScoreType === 'Rubric 0-4'
				) {
					course.fourPoint = true
				}
			}

			if (course.Marks.Mark && course.Marks.Mark.Assignments.Assignment) {
				if (!Array.isArray(course.Marks.Mark.Assignments.Assignment)) {
					course.Marks.Mark.Assignments.Assignment = [
						course.Marks.Mark.Assignments.Assignment
					]
				}

				course.scoreTypes = {}
				if (course.Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc) {
					let gradeCalc = course.Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc
					if (!Array.isArray(gradeCalc)) gradeCalc = [gradeCalc]
					for (let type of gradeCalc) {
						if (parseInt(type.Weight) !== 100.0) {
							course.scoreTypes[type.Type] = {
								score: 0,
								total: 0,
								weight: parseInt(type.Weight)
							}
						}
					}
				} else {
					course.scoreTypes.All = { score: 0, total: 0, weight: 100 }
				}

				for (let assignment of [...course.Marks.Mark.Assignments.Assignment].reverse()) {
					assignment.Measure = assignment.Measure.replace('&amp;', '&')
					assignment.course = course.Title
					assignment.courseIndex = index
					assignment.style = null
					assignment.categoryColor = getCategoryColor(assignment.Type)
					assignment.scorePercent = -1
					assignment.progressValue = 0
					assignment.isMissing =
						typeof assignment.Notes === 'string' &&
						assignment.Notes.toLowerCase().includes('missing')
					course.assignmentCount += 1
					if (assignment.isMissing) course.missingCount += 1

					if (assignment.Points.includes('Points Possible')) {
						assignment.percent = '?'
						assignment.score = assignment.isMissing ? 'Missing' : 'Not Graded'
						assignment.style = 'color: hsl(0 72% 56%);'
					} else {
						assignment.percent = '-'
						assignment.score = assignment.Points
					}

					if (oldAssignmentsSet) {
						if (assignment.new !== true) {
							assignment.new = !oldAssignmentsSet.has(assignment.GradebookID)
						}
						oldAssignmentsSet.add(assignment.GradebookID)
					}

					if (assignment.Points.includes(' / ') || assignment.edited) {
						if (assignment.Points.includes(' / ')) {
							let split = assignment.Points.split(' / ')
							assignment.pointsOriginal = parseFloat(split[0])
							assignment.totalOriginal = parseFloat(split[1])
							if (!assignment.edited) {
								assignment.points = assignment.pointsOriginal
								assignment.total = assignment.totalOriginal
							}
						}
						assignment.score = assignment.points + ' / ' + assignment.total

						if (
							(assignment.points === 0 && assignment.total === 0) ||
							(assignment.Notes &&
								assignment.Notes.toLowerCase().includes('not for grading'))
						) {
							assignment.scorePercent = -1
							assignment.percent = '-'
						} else {
							assignment.scorePercent = (assignment.points / assignment.total) * 100
							assignment.percent = assignment.scorePercent
								? assignment.scorePercent.toFixed(1) + '%'
								: '0.0%'
							assignment.progressValue = Math.max(0, Math.min(100, assignment.scorePercent))

							if (course.Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc) {
								if (course.scoreTypes[assignment.Type]) {
									course.scoreTypes[assignment.Type].score += assignment.points
									course.scoreTypes[assignment.Type].total += assignment.total
								}
							} else {
								course.scoreTypes.All.score += assignment.points
								course.scoreTypes.All.total += assignment.total
							}

							let date = new Date(assignment.DueDate)
							let scoreSum = 0
							let totalSum = 0

							for (let type of Object.values(course.scoreTypes)) {
								if (type.total > 0) {
									scoreSum += (type.score / type.total) * type.weight
									totalSum += type.weight
								}
							}

							let color = getColor((scoreSum / totalSum) * 100, theme)
							let grade = (scoreSum / totalSum) * (course.fourPoint ? 4 : 100)

							if (
								course.chartData.length > 0 &&
								course.chartData[course.chartData.length - 1].x ===
									Math.floor(date / 8.64e7)
							) {
								course.chartData[course.chartData.length - 1].y = grade
								course.chartData[course.chartData.length - 1].color = color
							} else {
								course.chartData.push({
									x: Math.floor(date / 8.64e7),
									y: grade,
									color
								})
							}
						}
						assignment.style =
							assignment.isMissing || assignment.scorePercent <= 0
								? 'color: hsl(0 72% 56%);'
								: `color: ${getColor(assignment.scorePercent, theme)};`
					}
					assignments.push(assignment)
				}

				let totalWeight = 0
				for (let type of Object.values(course.scoreTypes)) {
					if (type.total === 0) type.weight = 0
					totalWeight += type.weight
				}
				for (let type of Object.values(course.scoreTypes)) {
					type.weight = ((type.weight / totalWeight) * 100).toFixed(1)
					let percent = type.total ? type.score / type.total : 0
					type.scorePercent = (percent * type.weight).toFixed(1)
					type.color =
						type.style = `color: ${percent ? getColor(percent * 100, theme) : 0};`
				}
			}

			course.scorePercent = -1
			course.score = '-'
			course.scoreString = course.Marks.Mark ? course.Marks.Mark.CalculatedScoreString : 'N/A'
			if (course.chartData.length > 0) {
				course.scorePercent = course.chartData[course.chartData.length - 1].y
				course.score = course.scorePercent.toFixed(1)
				if (course.fourPoint) {
					course.scorePercent = fourToPercent(course.scorePercent)
				} else {
					course.score += '%'
				}
				grades.push(course.scorePercent)
				course.scoreString = percentToLetter(course.scorePercent)
			}
			course.color = getColor(course.scorePercent, theme)
			course.style = `color: ${course.color};`
		}

		let averageRaw = -1
		if (grades.length > 0) averageRaw = grades.reduce((a, b) => a + b) / grades.length

		period.averageStyle = `color: ${getColor(averageRaw, theme)};`
		period.average = averageRaw >= 0 ? averageRaw.toFixed(1) + '%' : '-'
		const endDate = period.ReportingPeriod?.EndDate
		period.days = endDate ? Math.round((new Date(endDate) - new Date()) / 86400000) : 0

		assignments.sort((a, b) => new Date(b.DueDate) - new Date(a.DueDate))
		period.assignments = assignments
		period.week = getWeek(period.assignments, theme)
	}
}

function getWeek(assignments, theme) {
	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const lastSunday = new Date(today.setDate(today.getDate() - today.getDay()))
	let week = assignments.filter((a) => new Date(a.DueDate) > lastSunday && a.scorePercent >= 0)
	let average = -1
	if (week.length > 0)
		average = (week.reduce((a, b) => a + b.scorePercent, 0) / week.length).toFixed(1)
	return {
		average: average >= 0 ? average + '%' : '-',
		averageStyle: `color: ${getColor(average, theme)};`,
		length: week.length
	}
}
