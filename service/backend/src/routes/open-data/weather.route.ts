import { URLSearchParams } from 'url'

import { DateTime } from 'luxon'
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
		const params = {
			serviceKey: process.env.GOV_OPEN_DATA_API_KEY!,
			pageNo: String(0),
			numOfRows: String(1000),
			dataType: 'JSON',
			['base_date']: DateTime.fromJSDate(baseDate).toFormat('yyyyMMdd'),
			['base_time']: DateTime.fromJSDate(baseDate).toFormat('HHmm'),
			nx: String(nx),
			ny: String(ny),
		}
		const query = new URLSearchParams(params)
		return {
			url: `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?${query.toString()}`,
		}
	},
	parseResult: (res) => res.response.body.items.item,
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

const weatherForecastRoute = createRouter().query('getWeatherForecast', {
	input: z.object({
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
	}),
	resolve: async ({ input: { baseDate, coordinates, categories } }) => {
		const items = await fetchOpenData(weatherForecastAPI, {
			baseDate,
			...coordinates,
		})
		return items.reduce(
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
	},
})

const weatherUVIndexDataRoute = createRouter().query('getUVIndexData', {
	input: z.void(),
	resolve: async () => fetchOpenData(weatherUVIndexAPI),
})

const weatherRoute = createRouter()
	.merge(weatherForecastRoute)
	.merge(weatherUVIndexDataRoute)

export default weatherRoute
