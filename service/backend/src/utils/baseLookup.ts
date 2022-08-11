import got from 'got'
import { z } from 'zod'

type RawResponse = {
	normalUnitList: {
		normalUnitCd: string
		unitNm: string
		grpCd: string
	}[]
}

const zInputType = z.object({
	group: z.enum([
		'ARMY',
		'NAVY',
		'AIR_FORCE',
		'MARINE_CORPS',
		'MINISTRY_OF_DEFENSE',
	]),
	query: z.string().min(1),
})

const groupMap = {
	ARMY: '0000010001',
	NAVY: '0000010002',
	AIR_FORCE: '0000010003',
	MARINE_CORPS: '0000010004',
	MINISTRY_OF_DEFENSE: '0000010005',
	UNKNOWN: '0000',
}

const baseLookup = async (
	input: z.infer<typeof zInputType>,
): Promise<{ id: string; name: string; group: keyof typeof groupMap }[]> => {
	const groupCode = groupMap[input.group]
	const data = await got(
		'https://www.thecamp.or.kr/join/selectSearchNormalUnitListA.do',
		{
			headers: {
				'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
			},
			body: `grpCd=${groupCode}&normalUnitCd=&unitNm=&searchNm=${input.query}`,
			method: 'POST',
		},
	).json<RawResponse>()
	return data.normalUnitList
		.map(({ grpCd, normalUnitCd, unitNm }) => ({
			id: normalUnitCd,
			name: unitNm,
			group:
				(Object.entries(groupMap).find(
					([_, code]) => grpCd === code,
				)?.[0] as keyof typeof groupMap) ?? 'UNKNOWN',
		}))
		.sort((a, b) => {
			if (a.group === input.group && b.group !== input.group) {
				return -1
			} else if (a.group !== input.group && b.group === input.group) {
				return 1
			}
			return 0
		})
}

export default baseLookup
