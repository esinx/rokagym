const SPOQA = {
	NORMAL: 'SpoqaHanSansNeo',
	BOLD: 'SpoqaHanSansNeoBold',
}

const FONT = {
	SPOQA: (label: keyof typeof SPOQA): string => SPOQA[label],
}

export default FONT
