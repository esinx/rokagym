export const tint = (color: string, percent: number): string => {
	return color
}

const RED = {
	300: '#FF3D5D',
}

const GREEN = {
	300: '#41C8BF',
}

const ALERT = { neg: '#FF3D5D', pos: '#41C8BF' }
const GRAY = {
	50: '#F8F7F9',
	100: '#EDEDF0',
	150: '#DEDDE3',
	200: '#CECDD6',
	300: '#B4B3BE',
	400: '#9C9BA5',
	600: '#777581',
	800: '#414046',
	900: '#282828',
}

const BRAND = {
	100: '#80acff',
	200: '#337aff',
	300: '#0059ff',
	400: '#0047cc',
	500: '#003599',
	'300-main': '#0059ff',
	main: '#0059ff',
}

const COLOR = {
	ALERT: (label: keyof typeof ALERT): string => ALERT[label],
	GRAY: (label: keyof typeof GRAY): string => GRAY[label],
	BRAND: (label: keyof typeof BRAND): string => BRAND[label],
	RED: (label: keyof typeof RED): string => RED[label],
	GREEN: (label: keyof typeof GREEN): string => GREEN[label],
}

export default COLOR
