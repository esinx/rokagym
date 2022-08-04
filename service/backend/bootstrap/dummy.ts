import { createTRPCClient } from '@trpc/client'

import { DailyWorkoutGoal } from '@prisma/client'
import fetch from 'cross-fetch'

import type { AppRouter } from '@/app'
import server from '@/server'

const PORT = Number(process.env.PORT ?? 13800)

type GroupName =
	| 'AIR_FORCE'
	| 'ARMY'
	| 'NAVY'
	| 'MARINE_CORPS'
	| 'MINISTRY_OF_DEFENSE'

const main = async () => {
	console.log('Initializing...')
	let credentials: {
		[key: string]: {
			name: string
			email: string
			baseId: string
			accessToken: string
			refreshToken: string
		}
	} = {}
	await server.listen({
		port: PORT,
	})
	const client = createTRPCClient<AppRouter>({
		url: `http://localhost:${PORT}`,
		fetch,
	})

	const authorizedClient = (accessToken: string) =>
		createTRPCClient<AppRouter>({
			url: `http://localhost:${PORT}`,
			fetch,
			headers: () => {
				if (accessToken) {
					return {
						Authorization: `Bearer ${accessToken}`,
					}
				}
				return {}
			},
		})

	const findOrCreateBase = async (args: {
		inferredUnitCode: string
		name: string
		group: GroupName
	}) => {
		const { inferredUnitCode, name, group } = args
		const searchResult = await client.query('base.baseLookup', {
			group,
			query: name,
		})
		const found = searchResult.find(
			(entry) =>
				inferredUnitCode === entry.inferredUnitCode && name === entry.name,
		)
		if (!found) {
			throw new Error(
				`Could not find base with code: ${inferredUnitCode} and name: ${name}`,
			)
		}
		if (found.id) {
			return found.id
		}
		const newResult = await client.mutation('base.createBase', {
			group,
			name,
			inferredUnitCode,
		})
		return newResult.id
	}

	const findOrCreateUserAndGetToken = async (args: {
		baseId: string
		birthday: Date
		email: string
		password: string
		name: string
		rank: string
		sex: 'MALE' | 'FEMALE' | 'NONBINARY'
	}) => {
		const { baseId, birthday, email, password, name, rank, sex } = args

		try {
			const loginRes = await client.mutation('user.login', {
				email,
				password,
			})
			return loginRes
		} catch (error: any) {
			if (error.message !== 'UserNotFound') {
				throw error
			}
			const tokens = await client.mutation('user.createUser', {
				baseId,
				birthday,
				email,
				password,
				name,
				rank,
				sex,
			})
			return tokens
		}
	}

	console.log('Retrieving baseIDs...')

	const baseIdArray = await Promise.all(
		[
			{
				name: '육군본부',
				group: 'ARMY',
				inferredUnitCode: '200200200',
			},
			{
				name: '해군본부',
				group: 'NAVY',
				inferredUnitCode: '300300300',
			},
			{
				name: '공군본부',
				group: 'AIR_FORCE',
				inferredUnitCode: '400400400',
			},
			{
				name: '해병대사령부',
				group: 'MARINE_CORPS',
				inferredUnitCode: '500500500',
			},
		].map((data) =>
			findOrCreateBase(data as Parameters<typeof findOrCreateBase>[0]),
		),
	)

	const baseIdMap = {
		육군본부: baseIdArray[0],
		해군본부: baseIdArray[1],
		공군본부: baseIdArray[2],
		해병대사령부: baseIdArray[3],
	}

	console.log('Retrieving user credentials...')
	// create new users / get new tokens
	const userData: Parameters<typeof findOrCreateUserAndGetToken>[0][] = [
		{
			baseId: baseIdMap.육군본부,
			birthday: new Date('2001-01-01'),
			email: 'shines@gmail.com',
			password: 'password',
			name: '신은수',
			rank: '소위',
			sex: 'MALE',
		},
		{
			baseId: baseIdMap.육군본부,
			birthday: new Date('2001-01-01'),
			email: 'choyi@gmail.com',
			password: 'password',
			name: '조용인',
			rank: '일병',
			sex: 'MALE',
		},
		{
			baseId: baseIdMap.육군본부,
			birthday: new Date('2001-01-01'),
			email: 'leejimin@gmail.com',
			password: 'password',
			name: '이지민',
			rank: '일병',
			sex: 'MALE',
		},
		{
			baseId: baseIdMap.육군본부,
			birthday: new Date('2001-01-01'),
			email: 'leedonghyun@gmail.com',
			password: 'password',
			name: '이동현',
			rank: '일병',
			sex: 'MALE',
		},
		{
			baseId: baseIdMap.육군본부,
			birthday: new Date('2001-01-01'),
			email: 'kimjunho@gmail.com',
			password: 'password',
			name: '김준호',
			rank: '상병',
			sex: 'MALE',
		},
		{
			baseId: baseIdMap.해군본부,
			birthday: new Date('2001-01-01'),
			email: 'kangys@gmail.com',
			password: 'password',
			name: '강예성',
			rank: '이병',
			sex: 'MALE',
		},
		{
			baseId: baseIdMap.해군본부,
			birthday: new Date('2001-01-01'),
			email: 'kimjh@gmail.com',
			password: 'password',
			name: '김정훈',
			rank: '상병',
			sex: 'MALE',
		},
		{
			baseId: baseIdMap.공군본부,
			birthday: new Date('2001-01-01'),
			email: 'jungyh@gmail.com',
			password: 'password',
			name: '정윤호',
			rank: '이병',
			sex: 'MALE',
		},
		{
			baseId: baseIdMap.공군본부,
			birthday: new Date('2001-01-01'),
			email: 'yoonsh@gmail.com',
			password: 'password',
			name: '윤승혁',
			rank: '병장',
			sex: 'MALE',
		},
		{
			baseId: baseIdMap.공군본부,
			birthday: new Date('2000-01-01'),
			email: 'kimcw@gmail.com',
			password: 'password',
			name: '김찬우',
			rank: '병장',
			sex: 'MALE',
		},
		{
			baseId: baseIdMap.해병대사령부,
			birthday: new Date('2001-01-01'),
			email: 'leews@gmail.com',
			password: 'password',
			name: '이웅성',
			rank: '병장',
			sex: 'MALE',
		},
		{
			baseId: baseIdMap.해병대사령부,
			birthday: new Date('2001-01-01'),
			email: 'pyohg@gmail.com',
			password: 'password',
			name: '표혜강',
			rank: '상병',
			sex: 'MALE',
		},
	]

	const userEntries = await Promise.all(
		userData.map(async (data) => [
			data.email,
			{
				email: data.email,
				baseId: data.baseId,
				name: data.name,
				...(await findOrCreateUserAndGetToken(data)),
			},
		]),
	)

	credentials = Object.fromEntries(userEntries)

	// set daily workout goals (differs randomly)

	const possibleValues = [
		{
			pushup: 80,
			curlup: 50,
			run: 2,
		},
		{
			pushup: 100,
			curlup: 100,
			run: 2.5,
		},
		{
			pushup: 170,
			curlup: 120,
			run: 3,
		},
		{
			pushup: 200,
			curlup: 150,
			run: 5,
		},
		{
			pushup: 200,
			curlup: 100,
			run: 7,
		},
		{
			pushup: 120,
			curlup: 120,
			run: 8,
		},
	]

	const getRandomGoal = () =>
		possibleValues[Math.floor(Math.random() * possibleValues.length)]

	const currentDailyGoals: [string, DailyWorkoutGoal[]][] = await Promise.all(
		Object.entries(credentials).map(async ([email, { accessToken }]) => {
			const fetchGoals = async () =>
				authorizedClient(accessToken).query('workout.getDailyGoals', {
					workoutTypeIds: ['run', 'pushup', 'curlup'],
				})
			let dailyGoals = await fetchGoals()
			if (dailyGoals.length === 0) {
				const goal = getRandomGoal()
				await Promise.all(
					Object.entries(goal).map(
						async ([key, value]) =>
							await authorizedClient(accessToken).mutation(
								'workout.createDailyWorkoutGoal',
								{
									workoutTypeId: key,
									value,
								},
							),
					),
				)
				dailyGoals = await fetchGoals()
			}
			return [email, dailyGoals]
		}),
	)

	// console.dir(currentDailyGoals, { depth: null })

	// fulfill daily goal at range of 50% ~ 120% with certain probability
	const ranges = [
		[0.1, 0.5],
		[0.2, 0.75],
		[0.5, 0.85],
		[0.1, 1],
		[0.1, 1.2],
	]
	const getRandomRange = () => {
		const cumulative = ranges.reduce<[number, number][]>(
			(acc, cur, idx, arr) => [
				...acc,
				[(acc[idx - 1]?.[0] ?? 0) + cur[0], cur[1]],
			],
			[],
		)
		const rand = Math.random()
		const picked = cumulative.find(([prob], idx, arr) => {
			const low = idx === 0 ? 0 : arr[idx - 1][0]
			const high = prob
			return low <= rand && high >= rand
		})!
		return picked[1]
	}

	const getFulfilledAmount = (goalAmount: number) =>
		goalAmount * getRandomRange()

	const dailyWorkoutResult: [
		string,
		{ workoutTypeId: string; value: number }[],
	][] = currentDailyGoals.map(([id, goals]) => [
		id,
		goals.map(({ workoutTypeId, value }) => ({
			workoutTypeId,
			value:
				workoutTypeId === 'run'
					? getFulfilledAmount(value)
					: Math.round(getFulfilledAmount(value)),
		})),
	])

	// uncomment to make new workout data for today

	// const workoutLogRes = await Promise.all(
	// 	dailyWorkoutResult.map(async ([email, results]) => {
	// 		const _client = authorizedClient(credentials[email].accessToken)
	// 		return await Promise.all(
	// 			results.map(
	// 				async (result) =>
	// 					await _client.mutation('workout.logWorkout', {
	// 						isVerified: true,
	// 						comment:
	// 							'auto-generated random dummy data for fulfilling daily goal',
	// 						value: result.value,
	// 						workoutTypeId: result.workoutTypeId,
	// 					}),
	// 			),
	// 		)
	// 	}),
	// )

	const result = await authorizedClient(
		credentials['shines@gmail.com'].accessToken,
	).query('workout.getDailyGoalPercent', {
		workoutTypeIds: ['run', 'pushup', 'curlup'],
	})

	console.log(result)

	server.close()
}

main()
