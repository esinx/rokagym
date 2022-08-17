export const USE_FAST_FONT = false
const SPOQA = {
	NORMAL: USE_FAST_FONT ? 'HelveticaNeue' : 'SpoqaHanSansNeo',
	BOLD: USE_FAST_FONT ? 'HelveticaNeue-Bold' : 'SpoqaHanSansNeoBold',
}

const FONT = {
	ROKA: USE_FAST_FONT ? 'HelveticaNeue-CondensedBlack' : 'ROKA',
	SPOQA: (label: keyof typeof SPOQA): string => SPOQA[label],
}

export default FONT
