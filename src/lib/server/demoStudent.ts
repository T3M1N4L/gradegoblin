const DEMO_DISTRICT_URL = 'https://hogwarts.studentvue.demo/'
const DEMO_ZIP = '99999'
const DEMO_USERNAME = 'harrypotter'
const DEMO_PASSWORD = 'harryharry'

const REPORTING_PERIODS = [
	{
		GradePeriod: 'Quarter 1',
		StartDate: '2025-08-25T00:00:00',
		EndDate: '2025-10-24T00:00:00'
	},
	{
		GradePeriod: 'Quarter 2',
		StartDate: '2025-10-27T00:00:00',
		EndDate: '2025-12-19T00:00:00'
	},
	{
		GradePeriod: 'Quarter 3',
		StartDate: '2026-01-06T00:00:00',
		EndDate: '2026-03-13T00:00:00'
	},
	{
		GradePeriod: 'Quarter 4',
		StartDate: '2026-03-23T00:00:00',
		EndDate: '2026-05-29T00:00:00'
	}
]

const STUDENT = {
	FormattedName: 'Harry Potter',
	PermID: 'HP-1991-001',
	Grade: '11',
	Gender: 'M',
	BirthDate: '1980-07-31',
	CurrentSchool: 'Hogwarts School of Witchcraft and Wizardry',
	Photo: '',
	Address: {
		CurrentSchool: 'Hogwarts School of Witchcraft and Wizardry',
		City: 'Highlands',
		State: 'Scotland',
		Zip: DEMO_ZIP,
		EMail: 'harry.potter@hogwarts.edu'
	}
}

const COURSE_BLUEPRINTS = [
	{
		period: 1,
		courseId: 'DADA-301',
		title: 'Defense Against the Dark Arts',
		room: 'Tower 3B',
		staff: 'Professor Remus Lupin',
		email: 'r.lupin@hogwarts.edu',
		assignments: [
			['Reductor curse entrance ticket', 'Homework', '04/14/2026', '10 / 10', ''],
			['Werewolf recognition checkpoint', 'Assessment', '04/13/2026', '24 / 25', ''],
			['Kappa defense sketchbook', 'Homework', '04/12/2026', '10 / 10', ''],
			['Boggart wardrobe practicum', 'Lab', '04/09/2026', '19 / 20', 'Strong focus under pressure.'],
			['Pixie containment drill', 'Lab', '04/08/2026', '18 / 20', ''],
			['Red Cap identification notes', 'Homework', '04/03/2026', '10 / 10', ''],
			['Patronus theory quiz', 'Assessment', '03/28/2026', '47 / 50', ''],
			['Grindylow response write-up', 'Homework', '03/25/2026', '18 / 20', ''],
			['Counter-jinx flash cards', 'Homework', '03/20/2026', '9 / 10', ''],
			['Hinkypunk route map', 'Lab', '03/18/2026', '19 / 20', '']
		]
	},
	{
		period: 2,
		courseId: 'POT-245',
		title: 'Potions',
		room: 'Dungeon 5',
		staff: 'Professor Severus Snape',
		email: 's.snape@hogwarts.edu',
		assignments: [
			['Infusion timing warm-up', 'Homework', '04/14/2026', '10 / 10', ''],
			['Dreamless Sleep formula quiz', 'Assessment', '04/12/2026', '23 / 25', ''],
			['Fluxweed preparation check', 'Lab', '04/10/2026', '18 / 20', ''],
			['Draught of Peace brew log', 'Lab', '04/08/2026', '18 / 20', 'Avoided over-stirring.'],
			['Wolfsbane ingredient quiz', 'Assessment', '04/01/2026', '42 / 50', ''],
			['Shrinking Solution notebook check', 'Homework', '03/27/2026', '10 / 10', ''],
			['Antidote precision practical', 'Lab', '03/24/2026', '17 / 20', ''],
			['Fire protection essay', 'Essay', '03/21/2026', '18 / 20', ''],
			['Powdered moonstone lab setup', 'Homework', '03/18/2026', '9 / 10', '']
		]
	},
	{
		period: 3,
		courseId: 'TRN-210',
		title: 'Transfiguration',
		room: 'North Tower 2',
		staff: 'Professor Minerva McGonagall',
		email: 'm.mcgonagall@hogwarts.edu',
		assignments: [
			['Matchstick refinement drill', 'Lab', '04/14/2026', '20 / 20', ''],
			['Human transfiguration ethics response', 'Essay', '04/13/2026', '19 / 20', ''],
			['Cross-species switching quiz', 'Assessment', '04/11/2026', '24 / 25', ''],
			['Beetle to button transfiguration', 'Lab', '04/10/2026', '20 / 20', 'Excellent wand control.'],
			['Switching spell checkpoint', 'Assessment', '04/02/2026', '48 / 50', ''],
			['Vanishing cabinet reflection', 'Homework', '03/29/2026', '10 / 10', ''],
			['Porcupine pin cushion drill', 'Lab', '03/26/2026', '19 / 20', ''],
			['Needle reversal quick check', 'Homework', '03/20/2026', '10 / 10', ''],
			['Desk-to-pig demonstration', 'Lab', '03/17/2026', '18 / 20', '']
		]
	},
	{
		period: 4,
		courseId: 'CHM-275',
		title: 'Charms',
		room: 'West Wing 4',
		staff: 'Professor Filius Flitwick',
		email: 'f.flitwick@hogwarts.edu',
		assignments: [
			['Levitation target practice', 'Lab', '04/14/2026', '20 / 20', ''],
			['Nonverbal charm checkpoint', 'Assessment', '04/12/2026', '24 / 25', ''],
			['Feather focus journal', 'Homework', '04/10/2026', '10 / 10', ''],
			['Shield charm partner drill', 'Lab', '04/11/2026', '20 / 20', ''],
			['Summoning charm accuracy test', 'Assessment', '04/04/2026', '49 / 50', ''],
			['Cheering charm response post', 'Homework', '03/31/2026', '9 / 10', ''],
			['Banishing charm warm-up', 'Lab', '03/22/2026', '18 / 20', ''],
			['Silencing charm worksheet', 'Homework', '03/18/2026', '10 / 10', ''],
			['Protego timing drill', 'Lab', '03/16/2026', '19 / 20', '']
		]
	},
	{
		period: 5,
		courseId: 'HER-110',
		title: 'Herbology',
		room: 'Greenhouse 3',
		staff: 'Professor Pomona Sprout',
		email: 'p.sprout@hogwarts.edu',
		assignments: [
			['Snargaluff pod extraction', 'Lab', '04/14/2026', '19 / 20', ''],
			['Devil’s Snare care notes', 'Homework', '04/12/2026', '10 / 10', ''],
			['Mimbulus mimbeltonia quiz', 'Assessment', '04/09/2026', '24 / 25', ''],
			['Mandrake repotting practical', 'Lab', '04/07/2026', '19 / 20', 'Used earmuffs correctly.'],
			['Gillyweed care journal', 'Homework', '04/01/2026', '10 / 10', ''],
			['Venomous Tentacula safety quiz', 'Assessment', '03/30/2026', '45 / 50', ''],
			['Bubotuber salve lab', 'Lab', '03/24/2026', '18 / 20', ''],
			['Dirigible plum observation', 'Homework', '03/20/2026', '9 / 10', ''],
			['Flutterby bush pruning', 'Lab', '03/17/2026', '18 / 20', '']
		]
	},
	{
		period: 6,
		courseId: 'HOM-150',
		title: 'History of Magic',
		room: 'Archive Hall',
		staff: 'Professor Cuthbert Binns',
		email: 'c.binns@hogwarts.edu',
		assignments: [
			['Triwizard governance response', 'Essay', '04/14/2026', '18 / 20', ''],
			['Ministry timeline quick check', 'Homework', '04/11/2026', '10 / 10', ''],
			['Wand legislation quiz', 'Assessment', '04/08/2026', '22 / 25', ''],
			['Goblin Rebellions essay', 'Essay', '04/05/2026', '46 / 50', ''],
			['Founders timeline check', 'Homework', '03/31/2026', '10 / 10', ''],
			['Wizengamot reforms quiz', 'Assessment', '03/28/2026', '43 / 50', ''],
			['International Confederation notes', 'Homework', '03/21/2026', '9 / 10', ''],
			['Giant treaty summary', 'Homework', '03/18/2026', '9 / 10', ''],
			['Hogsmeade charter analysis', 'Essay', '03/16/2026', '17 / 20', '']
		]
	}
]

function createAssignment(blueprint: any, courseTitle: string, index: number) {
	const [measure, type, dueDate, points, notes] = blueprint
	return {
		GradebookID: `${courseTitle}-${index + 1}`.replace(/\s+/g, '-').toLowerCase(),
		Measure: measure,
		Type: type,
		DueDate: dueDate,
		Points: points,
		Notes: notes
	}
}

function createCourse(blueprint: any, periodIndex: number) {
	const assignments = blueprint.assignments.map((assignment: any, index: number) =>
		createAssignment(assignment, blueprint.title, index)
	)
	const totalEarned = assignments.reduce((sum: number, assignment: any) => {
		const [earned] = assignment.Points.split(' / ')
		return sum + Number(earned)
	}, 0)
	const totalPossible = assignments.reduce((sum: number, assignment: any) => {
		const [, possible] = assignment.Points.split(' / ')
		return sum + Number(possible)
	}, 0)
	const percent = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0

	return {
		Period: String(blueprint.period),
		CourseID: blueprint.courseId,
		Title: blueprint.title,
		Room: blueprint.room,
		Staff: blueprint.staff,
		StaffEMail: blueprint.email,
		Marks: {
			Mark: {
				CalculatedScoreString: `${percent.toFixed(1)}%`,
				Assignments: {
					Assignment: assignments
				},
				GradeCalculationSummary: {
					AssignmentGradeCalc: [
						{ Type: 'Homework', Weight: '20' },
						{ Type: 'Lab', Weight: '40' },
						{ Type: 'Assessment', Weight: '30' },
						{ Type: 'Essay', Weight: '10' }
					]
				}
			}
		},
		ReportingPeriod: REPORTING_PERIODS[periodIndex]
	}
}

const GRADEBOOKS = REPORTING_PERIODS.map((period, periodIndex) => ({
	ReportingPeriod: period,
	ReportingPeriods: {
		ReportPeriod: REPORTING_PERIODS
	},
	Courses: {
		Course: COURSE_BLUEPRINTS.map((course) => createCourse(course, periodIndex))
	}
}))

const ATTENDANCE = {
	Absences: {
		Absence: [
			{
				AbsenceDate: '04/10/2026',
				Reason: 'Activity - Gryffindor Quidditch final',
				Note: 'Approved afternoon release for house match.',
				DailyIconName: 'Activity',
				Periods: {
					Period: [
						{
							Number: '4',
							Name: 'Charms',
							Course: 'Charms',
							Staff: 'Professor Filius Flitwick',
							Reason: 'Approved athletics travel',
							IconName: 'Activity'
						},
						{
							Number: '5',
							Name: 'Herbology',
							Course: 'Herbology',
							Staff: 'Professor Pomona Sprout',
							Reason: 'Approved athletics travel',
							IconName: 'Activity'
						}
					]
				}
			},
			{
				AbsenceDate: '04/02/2026',
				Reason: 'Excused - Quidditch travel',
				Note: 'Away match versus Durmstrang Academy.',
				DailyIconName: 'Activity',
				Periods: {
					Period: [
						{
							Number: '5',
							Name: 'Herbology',
							Course: 'Herbology',
							Staff: 'Professor Pomona Sprout',
							Reason: 'Approved athletics travel',
							IconName: 'Activity'
						}
					]
				}
			},
			{
				AbsenceDate: '03/18/2026',
				Reason: 'Excused - Hospital wing visit',
				Note: 'Cleared by Madam Pomfrey.',
				DailyIconName: 'Excused',
				Periods: {
					Period: [
						{
							Number: '2',
							Name: 'Potions',
							Course: 'Potions',
							Staff: 'Professor Severus Snape',
							Reason: 'Medical',
							IconName: 'Excused'
						},
						{
							Number: '3',
							Name: 'Transfiguration',
							Course: 'Transfiguration',
							Staff: 'Professor Minerva McGonagall',
							Reason: 'Medical',
							IconName: 'Excused'
						},
						{
							Number: '6',
							Name: 'History of Magic',
							Course: 'History of Magic',
							Staff: 'Professor Cuthbert Binns',
							Reason: 'Medical',
							IconName: 'Excused'
						}
					]
				}
			},
			{
				AbsenceDate: '03/11/2026',
				Reason: 'Tardy - Floo network delay',
				Note: 'Arrived after breakfast service.',
				DailyIconName: 'Tardy',
				Periods: {
					Period: [
						{
							Number: '1',
							Name: 'Defense Against the Dark Arts',
							Course: 'Defense Against the Dark Arts',
							Staff: 'Professor Remus Lupin',
							Reason: 'Tardy',
							IconName: 'Tardy'
						},
						{
							Number: '2',
							Name: 'Potions',
							Course: 'Potions',
							Staff: 'Professor Severus Snape',
							Reason: 'Tardy',
							IconName: 'Tardy'
						}
					]
				}
			},
			{
				AbsenceDate: '02/24/2026',
				Reason: 'Unexcused - Late from Hogsmeade',
				Note: 'Marked after curfew return.',
				DailyIconName: 'Unexcused',
				Periods: {
					Period: [
						{
							Number: '6',
							Name: 'History of Magic',
							Course: 'History of Magic',
							Staff: 'Professor Cuthbert Binns',
							Reason: 'Unexcused absence',
							IconName: 'Unexcused'
						}
					]
				}
			},
			{
				AbsenceDate: '02/12/2026',
				Reason: 'Excused - Auror meeting',
				Note: 'Career counseling appointment.',
				DailyIconName: 'Excused',
				Periods: {
					Period: [
						{
							Number: '1',
							Name: 'Defense Against the Dark Arts',
							Course: 'Defense Against the Dark Arts',
							Staff: 'Professor Remus Lupin',
							Reason: 'Guidance',
							IconName: 'Excused'
						},
						{
							Number: '4',
							Name: 'Charms',
							Course: 'Charms',
							Staff: 'Professor Filius Flitwick',
							Reason: 'Guidance',
							IconName: 'Excused'
						}
					]
				}
			},
			{
				AbsenceDate: '01/30/2026',
				Reason: 'Activity - Prefect duties',
				Note: 'Late arrival after tower inspection.',
				DailyIconName: 'Activity',
				Periods: {
					Period: [
						{
							Number: '3',
							Name: 'Transfiguration',
							Course: 'Transfiguration',
							Staff: 'Professor Minerva McGonagall',
							Reason: 'House duty',
							IconName: 'Activity'
						},
						{
							Number: '5',
							Name: 'Herbology',
							Course: 'Herbology',
							Staff: 'Professor Pomona Sprout',
							Reason: 'House duty',
							IconName: 'Activity'
						}
					]
				}
			}
		]
	}
}

const SCHOOL_INFO = {
	StudentSchoolInfoListing: {
		School: 'Hogwarts School of Witchcraft and Wizardry',
		Principal: 'Professor Albus Dumbledore',
		PrincipalEmail: 'headmaster@hogwarts.edu',
		Phone: '+44 20 7946 0991',
		Phone2: '+44 20 7946 0992',
		URL: 'https://hogwarts.edu',
		SchoolAddress: 'Hogwarts Castle',
		SchoolAddress2: 'Black Lake Road',
		SchoolCity: 'Highlands',
		SchoolState: 'Scotland',
		SchoolZip: DEMO_ZIP,
		StaffLists: {
			StaffList: [
				{ Name: 'Professor Minerva McGonagall', Title: 'Deputy Headmistress', EMail: 'm.mcgonagall@hogwarts.edu', Phone: '+44 20 7946 1101', Extn: '201' },
				{ Name: 'Professor Severus Snape', Title: 'Potions Master', EMail: 's.snape@hogwarts.edu', Phone: '+44 20 7946 1102', Extn: '202' },
				{ Name: 'Professor Remus Lupin', Title: 'Defense Against the Dark Arts', EMail: 'r.lupin@hogwarts.edu', Phone: '+44 20 7946 1103', Extn: '203' },
				{ Name: 'Professor Filius Flitwick', Title: 'Charms Master', EMail: 'f.flitwick@hogwarts.edu', Phone: '+44 20 7946 1104', Extn: '204' },
				{ Name: 'Professor Pomona Sprout', Title: 'Herbology Master', EMail: 'p.sprout@hogwarts.edu', Phone: '+44 20 7946 1105', Extn: '205' }
			]
		}
	}
}

const DOCUMENTS = {
	StudentDocumentDatas: {
		StudentDocumentData: [
			{
				_DocumentComment: 'O.W.L. practice schedule',
				_DocumentDate: '04/01/2026',
				_DocumentFileName: 'owl-practice-schedule.pdf',
				_DocumentGU: '',
				_DocumentType: 'Schedule'
			},
			{
				_DocumentComment: 'Quidditch eligibility letter',
				_DocumentDate: '03/22/2026',
				_DocumentFileName: 'quidditch-eligibility.pdf',
				_DocumentGU: '',
				_DocumentType: 'Notice'
			}
		]
	}
}

const TESTS = {
	analysis: {
		availableTests: [
			{
				Name: 'O.W.L. Preparation Benchmark',
				GridColumns: ['Subject', 'AdminDate', 'Percent', 'PerformanceLevel'],
				GridData: [
					{
						Subject: 'Defense Against the Dark Arts',
						AdminDate: '2026-04-08T00:00:00',
						Percent: '96',
						PerformanceLevel: 'Outstanding'
					},
					{
						Subject: 'Transfiguration',
						AdminDate: '2026-04-08T00:00:00',
						Percent: '94',
						PerformanceLevel: 'Outstanding'
					},
					{
						Subject: 'Potions',
						AdminDate: '2026-04-08T00:00:00',
						Percent: '87',
						PerformanceLevel: 'Exceeds Expectations'
					}
				]
			}
		]
	}
}

export function getDemoDistrict(zip: string) {
	if (String(zip).trim() !== DEMO_ZIP) return null

	return {
		name: 'Hogwarts School of Witchcraft and Wizardry',
		url: DEMO_DISTRICT_URL.replace(/\/$/, ''),
		address: 'Hogwarts Castle, Highlands, Scotland 99999',
		zipcode: DEMO_ZIP
	}
}

export function isDemoDistrictUrl(url: string) {
	return String(url).trim().replace(/\/$/, '') === DEMO_DISTRICT_URL.replace(/\/$/, '')
}

export function isDemoLogin(districtUrl: string, username: string, password: string) {
	return (
		isDemoDistrictUrl(districtUrl) &&
		String(username).trim().toLowerCase() === DEMO_USERNAME &&
		String(password) === DEMO_PASSWORD
	)
}

export function getDemoDashboardSnapshot() {
	return {
		student: STUDENT,
		periods: GRADEBOOKS,
		currentPeriod: 2,
		totalPeriods: REPORTING_PERIODS.length,
		periodDates: REPORTING_PERIODS
	}
}

export function getDemoClient() {
	return {
		getStudentInfo: async () => STUDENT,
		getGradebook: async (period = 0) => GRADEBOOKS[period] ?? GRADEBOOKS[0],
		getAttendance: async () => ATTENDANCE,
		getSchoolInfo: async () => SCHOOL_INFO,
		getDocuments: async () => DOCUMENTS,
		getDocument: async () => ({}),
		getMail: async () => ({ Messages: [] }),
		getAttachment: async () => ({}),
		getTests: async () => TESTS
	}
}
