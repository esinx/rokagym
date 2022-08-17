export const getDiscomfortIndex = (temp: number, humidity: number) =>
	(9 / 5) * temp - 0.55 * (1 - humidity) * ((9 / 5) * temp - 26) + 32

export const getApparentTemperature = (temp: number, wind: number) =>
	13.12 +
	0.6215 * temp -
	11.37 * Math.pow(wind, 0.16) +
	0.3965 * Math.pow(wind, 0.16) * temp

export const getDiscomfortIndexComment = (idx: number) => {
	return '야외활동 시 자외선과 열사병에 유의하세요. 수분을 충분히 섭취하고 30분 활동 후에는 시원한 곳에서 휴식을 취해요.'
}

export const getApparentTemperatureComment = (idx: number) => {
	return '야외활동 시 자외선과 열사병에 유의하세요. 수분을 충분히 섭취하고 30분 활동 후에는 시원한 곳에서 휴식을 취해요.'
}
