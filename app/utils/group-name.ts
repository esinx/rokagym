const MAP = {
	ARMY: ['대한민국 육군 ROKA', '육군'],
	NAVY: ['대한민국 해군 ROKN', '해군'],
	AIR_FORCE: ['대한민국 공군 ROKAF', '공군'],
	MARINE_CORPS: ['대한민국 해병대 ROKMC', '해병대'],
	MINISTRY_OF_DEFENSE: ['대한민국 국방부', '국방부'],
} as const
const getGroupNameFromCode = (
	code: keyof typeof MAP,
	simple?: boolean,
): string => MAP[code][simple ? 1 : 0]
export default getGroupNameFromCode
