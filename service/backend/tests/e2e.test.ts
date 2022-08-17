import { createTRPCClient, TRPCClient } from '@trpc/client'

import { PrismaClient } from '@prisma/client'
import fetch from 'cross-fetch'

import type { AppRouter } from '@/app'
import server from '@/server'
const PORT = Number(process.env.PORT ?? 13800)

let client: TRPCClient<AppRouter>
let prisma: PrismaClient

let credentials: {
	accessToken?: string
	refreshToken?: string
} = {}

beforeAll(() => {
	server.listen({
		port: PORT,
	})
	client = createTRPCClient({
		url: `http://localhost:${PORT}`,
		fetch,
		headers: () => {
			if (credentials?.accessToken) {
				return {
					Authorization: `Bearer ${credentials.accessToken}`,
				}
			}
			return {}
		},
	})
	prisma = new PrismaClient()
})

afterAll(() => {
	server.close()
	prisma.$disconnect()
})

describe('ranking', () => {
	test('ranking.getRanking', async () => {
		const res = await client.query('ranking.getRanking', {
			id: 'ALL.pushup.daily',
		})
		expect(res).toHaveProperty('createdAt')
		expect(res).toHaveProperty('id')
		expect(res).toHaveProperty('data')
		expect(res.data.length).toBeGreaterThan(0)
	})
})

describe('open data APIs', () => {
	test('opendata.getFitnessTestData', async () => {
		const res = await client.query('opendata.getFitnessTestData')
		expect(res.length).toBeGreaterThan(1)
		expect(res[0]).toHaveProperty('type')
		expect(res[0]).toHaveProperty('sex')
		expect(res[0]).toHaveProperty('grade')
		expect(res[0]).toHaveProperty('range')
		expect(res[0]).toHaveProperty('ageRange')
	})

	test('opendata.getHospitalData', async () => {
		const res = await client.query('opendata.getHospitalData')
		expect(res.length).toBeGreaterThan(1)
		expect(res[0]).toHaveProperty('address')
		expect(res[0]).toHaveProperty('zipCode')
		expect(res[0]).toHaveProperty('coordinates')
		expect(res[0]).toHaveProperty('name')
		expect(res[0]).toHaveProperty('contact')
	})
	test('opendata.weather.getWeatherForecast', async () => {
		const res = await client.query('opendata.weather.getWeatherForecast', {
			baseDate: new Date(),
			coordinates: {
				nx: 90,
				ny: 90,
			},
			categories: ['TMP', 'POP', 'REH'],
		})
		expect(res).toHaveProperty('TMP')
		expect(res).toHaveProperty('POP')
		expect(res).toHaveProperty('REH')
	})
})

test('opendata.baseLookup', async () => {
	const res = await client.query('opendata.baseLookup', {
		group: 'ARMY',
		query: '근무지원단',
	})
	expect(res).toBeDefined()
	expect(res.some((k) => k.name === '2작전사근무지원단')).toBeTruthy()
})

test('base.createBase', async () => {
	//  find from base
	const opendataRes = await client.query('opendata.baseLookup', {
		group: 'ARMY',
		query: '근무지원단',
	})
	const found = opendataRes.find((k) => k.name === '2작전사근무지원단')
	expect(found).toBeTruthy()
	const res = await client.mutation('base.createBase', {
		group: 'ARMY',
		name: found!.name,
		inferredUnitCode: found!.id,
	})
	expect(res).toBeTruthy()
	// cleanup
	await prisma.base.delete({
		where: {
			id: res.id,
		},
	})
})

test('base.baseLookup', async () => {
	const res = await client.query('base.baseLookup', {
		group: 'ARMY',
		query: '근무지원단',
	})
	expect(res).toBeDefined()
	expect(res.some((k) => k.name === '2작전사근무지원단')).toBeTruthy()
})

describe('user creation and login', () => {
	let baseId: string, userEmail: string
	let didCreateNewBase = false
	test('user.createUser', async () => {
		// find base
		const baseLookupResult = await client.query('base.baseLookup', {
			group: 'ARMY',
			query: '근무지원단',
		})
		const base = baseLookupResult.find((k) => k.name === '2작전사근무지원단')
		if (base?.id) {
			baseId = base.id
		} else if (base) {
			const newBase = await client.mutation('base.createBase', {
				group: 'ARMY',
				name: base.name,
				inferredUnitCode: base.id,
			})
			baseId = newBase.id
			didCreateNewBase = true
		} else {
			throw new Error('근무지원단이 없습니다!')
		}
		const createUserRes = await client.mutation('user.createUser', {
			name: '김윤수',
			rank: '상병',
			birthday: new Date('2001-03-01'),
			email: 'kimyoonsoo@esinx.net',
			password: 'password',
			sex: 'MALE',
			baseId,
		})
		expect(createUserRes).toBeTruthy()
		userEmail = 'kimyoonsoo@esinx.net'
	})

	test('user.login', async () => {
		const loginRes = await client.mutation('user.login', {
			email: 'kimyoonsoo@esinx.net',
			password: 'password',
		})

		expect(loginRes.refreshToken).toBeTruthy()
		expect(loginRes.accessToken).toBeTruthy()
		credentials = {
			...loginRes,
		}
	})

	test('user.getAccessToken', async () => {
		if (!credentials.refreshToken)
			throw new Error('Failed to retrieve token from cache')
		const accessTokenRes = await client.mutation('user.getAccessToken', {
			refreshToken: credentials.refreshToken,
		})
		expect(accessTokenRes.accessToken).toBeTruthy()
		credentials = {
			...credentials,
			...accessTokenRes,
		}
	})

	test('user.profile', async () => {
		if (!credentials.accessToken)
			throw new Error('Failed to retrieve token from cache')
		const profileRes = await client.query('user.profile')
		expect(profileRes.email).toEqual(userEmail)
	})
	test('user.invalidateRefreshToken', async () => {
		const invalidateRes = await client.mutation('user.invalidateRefreshToken')
		expect(invalidateRes).toBeTruthy()
	})

	// cleanup
	afterAll(async () => {
		await prisma.user.delete({
			where: {
				email: userEmail,
			},
		})
		if (didCreateNewBase) {
			await prisma.base.delete({
				where: {
					id: baseId,
				},
			})
		}
	})
})

test('getMeal', async () => {
	const res = await client.query('meal.getDailyMeal', {
		baseCode: '6335',
	})
	expect(res).toHaveProperty('breakfast')
	expect(res).toHaveProperty('lunch')
	expect(res).toHaveProperty('dinner')
	console.log(
		`[e2e] getMeal({baseCode: '6335'}) => ${JSON.stringify(res, null, 2)}`,
	)
})
