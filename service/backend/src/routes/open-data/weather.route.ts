import { URLSearchParams } from 'url'

import { DateTime, Duration } from 'luxon'
import { z } from 'zod'

import fetchOpenData, { OpenDataAPI } from '@/utils/fetchOpenData'
import createRouter from '@/utils/routers/createRouter'
import dateSchema from '@/utils/zod-date-schema'

enum WeatherUnit {
	CELCIUS = '°C',
	PERCENT = '%',
	MM = 'mm',
	CM = 'cm',
	METERS_PER_SECOND = 'm/s',
	DEG = '°',
	ETC = '',
}

const CATEGORY_MAP = {
	POP: ['강수확률', WeatherUnit.PERCENT],
	PTY: ['강수형태', WeatherUnit.ETC], // 4 => 소나기
	PCP: ['1시간 강수량', WeatherUnit.MM],
	REH: ['습도', WeatherUnit.PERCENT],
	SNO: ['1시간 신적설', WeatherUnit.CM],
	SKY: ['하늘상태', WeatherUnit.ETC],
	TMP: ['1시간 기온', WeatherUnit.CELCIUS],
	TMN: ['일 최저기온', WeatherUnit.CELCIUS],
	TMX: ['일 최고기온', WeatherUnit.CELCIUS],
	VEC: ['풍향', WeatherUnit.DEG],
	WSD: ['풍속', WeatherUnit.METERS_PER_SECOND],
} as const

const CATEGORIES = [
	'POP',
	'PTY',
	'PCP',
	'REH',
	'SNO',
	'SKY',
	'TMP',
	'TMN',
	'TMX',
	'VEC',
	'WSD',
]

type RawWeatherResponse = {
	response: {
		header: {
			resultMsg: 'NO_DATA'
		}
		body: {
			items: {
				item: {
					baseDate: string
					baseTime: string
					category: keyof typeof CATEGORY_MAP
					fcstDate: string
					fcstTime: string
					fcstValue: string
					nx: number
					ny: number
				}[]
			}
			pageNo: number
			numOfRows: number
			totalCount: number
		}
	}
}

const BASE_TIMES = [
	'0200',
	'0500',
	'0800',
	'1100',
	'1400',
	'1700',
	'2000',
	'2300',
]

const getBaseDateTime = (date: Date) => {
	const timeString = DateTime.fromJSDate(date)
		.setZone('Asia/Seoul')
		.toFormat('HHmm')
	let baseDate: string | undefined = undefined
	let baseTime: string | undefined = undefined
	let i = 0
	while (!baseDate || !baseTime) {
		if (i == 0) {
			if (Number(timeString) < Number(BASE_TIMES[0])) {
				// yesterday
				baseDate = DateTime.fromJSDate(date)
					.setZone('Asia/Seoul')
					.startOf('day')
					.minus(Duration.fromObject({ day: 1 }))
					.startOf('day')
					.toFormat('yyyyMMdd')
				baseTime = '2300'
			}
		} else {
			if (
				i == BASE_TIMES.length ||
				(Number(timeString) < Number(BASE_TIMES[i]) &&
					Number(timeString) >= Number(BASE_TIMES[i - 1]))
			) {
				// today
				baseDate = DateTime.fromJSDate(date)
					.setZone('Asia/Seoul')
					.startOf('day')
					.toFormat('yyyyMMdd')
				baseTime = BASE_TIMES[i - 1]
			}
		}
		i++
	}
	return { baseDate, baseTime }
}

const weatherForecastAPI: OpenDataAPI<
	{
		baseDate: Date
		nx: string | number
		ny: string | number
	},
	RawWeatherResponse['response']['body']['items']['item'],
	RawWeatherResponse
> = {
	buildRequest: ({ baseDate, nx, ny }) => {
		const {
			baseDate: formattedDate = DateTime.fromJSDate(baseDate)
				.setZone('Asia/Seoul')
				.startOf('day')
				.toFormat('yyyyMMdd'),
			baseTime: formattedTime = '0200',
		} = getBaseDateTime(baseDate)
		const params = {
			serviceKey: process.env.GOV_OPEN_DATA_API_KEY!,
			pageNo: String(0),
			numOfRows: String(1000),
			dataType: 'JSON',
			['base_date']: formattedDate,
			['base_time']: formattedTime,
			nx: String(nx),
			ny: String(ny),
		}
		const query = new URLSearchParams(params)
		return {
			url: `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?${query.toString()}`,
		}
	},
	parseResult: (res) => res.response.body?.items?.item ?? [],
}

const weatherUVIndexAPI: OpenDataAPI<void, unknown> = {
	buildRequest: () => {
		const params = {
			serviceKey: process.env.GOV_OPEN_DATA_API_KEY!,
			pageNo: String(0),
			numOfRows: String(10),
			dataType: 'JSON',
			areaNo: '1100000000',
			time: DateTime.now().toFormat('yyyyMMdd'),
		}
		const query = new URLSearchParams(params)
		return {
			url: `https://apis.data.go.kr/1360000/LivingWthrIdxServiceV2/getUVIdxV2?${query.toString()}`,
		}
	},
	parseResult: (res) => {
		return res
	},
}

const zWeatherDataInput = z.object({
	baseDate: dateSchema,
	coordinates: z.object({
		nx: z.union([z.string(), z.number()]),
		ny: z.union([z.string(), z.number()]),
	}),
	categories: z.array(
		z.enum([
			'POP',
			'PTY',
			'PCP',
			'REH',
			'SNO',
			'SKY',
			'TMP',
			'TMN',
			'TMX',
			'VEC',
			'WSD',
		]),
	),
})

export const getWeatherData = async ({
	baseDate,
	categories,
	coordinates,
}: z.infer<typeof zWeatherDataInput>) => {
	const items = await fetchOpenData(weatherForecastAPI, {
		baseDate,
		...coordinates,
	})
	const todayKST = DateTime.now().setZone('Asia/Seoul').toFormat('yyyyMMdd')
	const todayOnly = items.filter((item) => item.fcstDate === todayKST)
	console.log(items.length, todayOnly.length)
	return todayOnly.reduce(
		(acc, cur) => {
			const key = cur.category
			if (!categories.some((k) => k === key)) return acc
			const previousValue = acc[cur.category] ?? []
			return {
				...acc,
				[key]: [
					...previousValue,
					{
						value: cur.fcstValue,
						time: DateTime.fromFormat(
							cur.fcstDate + cur.fcstTime,
							'yyyyMMddHHmm',
						).toJSDate(),
						unit: CATEGORY_MAP[key][1],
					},
				],
			}
		},
		{} as Record<
			typeof categories[number],
			{
				value: string
				time: Date
				unit: string
			}[]
		>,
	)
}

const weatherForecastRoute = createRouter().query('getWeatherForecast', {
	input: zWeatherDataInput,
	resolve: async ({ input }) => await getWeatherData(input),
})

const weatherUVIndexDataRoute = createRouter().query('getUVIndexData', {
	input: z.void(),
	resolve: async () => fetchOpenData(weatherUVIndexAPI),
})

const weatherRoute = createRouter()
	.merge(weatherForecastRoute)
	.merge(weatherUVIndexDataRoute)

export default weatherRoute
