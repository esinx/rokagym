import { z } from 'zod'

import fetchOpenData, { OpenDataAPI } from '@/utils/fetchOpenData'
import createRouter from '@/utils/routers/createRouter'

const TestType = z.enum(['2m-pushup', '2m-curlup', '3km-run', 'unknown'])
type TestType = z.infer<typeof TestType>
const getTestType = (input: string): TestType => {
	switch (true) {
		case input.includes('팔굽혀펴기'):
			return TestType.enum['2m-pushup']
		case input.includes('윗몸일으키기'):
			return TestType.enum['2m-curlup']
		case input.includes('3Km달리기'):
			return TestType.enum['3km-run']
	}
	return TestType.enum.unknown
}

const GradeType = z.enum(['특급', '1급', '2급', '3급', '무급', '-급'])
type GradeType = z.infer<typeof GradeType>
const getGradeType = (input: string): GradeType => {
	switch (true) {
		case input.includes('특급'):
			return GradeType.Enum['특급']
		case input.includes('1급'):
			return GradeType.Enum['1급']
		case input.includes('2급'):
			return GradeType.Enum['2급']
		case input.includes('3급'):
			return GradeType.Enum['3급']
		case input.includes('불합격'):
			return GradeType.Enum['무급']
	}
	return GradeType.Enum['-급']
}

const fitnessTestDataOutput = z.array(
	z.object({
		sex: z.string(),
		type: TestType,
		grade: GradeType,
		ageRange: z.tuple([z.number(), z.number()]),
		range: z.tuple([z.string(), z.string()]),
	}),
)

const fitnessTestDataAPI: OpenDataAPI<
	void,
	z.infer<typeof fitnessTestDataOutput>,
	{
		DS_MND_MILPRSN_PHSTR_OFAPRV: {
			list_total_count: number
			row: [
				{
					sex: string
					dvs: string
					rowno: string
					std_uprlmtprcdc: string
					std_lwlmtprcdc: string
					age_uprlmtprcdc: string
					grd: string
					age_lwlmtprcdc: string
					kind: string
				},
			]
		}
	}
> = {
	buildRequest: () => {
		const params = {
			key: process.env.MND_OPEN_DATA_API_KEY,
			type: 'json',
			service: 'DS_MND_MILPRSN_PHSTR_OFAPRV',
			start_index: 0,
			end_index: 233,
		}
		return {
			url: `https://openapi.mnd.go.kr/${params.key}/${params.type}/${params.service}/${params.start_index}/${params.end_index}`,
		}
	},
	parseResult: (res) => {
		const entries = res.DS_MND_MILPRSN_PHSTR_OFAPRV.row
		return entries
			.filter((obj) => !Object.values(obj).some((k) => !k))
			.map(
				({
					sex,
					age_lwlmtprcdc,
					age_uprlmtprcdc,
					std_lwlmtprcdc,
					std_uprlmtprcdc,
					kind,
					grd,
				}) => ({
					sex,
					ageRange: [Number(age_lwlmtprcdc), Number(age_uprlmtprcdc)],
					range: [std_lwlmtprcdc, std_uprlmtprcdc],
					type: getTestType(kind),
					grade: getGradeType(grd),
				}),
			)
	},
}

const fitnessTestDataRoute = createRouter().query('getFitnessTestData', {
	input: z.void(),
	output: fitnessTestDataOutput,
	resolve: async () => fetchOpenData(fitnessTestDataAPI),
})

export default fitnessTestDataRoute
