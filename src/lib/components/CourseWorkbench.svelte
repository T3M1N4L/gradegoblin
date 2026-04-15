<script>
	import { flip } from 'svelte/animate'
	import { onMount } from 'svelte'
	import Chart from 'chart.js/auto'
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down'
	import Calculator from 'lucide-svelte/icons/calculator'
	import FlaskConical from 'lucide-svelte/icons/flask-conical'
	import Plus from 'lucide-svelte/icons/plus'
	import Pin from 'lucide-svelte/icons/pin'
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw'
	import Search from 'lucide-svelte/icons/search'
	import Trash2 from 'lucide-svelte/icons/trash-2'
	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import * as Select from '$lib/components/ui/select'

	export let course

	const rawAssignments = Array.isArray(course?.Marks?.Mark?.Assignments?.Assignment)
		? course.Marks.Mark.Assignments.Assignment
		: course?.Marks?.Mark?.Assignments?.Assignment
			? [course.Marks.Mark.Assignments.Assignment]
			: []

	function readValue(source, ...keys) {
		for (const key of keys) {
			const value = source?.[key]
			if (value !== undefined && value !== null && value !== '') return value
		}
		return ''
	}

	function parseNumber(value) {
		if (value === '' || value === null || value === undefined) return null
		const parsed = Number.parseFloat(String(value))
		return Number.isFinite(parsed) ? parsed : null
	}

	function toDateValue(value) {
		const parsed = new Date(value).getTime()
		return Number.isFinite(parsed) ? parsed : 0
	}

	function formatDate(value) {
		if (!value) return '-'
		const parsed = new Date(value)
		if (Number.isNaN(parsed.getTime())) return value
		return parsed.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		})
	}

	function formatPercent(value) {
		return Number.isFinite(value) ? `${value.toFixed(1)}%` : 'N/A'
	}

	function getDeltaClass(value) {
		if (!Number.isFinite(value)) return 'font-mono font-medium text-muted-foreground'
		if (value > 0) return 'font-mono font-medium text-emerald-400'
		if (value < 0) return 'font-mono font-medium text-red-400'
		return 'font-mono font-medium text-zinc-300'
	}

	function formatPoints(value) {
		return Number.isFinite(value) ? `${Math.round(value * 10) / 10}` : ''
	}

	function roundToTenths(value) {
		return Math.round(value * 10) / 10
	}

	function getAccent(percent) {
		if (!Number.isFinite(percent)) return 'rgb(113 113 122)'
		if (percent >= 90) return 'rgb(34 197 94)'
		if (percent >= 70) return 'rgb(234 179 8)'
		return 'rgb(239 68 68)'
	}

	function withAlpha(color, alpha) {
		const match = String(color).match(/rgb\(([\d.\s]+)\)/)
		if (!match) return color
		const [r, g, b] = match[1].trim().split(/\s+/)
		return `rgba(${r}, ${g}, ${b}, ${alpha})`
	}

	function getBadgeClass(type) {
		const lower = String(type).toLowerCase()
		if (lower.includes('summative') || lower.includes('assessment')) {
			return 'border-red-300/30 bg-red-500/12 text-red-200'
		}
		if (lower.includes('instruction') || lower.includes('activity')) {
			return 'border-zinc-700 bg-zinc-950 text-zinc-100'
		}
		return 'border-border bg-background text-foreground'
	}

	function cloneAssignment(assignment, index) {
		return {
			id: readValue(assignment, 'GradebookID', '_GradebookID') || `assignment-${index}`,
			date: readValue(assignment, 'DueDate', '_DueDate', 'Date', '_Date'),
			name: readValue(assignment, 'Measure', '_Measure') || 'Assignment',
			type: readValue(assignment, 'Type', '_Type') || 'Assignment',
			notes: readValue(assignment, 'Notes', '_Notes', 'MeasureDescription', '_MeasureDescription'),
			points: parseNumber(readValue(assignment, 'points', '_Score', 'Score', '_Point')),
			total: parseNumber(readValue(assignment, 'total', '_ScoreMaxValue', '_PointPossible')),
			deleted: false,
			hypothetical: false
		}
	}

	function buildAssignments() {
		return rawAssignments.map(cloneAssignment)
	}

	function getWeightRows() {
		const raw = course?.Marks?.Mark?.GradeCalculationSummary?.AssignmentGradeCalc
		const list = Array.isArray(raw) ? raw : raw ? [raw] : []
		return list.map((item) => ({
			type: readValue(item, 'Type', '_Type') || 'Category',
			weight: parseNumber(readValue(item, 'Weight', '_Weight')) ?? 0
		}))
	}

	function activeAssignments(list = assignments) {
		return list.filter((assignment) => !assignment.deleted)
	}

	function getPercent(assignment) {
		if (!Number.isFinite(assignment.points) || !Number.isFinite(assignment.total) || assignment.total <= 0) {
			return null
		}
		return (assignment.points / assignment.total) * 100
	}

	function getScoreLabel(assignment) {
		if (!Number.isFinite(assignment.points) || !Number.isFinite(assignment.total) || assignment.total <= 0) {
			return 'Not Due'
		}
		return `${formatPoints(assignment.points)} out of ${formatPoints(assignment.total)}`
	}

	function getPointsLabel(assignment) {
		if (!Number.isFinite(assignment.total) || assignment.total <= 0) return 'N/A'
		if (!Number.isFinite(assignment.points)) return `/ ${formatPoints(assignment.total)}`
		return `${formatPoints(assignment.points)} / ${formatPoints(assignment.total)}`
	}

	function sanitizeNumberInput(event, key, assignment) {
		updateAssignment(assignment.id, key, parseNumber(event.currentTarget.value))
	}

	function distributeAcrossAssignments(totalEarned, adjustableAssignments) {
		const usableAssignments = adjustableAssignments.filter(
			(assignment) => Number.isFinite(assignment.total) && assignment.total > 0
		)
		const totalPossible = usableAssignments.reduce((sum, assignment) => sum + assignment.total, 0)
		if (!usableAssignments.length || totalPossible <= 0) return []

		let remainingEarned = Math.max(0, Math.min(totalPossible, totalEarned))
		let remainingPossible = totalPossible

		return usableAssignments.map((assignment, index) => {
			if (index === usableAssignments.length - 1) {
				return {
					id: assignment.id,
					points: roundToTenths(Math.max(0, Math.min(assignment.total, remainingEarned)))
				}
			}

			const share = remainingPossible > 0 ? (remainingEarned * assignment.total) / remainingPossible : 0
			const points = roundToTenths(Math.max(0, Math.min(assignment.total, share)))
			remainingEarned -= points
			remainingPossible -= assignment.total
			return { id: assignment.id, points }
		})
	}

	function rebalanceTargetMode(excludedId = null) {
		if (!targetMode || !hypotheticalMode) return

		const target = Math.max(0, Math.min(100, Number(targetGrade) || 0))
		const adjustableAssignments = activeAssignments(assignments).filter(
			(assignment) =>
				assignment.hypothetical &&
				assignment.id !== excludedId &&
				Number.isFinite(assignment.total) &&
				assignment.total > 0
		)
		if (!adjustableAssignments.length) return

		const fixedAssignments = activeAssignments(assignments).filter(
			(assignment) =>
				!assignment.hypothetical ||
				assignment.id === excludedId ||
				!Number.isFinite(assignment.total) ||
				assignment.total <= 0
		)

		const weights = getWeightRows()
		let pointsById = []

		if (!weights.length) {
			const fixedEarned = fixedAssignments.reduce((sum, assignment) => sum + (assignment.points ?? 0), 0)
			const fixedPossible = fixedAssignments.reduce((sum, assignment) => sum + (assignment.total ?? 0), 0)
			const adjustablePossible = adjustableAssignments.reduce((sum, assignment) => sum + assignment.total, 0)
			const requiredEarned = (target / 100) * (fixedPossible + adjustablePossible) - fixedEarned
			pointsById = distributeAcrossAssignments(requiredEarned, adjustableAssignments)
		} else {
			const categories = new Map()
			for (const weight of weights) {
				categories.set(weight.type, {
					weight: weight.weight,
					fixedEarned: 0,
					fixedPossible: 0,
					adjustableAssignments: []
				})
			}

			for (const assignment of fixedAssignments) {
				const type = assignment.type || 'Assignment'
				if (!categories.has(type)) continue
				const category = categories.get(type)
				category.fixedEarned += assignment.points ?? 0
				category.fixedPossible += assignment.total ?? 0
			}

			for (const assignment of adjustableAssignments) {
				const type = assignment.type || 'Assignment'
				if (!categories.has(type)) continue
				categories.get(type).adjustableAssignments.push(assignment)
			}

			const finalCategories = [...categories.entries()]
				.map(([type, category]) => {
					const adjustablePossible = category.adjustableAssignments.reduce(
						(sum, assignment) => sum + assignment.total,
						0
					)
					return {
						type,
						weight: category.weight,
						fixedEarned: category.fixedEarned,
						fixedPossible: category.fixedPossible,
						adjustableAssignments: category.adjustableAssignments,
						adjustablePossible,
						finalPossible: category.fixedPossible + adjustablePossible
					}
				})
				.filter((category) => category.weight > 0 && category.finalPossible > 0)

			const usedWeight = finalCategories.reduce((sum, category) => sum + category.weight, 0)
			if (usedWeight <= 0) {
				const fixedEarned = fixedAssignments.reduce((sum, assignment) => sum + (assignment.points ?? 0), 0)
				const fixedPossible = fixedAssignments.reduce((sum, assignment) => sum + (assignment.total ?? 0), 0)
				const adjustablePossible = adjustableAssignments.reduce((sum, assignment) => sum + assignment.total, 0)
				const requiredEarned = (target / 100) * (fixedPossible + adjustablePossible) - fixedEarned
				pointsById = distributeAcrossAssignments(requiredEarned, adjustableAssignments)
			} else {
				const staticContribution = finalCategories
					.filter((category) => category.adjustablePossible <= 0)
					.reduce(
						(sum, category) =>
							sum + ((category.fixedEarned / category.finalPossible) * category.weight * 100),
						0
					)

				const adjustableCategories = finalCategories.filter((category) => category.adjustablePossible > 0)
				const baseContribution = adjustableCategories.reduce(
					(sum, category) =>
						sum + ((category.fixedEarned / category.finalPossible) * category.weight * 100),
					0
				)
				const headroom = adjustableCategories.reduce((sum, category) => {
					const minimumPercent = (category.fixedEarned / category.finalPossible) * 100
					return sum + category.weight * (100 - minimumPercent)
				}, 0)

				const desiredContribution = target * usedWeight
				const ratio = headroom > 0
					? Math.max(0, Math.min(1, (desiredContribution - staticContribution - baseContribution) / headroom))
					: 0

				for (const category of adjustableCategories) {
					const minimumPercent = (category.fixedEarned / category.finalPossible) * 100
					const desiredPercent = minimumPercent + (100 - minimumPercent) * ratio
					const desiredEarned = (desiredPercent / 100) * category.finalPossible - category.fixedEarned
					pointsById.push(...distributeAcrossAssignments(desiredEarned, category.adjustableAssignments))
				}
			}
		}

		const pointMap = new Map(pointsById.map((entry) => [entry.id, entry.points]))
		assignments = assignments.map((assignment) =>
			pointMap.has(assignment.id)
				? { ...assignment, points: pointMap.get(assignment.id) }
				: assignment
		)
	}

	function calculateTotals(list = assignments) {
		const weights = getWeightRows()
		const weightMap = Object.fromEntries(weights.map((item) => [item.type, item.weight]))
		const categoryTotals = {}

		for (const assignment of activeAssignments(list)) {
			const type = assignment.type || 'Assignment'
			if (!categoryTotals[type]) {
				categoryTotals[type] = { earned: 0, possible: 0, weight: weightMap[type] ?? 0 }
			}
			if (Number.isFinite(assignment.points)) categoryTotals[type].earned += assignment.points
			if (Number.isFinite(assignment.total) && assignment.total > 0) categoryTotals[type].possible += assignment.total
		}

		for (const weight of weights) {
			if (!categoryTotals[weight.type]) {
				categoryTotals[weight.type] = { earned: 0, possible: 0, weight: weight.weight }
			}
		}

		let weightedTotal = 0
		let usedWeight = 0
		for (const category of Object.values(categoryTotals)) {
			if (category.weight > 0 && category.possible > 0) {
				weightedTotal += (category.earned / category.possible) * category.weight
				usedWeight += category.weight
			}
		}

		const percent = usedWeight > 0
			? (weightedTotal / usedWeight) * 100
			: (() => {
				const earned = Object.values(categoryTotals).reduce((sum, category) => sum + category.earned, 0)
				const possible = Object.values(categoryTotals).reduce((sum, category) => sum + category.possible, 0)
				return possible > 0 ? (earned / possible) * 100 : null
			})()

		return {
			percent,
			letter:
				!Number.isFinite(percent) ? (course?.scoreString ?? 'N/A') :
				percent >= 90 ? 'A' :
				percent >= 80 ? 'B' :
				percent >= 70 ? 'C' :
				percent >= 60 ? 'D' : 'F',
			categoryTotals
		}
	}

	function getBreakdownCards(list = assignments) {
		const totals = calculateTotals(list)
		const weights = getWeightRows()
		const rows = weights.length
			? weights.map((weight) => {
				const current = totals.categoryTotals[weight.type] ?? { earned: 0, possible: 0, weight: weight.weight }
				const percent = current.possible > 0 ? (current.earned / current.possible) * 100 : null
				return {
					name: weight.type,
					weight: `${Math.round(weight.weight)}%`,
					grade: Number.isFinite(percent) ? `${Math.round(percent)}%` : 'N/A',
					points: current.possible > 0 ? `${Math.round(current.earned * 10) / 10}/${Math.round(current.possible * 10) / 10}` : 'N/A',
					percent
				}
			})
			: Object.entries(totals.categoryTotals).map(([name, current]) => {
				const percent = current.possible > 0 ? (current.earned / current.possible) * 100 : null
				return {
					name,
					weight: 'N/A',
					grade: Number.isFinite(percent) ? `${Math.round(percent)}%` : 'N/A',
					points: current.possible > 0 ? `${Math.round(current.earned * 10) / 10}/${Math.round(current.possible * 10) / 10}` : 'N/A',
					percent
				}
			})
		return rows
	}

	function getDeltaMap(list = assignments) {
		const chronological = [...activeAssignments(list)]
			.filter((assignment) => Number.isFinite(assignment.total) && assignment.total > 0)
			.sort((a, b) => toDateValue(a.date) - toDateValue(b.date))

		const deltas = {}
		for (let index = 0; index < chronological.length; index += 1) {
			const previous = calculateTotals(chronological.slice(0, index)).percent
			const current = calculateTotals(chronological.slice(0, index + 1)).percent
			deltas[chronological[index].id] =
				Number.isFinite(previous) && Number.isFinite(current) ? current - previous : null
		}
		return deltas
	}

	function getChartPoints(list = assignments) {
		const chronological = [...activeAssignments(list)]
			.filter((assignment) => Number.isFinite(assignment.total) && assignment.total > 0)
			.sort((a, b) => toDateValue(a.date) - toDateValue(b.date))

		return chronological
			.map((assignment, index) => ({
				x: toDateValue(assignment.date),
				y: calculateTotals(chronological.slice(0, index + 1)).percent
			}))
			.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
	}

	function getNeededScoreCopy(list = assignments) {
		const hypotheticalCount = activeAssignments(list).filter((assignment) => assignment.hypothetical).length
		if (!hypotheticalMode || !hypotheticalCount) return ''

		const target = Math.max(0, Math.min(100, Number(targetGrade) || 0))
		if (!targetMode) {
			return `Target is set to ${target.toFixed(1)}%. Turn on target mode to auto-balance your hypothetical assignments toward it.`
		}

		const projected = calculateTotals(list).percent
		if (!Number.isFinite(projected)) {
			return `Target mode is on. Add possible points to your hypothetical assignments to start aiming for ${target.toFixed(1)}%.`
		}

		const gap = projected - target
		if (Math.abs(gap) < 0.15) {
			return `Target mode is on. Your hypothetical assignments are balanced to about ${projected.toFixed(1)}%, which is on target.`
		}

		return `Target mode is on. The current hypothetical mix lands around ${projected.toFixed(1)}% while aiming for ${target.toFixed(1)}%.`
	}

	function updateAssignment(id, key, value) {
		assignments = assignments.map((assignment) =>
			assignment.id === id ? { ...assignment, [key]: value } : assignment
		)
	}

	function toggleDateSort() {
		dateSortDirection = dateSortDirection === 'asc' ? 'desc' : 'asc'
	}

	function toggleHypotheticalMode() {
		hypotheticalMode = !hypotheticalMode
		if (!hypotheticalMode) targetMode = false
	}

	function toggleTargetMode() {
		targetMode = !targetMode
		if (targetMode) rebalanceTargetMode()
	}

	function addAssignment() {
		const typeOptions = assignmentTypes.length ? assignmentTypes : ['Assignment']
		assignments = [
			{
				id: `hypo-${Date.now()}`,
				date: new Date().toISOString().slice(0, 10),
				name: 'Hypothetical Assignment',
				type: typeOptions[0],
				notes: '',
				points: null,
				total: 100,
				deleted: false,
				hypothetical: true
			},
			...assignments
		]
		if (targetMode) rebalanceTargetMode()
	}

	function deleteAssignment(id) {
		assignments = assignments.map((assignment) =>
			assignment.id === id ? { ...assignment, deleted: true } : assignment
		)
		if (targetMode) rebalanceTargetMode()
	}

	function resetHypothetical() {
		assignments = buildAssignments()
		targetMode = false
	}

	let assignments = buildAssignments()
	let hypotheticalMode = false
	let targetMode = false
	let stickySummary = false
	let targetGrade = 90
	let searchTerm = ''
	let dateSortDirection = 'desc'
	let chartCanvas
	let chart
	let chartInitTimer
	const MAX_CHART_INIT_RETRIES = 6

	$: if (!hypotheticalMode) {
		assignments = buildAssignments()
	}

	$: assignmentTypes = [
		...new Set([
			...activeAssignments(assignments).map((assignment) => assignment.type),
			...getWeightRows().map((row) => row.type)
		].filter((value) => value && value !== 'TOTAL'))
	].sort()
	$: metrics = calculateTotals(assignments)
	$: breakdownCards = getBreakdownCards(assignments)
	$: deltas = getDeltaMap(assignments)
	$: filteredAssignments = activeAssignments(assignments).filter((assignment) => {
		const query = searchTerm.trim().toLowerCase()
		if (!query) return true
		return [assignment.name, assignment.type, assignment.notes, assignment.date]
			.filter(Boolean)
			.join(' ')
			.toLowerCase()
			.includes(query)
	})
	$: sortedAssignments = [...filteredAssignments].sort((a, b) =>
		dateSortDirection === 'asc'
			? toDateValue(a.date) - toDateValue(b.date)
			: toDateValue(b.date) - toDateValue(a.date)
	)
	$: chartPoints = getChartPoints(assignments)
	$: guidance = hypotheticalMode ? getNeededScoreCopy(assignments) : ''

	function syncChart() {
		if (!chart) return
		if (!chartCanvas?.getContext) return
		const chartColor = getAccent(metrics.percent)
		const gradient = chartCanvas
			.getContext('2d')
			.createLinearGradient(0, 0, 0, 320)
		gradient.addColorStop(0, withAlpha(chartColor, 0.38))
		gradient.addColorStop(1, withAlpha(chartColor, 0.04))
		chart.data.datasets[0].data = chartPoints
		chart.data.datasets[0].borderColor = chartColor
		chart.data.datasets[0].backgroundColor = gradient
		chart.options.scales.x.min = chartPoints.length ? chartPoints[0].x : undefined
		chart.options.scales.x.max = chartPoints.length ? chartPoints[chartPoints.length - 1].x : undefined
		chart.update()
	}

	function createChart(attempt = 0) {
		if (!chartCanvas?.getContext) {
			if (attempt < MAX_CHART_INIT_RETRIES) {
				chartInitTimer = window.setTimeout(() => createChart(attempt + 1), 180)
			}
			return false
		}

		try {
			const chartColor = getAccent(metrics.percent)
			const gradient = chartCanvas
				.getContext('2d')
				.createLinearGradient(0, 0, 0, 320)
			gradient.addColorStop(0, withAlpha(chartColor, 0.38))
			gradient.addColorStop(1, withAlpha(chartColor, 0.04))

			chart?.destroy()
			chart = new Chart(chartCanvas, {
				type: 'line',
				data: {
					datasets: [
						{
							label: 'Grade',
							data: chartPoints,
							borderColor: chartColor,
							backgroundColor: gradient,
							borderWidth: 2.5,
							pointRadius: 0,
							pointHoverRadius: 4,
							pointHitRadius: 18,
							tension: 0,
							fill: true
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					layout: {
						padding: {
							top: 2,
							right: 0,
							bottom: 0,
							left: 0
						}
					},
					plugins: {
						legend: { display: false },
						tooltip: {
							displayColors: false,
							backgroundColor: 'rgba(10, 10, 10, 0.96)',
							borderColor: 'rgba(255, 255, 255, 0.12)',
							borderWidth: 1,
							titleColor: '#fafafa',
							bodyColor: '#d4d4d8',
							callbacks: {
								title: (items) =>
									new Date(items[0].parsed.x).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
										year: 'numeric'
									}),
								label: (item) => `${Math.round(item.parsed.y)}%`
							}
						}
					},
					scales: {
						x: {
							type: 'linear',
							bounds: 'data',
							grid: { display: false },
							border: { display: false },
							offset: false,
							ticks: {
								color: 'rgba(255,255,255,0.72)',
								maxRotation: 0,
								padding: 4,
								callback: (value) =>
									new Date(value).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric'
									})
							}
						},
						y: {
							display: false,
							suggestedMin: 0,
							suggestedMax: 100
						}
					}
				}
			})
			return true
		} catch (error) {
			if (attempt < MAX_CHART_INIT_RETRIES) {
				chartInitTimer = window.setTimeout(() => createChart(attempt + 1), 180)
			} else {
				console.error('Grade progression chart failed to load after retries.', error)
			}
			return false
		}
	}

	onMount(() => {
		try {
			const storedSticky = localStorage.getItem('course-summary-sticky')
			if (storedSticky != null) stickySummary = storedSticky === 'true'
		} catch {}

		createChart()

		return () => {
			if (chartInitTimer) window.clearTimeout(chartInitTimer)
			chart?.destroy()
		}
	})

	$: syncChart()
	$: {
		try {
			localStorage.setItem('course-summary-sticky', String(stickySummary))
		} catch {}
	}
</script>

<div class="space-y-6">
	<section class={`${stickySummary ? 'sticky top-4 z-30' : ''} rounded-[2rem] border border-border bg-card/95 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur transition-all duration-300 hover:border-white/20`}>
		<div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
			<div class="space-y-2">
				<h1 class="text-3xl font-semibold tracking-tight">{course?.Title ?? course?._Title ?? 'Course'}</h1>
				<p class="font-mono text-sm text-muted-foreground">
					{course?.CourseID ?? course?._CourseID ?? 'Course'} &bull; Period {course?.Period ?? course?._Period ?? '-'} &bull; Room {course?.Room ?? course?._Room ?? '-'}
				</p>
					<p class="text-sm text-muted-foreground">
						{course?.Staff ?? course?._Staff ?? 'Teacher unavailable'} &bull; {course?.StaffEMail ?? course?._StaffEMail ?? 'No email'}
					</p>
					<div class="pt-1">
						<button
							type="button"
							on:click={() => (stickySummary = !stickySummary)}
							class={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
								stickySummary
									? 'border-violet-400/40 bg-violet-500/15 text-violet-200'
									: 'border-border text-muted-foreground hover:border-white/20 hover:text-white'
							}`}
						>
							<Pin class="size-3.5" />
							{stickySummary ? 'Sticky On' : 'Sticky Off'}
						</button>
					</div>
				</div>
				<div class="rounded-[1.6rem] border border-border bg-background px-6 py-5 text-right transition-transform duration-300 hover:-translate-y-0.5">
					<p class="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Current Grade</p>
					<p class="mt-3 text-6xl font-semibold tracking-tight" style={`color:${getAccent(metrics.percent)}`}>
						{metrics.letter}
					</p>
					<p class="mt-2 font-mono text-2xl font-semibold">
						{Number.isFinite(metrics.percent) ? metrics.percent.toFixed(1) : course?.score ?? 'N/A'}{Number.isFinite(metrics.percent) ? '%' : ''}
					</p>
			</div>
		</div>
	</section>

	<section class="rounded-[2rem] border border-border bg-card p-6 transition-all duration-300 hover:border-white/20">
		<div>
			<h2 class="text-xl font-semibold">Grade Progression</h2>
			<p class="mt-1 text-sm text-muted-foreground">Built from the same assignment list below, including hypothesis edits.</p>
		</div>
		<div class="mt-4 h-[210px] w-full">
			<canvas bind:this={chartCanvas}></canvas>
		</div>
		{#if chartPoints.length === 0}
			<p class="mt-4 text-sm text-muted-foreground">No graphable assignments yet.</p>
		{/if}
	</section>

	<section class="rounded-[2rem] border border-border bg-card p-6 transition-all duration-300 hover:border-white/20">
		<h2 class="text-xl font-semibold">Grade Breakdown</h2>
		<div class="mt-4 grid gap-3 lg:grid-cols-2">
			{#each breakdownCards as row}
				<div class="rounded-[1.25rem] border border-border bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20">
					<div class="flex items-start justify-between gap-3">
						<div>
							<p class="font-medium">{row.name}</p>
							<p class="mt-1 text-sm text-muted-foreground">{row.weight} weight</p>
						</div>
						<p class="font-mono font-semibold" style={`color:${getAccent(row.percent)}`}>{row.grade}</p>
					</div>
					<p class="mt-3 text-sm text-muted-foreground">{row.points}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="overflow-hidden rounded-[2rem] border border-border bg-card transition-all duration-300 hover:border-white/20">
		<div class="flex flex-col gap-4 border-b border-border/80 p-6 lg:flex-row lg:items-center lg:justify-between">
			<div>
				<h2 class="text-xl font-semibold">Assignments ({sortedAssignments.length})</h2>
				<p class="mt-1 text-sm text-muted-foreground">Search here, then edit rows inline when hypothesis mode is on.</p>
			</div>
			<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
				<div class={`flex items-center gap-3 overflow-hidden transition-all duration-300 ease-out ${hypotheticalMode ? 'max-w-[22rem] opacity-100' : 'max-w-0 opacity-0'}`}>
						<Button variant="ghost" class="rounded-full bg-white/[0.06] px-4 text-white transition-colors duration-200 hover:bg-white/[0.12]" on:click={addAssignment}>
							<Plus data-icon="inline-start" class="mr-2" />
							New Assignment
						</Button>
						<Button variant="ghost" class="rounded-full text-muted-foreground transition-colors duration-200 hover:bg-white/[0.08] hover:text-white" on:click={resetHypothetical}>
							<RotateCcw class="size-4" />
							<span class="ml-2">Reset</span>
						</Button>
				</div>
				<button
					type="button"
					on:click={toggleHypotheticalMode}
					class={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
						hypotheticalMode
							? 'border-violet-400/40 bg-violet-500/15 text-violet-200 shadow-[0_0_0_1px_rgba(167,139,250,0.12)]'
							: 'border-border text-muted-foreground hover:border-white/20 hover:bg-white/[0.04] hover:text-white'
					}`}
				>
					<FlaskConical class={`size-4 ${hypotheticalMode ? 'text-violet-300' : 'text-muted-foreground'}`} />
					<span>Hypothetical Mode</span>
				</button>
				<div class="relative min-w-[15rem]">
					<Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input bind:value={searchTerm} placeholder="Filter assignments..." class="rounded-full pl-9 transition-all duration-200 focus-visible:border-white/30" />
				</div>
				<div class={`flex flex-nowrap items-center gap-3 overflow-visible transition-all duration-300 ease-out ${hypotheticalMode ? 'max-w-[34rem] opacity-100' : 'max-w-0 opacity-0'}`}>
					<button
						type="button"
						on:click={toggleTargetMode}
						class={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
							targetMode
								? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
								: 'border-border text-muted-foreground hover:border-white/20 hover:bg-white/[0.04] hover:text-white'
						}`}
					>
						<Calculator class={`size-4 ${targetMode ? 'text-emerald-300' : 'text-muted-foreground'}`} />
						<span>Target Mode</span>
					</button>
					<button
						type="button"
						on:click={() => rebalanceTargetMode()}
						class={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
							targetMode
								? 'border-border text-muted-foreground hover:border-white/20 hover:bg-white/[0.04] hover:text-white'
								: 'pointer-events-none border-border/40 text-muted-foreground/50 opacity-60'
						}`}
					>
						<RotateCcw class="size-4" />
						<span>Rebalance Target</span>
					</button>
					<div class="flex min-w-[9.5rem] shrink-0 items-center gap-2.5 rounded-full border border-border px-3.5 py-2">
						<Calculator class="size-4 text-muted-foreground" />
						<span class="text-sm text-muted-foreground">Target</span>
						<Input
							bind:value={targetGrade}
							type="number"
							min="0"
							max="100"
							step="0.1"
							on:input={() => targetMode && rebalanceTargetMode()}
							class="h-8 w-20 rounded-full border-0 bg-transparent px-2 py-0 text-right font-mono text-sm focus-visible:ring-0"
						/>
						<span class="font-mono text-sm text-muted-foreground">%</span>
					</div>
				</div>
			</div>
		</div>

		<div class={`overflow-hidden border-b border-border/80 px-6 text-sm text-muted-foreground transition-all duration-300 ease-out ${guidance ? 'max-h-20 py-3 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
			<div class="leading-6">
				{guidance}
			</div>
		</div>

		<div class="overflow-x-auto px-6 pb-6 pt-2">
			<table class="w-full text-left text-sm">
				<thead class="text-muted-foreground">
					<tr>
						<th class="pb-3 font-medium">
							<button type="button" on:click={toggleDateSort} class="inline-flex items-center gap-2 font-medium text-muted-foreground transition-colors hover:text-foreground">
								Date
								<ArrowUpDown class="size-4" />
							</button>
						</th>
						<th class="w-[32%] pb-3 font-medium">Assignment</th>
						<th class="w-[20%] pb-3 font-medium">Type</th>
						<th class="w-[12%] pb-3 font-medium">Percentage</th>
						<th class="w-[22%] pb-3 font-medium">Points</th>
						{#if !hypotheticalMode}
							<th class="pb-3 font-medium">Notes</th>
						{/if}
						{#if hypotheticalMode}
							<th class="pb-3 font-medium">Delta</th>
							<th class="pb-3 text-right font-medium">Action</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#if sortedAssignments.length === 0}
						<tr>
							<td class="py-10 text-center text-sm text-muted-foreground" colspan={hypotheticalMode ? 7 : 6}>
								No assignments match this filter.
							</td>
						</tr>
					{:else}
						{#each sortedAssignments as assignment (assignment.id)}
							<tr animate:flip={{ duration: 220 }} class={`transition-colors duration-200 ${assignment.hypothetical ? 'shadow-[inset_0_0_0_9999px_rgba(255,255,255,0.03)]' : ''}`}>
								<td class={`font-mono text-muted-foreground ${hypotheticalMode ? 'whitespace-nowrap py-5 pr-4' : 'py-4'}`}>{formatDate(assignment.date)}</td>
								<td class={hypotheticalMode ? 'py-5 pr-4' : 'py-4'}>
									{#if hypotheticalMode}
										<Input
											value={assignment.name}
											on:input={(event) => updateAssignment(assignment.id, 'name', event.currentTarget.value)}
											class="h-11 w-full rounded-xl border-border bg-background px-4"
										/>
									{:else}
										<div class="font-medium leading-snug">{assignment.name}</div>
									{/if}
								</td>
								<td class={hypotheticalMode ? 'py-5 pr-4' : 'py-4'}>
									{#if hypotheticalMode}
										<Select.Root
											selected={{ value: assignment.type, label: assignment.type }}
											onSelectedChange={(selected) => {
												updateAssignment(assignment.id, 'type', selected?.value ?? assignment.type)
												targetMode && rebalanceTargetMode(assignment.id)
											}}
										>
											<Select.Trigger class="h-11 min-w-[12.5rem] rounded-xl border-border bg-background px-4 text-sm">
												<Select.Value placeholder="Select type" />
											</Select.Trigger>
											<Select.Content class="rounded-xl border-border bg-card">
												<Select.Group>
													{#each assignmentTypes.length ? assignmentTypes : ['Assignment'] as type}
														<Select.Item value={type} label={type}>{type}</Select.Item>
													{/each}
												</Select.Group>
											</Select.Content>
										</Select.Root>
									{:else}
										<span class={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getBadgeClass(assignment.type)}`}>
											{assignment.type}
										</span>
									{/if}
								</td>
								<td class={`align-middle ${hypotheticalMode ? 'py-5 pr-4' : 'py-4'}`}>
									{#if Number.isFinite(getPercent(assignment))}
										<span class="font-mono font-medium" style={`color:${getAccent(getPercent(assignment))}`}>{formatPercent(getPercent(assignment))}</span>
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</td>
								<td class={hypotheticalMode ? 'py-5 pr-4' : 'py-4'}>
									{#if hypotheticalMode}
										<div class="flex items-center gap-3">
											<Input
												value={Number.isFinite(assignment.points) ? assignment.points : ''}
												on:input={(event) => {
													sanitizeNumberInput(event, 'points', assignment)
													targetMode && rebalanceTargetMode(assignment.id)
												}}
												type="number"
												step="any"
												class="h-11 w-28 rounded-xl border-border bg-background px-4 text-right font-mono"
											/>
											<span class="text-muted-foreground">/</span>
											<Input
												value={Number.isFinite(assignment.total) ? assignment.total : ''}
												on:input={(event) => {
													sanitizeNumberInput(event, 'total', assignment)
													targetMode && rebalanceTargetMode(assignment.id)
												}}
												type="number"
												step="any"
												class="h-11 w-28 rounded-xl border-border bg-background px-4 text-right font-mono"
											/>
										</div>
									{:else}
										<span class="font-mono">{getPointsLabel(assignment)}</span>
									{/if}
								</td>
									{#if !hypotheticalMode}
										<td class="py-4 text-muted-foreground">
											<span>{assignment.notes || '-'}</span>
										</td>
									{/if}
								{#if hypotheticalMode}
									<td class="py-5 pr-4">
										{#if Number.isFinite(deltas[assignment.id])}
											<span class={getDeltaClass(deltas[assignment.id])}>
												{deltas[assignment.id] > 0 ? '+' : ''}{deltas[assignment.id].toFixed(1)}%
											</span>
										{:else}
											<span class={getDeltaClass(null)}>-</span>
										{/if}
									</td>
									<td class="py-5 text-right">
										<Button variant="outline" size="icon" class="rounded-full border-border bg-background text-muted-foreground transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.04] hover:text-white" on:click={() => deleteAssignment(assignment.id)} aria-label="Delete assignment">
											<Trash2 class="size-4" />
										</Button>
									</td>
								{/if}
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</section>
</div>
