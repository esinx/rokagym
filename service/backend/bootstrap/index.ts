import { PrismaClient, WorkoutType } from '@prisma/client'

const main = async () => {
	const prisma = new PrismaClient()
	{
		// create core workout data
		const res = await prisma.workoutType.findMany({
			where: {
				id: {
					in: ['2m-pushup', '2m-situp', '3km-run'],
				},
			},
		})
		const items: WorkoutType[] = []
		if (!res.some((o) => o.id === '2m-pushup')) {
			items.push({
				id: '2m-pushup',
				name: '팔굽혀펴기',
				detailedName: '팔굽혀펴기(2분)',
				goalDirection: 'MORE',
				tags: ['ASSESSED', 'CORE'],
				unit: 'COUNT',
			})
		}
		if (!res.some((o) => o.id === '2m-situp')) {
			items.push({
				id: '2m-situp',
				name: '윗몸일으키기',
				detailedName: '윗몸일으키기(2분)',
				goalDirection: 'MORE',
				tags: ['ASSESSED', 'CORE'],
				unit: 'COUNT',
			})
		}
		if (!res.some((o) => o.id === '3km-run')) {
			items.push({
				id: '3km-run',
				name: '뜀걸음',
				detailedName: '뜀걸음(3km)',
				goalDirection: 'LESS',
				tags: ['ASSESSED', 'CORE'],
				unit: 'TIME',
			})
		}
		if (items.length > 0) {
			console.log(`[bootstrap] creating default workout types...`)
			await prisma.workoutType.createMany({
				data: items,
			})
		}
	}
	{
		// create daily workout data
		const res = await prisma.workoutType.findMany({
			where: {
				id: {
					in: ['pushup', 'situp', 'run'],
				},
			},
		})
		const items: WorkoutType[] = []
		if (!res.some((o) => o.id === 'pushup')) {
			items.push({
				id: 'pushup',
				name: '팔굽혀펴기',
				detailedName: '팔굽혀펴기',
				goalDirection: 'MORE',
				tags: ['CORE'],
				unit: 'COUNT',
			})
		}
		if (!res.some((o) => o.id === 'situp')) {
			items.push({
				id: 'situp',
				name: '윗몸일으키기',
				detailedName: '윗몸일으키기',
				goalDirection: 'MORE',
				tags: ['CORE'],
				unit: 'COUNT',
			})
		}
		if (!res.some((o) => o.id === 'run')) {
			items.push({
				id: 'run',
				name: '뜀걸음',
				detailedName: '뜀걸음',
				goalDirection: 'MORE',
				tags: ['CORE'],
				unit: 'DISTANCE',
			})
		}

		if (!res.some((o) => o.id === 'squat')) {
			items.push({
				id: 'squat',
				name: '스쿼트',
				detailedName: '스쿼트',
				goalDirection: 'MORE',
				tags: ['WEIGHT', 'CUSTOM'],
				unit: 'RM',
			})
		}

		if (!res.some((o) => o.id === 'legpress')) {
			items.push({
				id: 'legpress',
				name: '레그프레스',
				detailedName: '레그프레스',
				goalDirection: 'MORE',
				tags: ['WEIGHT', 'CUSTOM'],
				unit: 'RM',
			})
		}

		if (!res.some((o) => o.id === 'deadlift')) {
			items.push({
				id: 'deadlift',
				name: '데드리프트',
				detailedName: '데드리프트',
				goalDirection: 'MORE',
				tags: ['WEIGHT', 'CUSTOM'],
				unit: 'RM',
			})
		}
		if (items.length > 0) {
			console.log(`[bootstrap] creating default workout types...`)
			await prisma.workoutType.createMany({
				data: items,
			})
		}
	}
	prisma.$disconnect()
}

main()
