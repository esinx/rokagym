import { z } from 'zod'

import fetchOpenData, { OpenDataAPI } from '@/utils/fetchOpenData'
import createRouter from '@/utils/routers/createRouter'

const hospitalDataOutput = z.array(
	z.object({
		address: z.string(),
		zipCode: z.string(),
		coordinates: z.object({
			longitude: z.number(),
			latitude: z.number(),
		}),
		name: z.string(),
		contact: z.string(),
	}),
)

const hospitalDataAPI: OpenDataAPI<
	void,
	z.infer<typeof hospitalDataOutput>,
	{
		DS_WHLNAT_ROKAHSPT_ADDR: {
			list_total_count: number
			row: [
				{
					hspt_addr: string
					hsptnm: string
					lngt: number
					ltd: number
					zipcd: string
					hspt_cntadr: string
				},
			]
		}
	}
> = {
	buildRequest: () => {
		const params = {
			key: process.env.MND_OPEN_DATA_API_KEY,
			type: 'json',
			service: 'DS_WHLNAT_ROKAHSPT_ADDR',
			start_index: 0,
			end_index: 20,
		}
		return {
			url: `https://openapi.mnd.go.kr/${params.key}/${params.type}/${params.service}/${params.start_index}/${params.end_index}`,
		}
	},
	parseResult: (res) => {
		const entries = res.DS_WHLNAT_ROKAHSPT_ADDR.row
		return entries.map(
			({ hspt_addr, hsptnm, lngt, ltd, zipcd, hspt_cntadr }) => ({
				address: hspt_addr,
				name: hsptnm,
				coordinates: {
					longitude: lngt,
					latitude: ltd,
				},
				zipCode: zipcd,
				contact: hspt_cntadr,
			}),
		)
	},
}

const hospitalDataRoute = createRouter().query('getHospitalData', {
	input: z.void(),
	output: hospitalDataOutput,
	resolve: async () => fetchOpenData(hospitalDataAPI),
})

export default hospitalDataRoute
