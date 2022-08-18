export const getDiscomfortIndex = (temp: number, humidity: number) =>
	(9 / 5) * temp - 0.55 * (1 - humidity) * ((9 / 5) * temp - 26) + 32

export const getApparentTemperature = (temp: number, wind: number) =>
	13.12 +
	0.6215 * temp -
	11.37 * Math.pow(wind, 0.16) +
	0.3965 * Math.pow(wind, 0.16) * temp

export const getDiscomfortIndexComment = (idx: number) => {
	if (idx <= 68) {
		return `활동하기에 쾌적한 환경입니다.`
	}
	if (idx <= 70) {
		return `활동하기에 다소 불편한 환경입니다.`
	}
	if (idx <= 75) {
		return `활동하기에 조금 불편한 환경입니다. 무리하지 않도록 주의하세요.`
	}
	if (idx <= 80) {
		return `활동하기에 불편한 환경입니다. 건강상태에 주의하고 무리하지 않도록 주의하세요.`
	}
	return `대부분의 사람들이 불편함을 느끼는 환경입니다. 호흡 등 건강상태에 주의하고 무리하지 않도록 주의하세요.`
}

export const getApparentTemperatureComment = (temp: number) => {
	if (temp >= 40) {
		return `더위의 끝판왕입니다. 야외활동을 최대한 자제하시고 수분을 충분히 섭취하세요.`
	}
	if (temp >= 35) {
		return `사막의 무더위를 느끼실 수 있습니다. 야외활동을 최소화 하시고 만약 활동 시 자외선과 열사병에 유의하세요.`
	}
	if (temp >= 30) {
		return `매우 더운 날씨입니다. 야외활동 시 자외선과 열사병에 유의하시고 충분한 수분을 섭취하세요.`
	}
	if (temp >= 25) {
		return `조금 더운 날씨입니다. 야외활동 하시되 자외선 차단제와 수분 챙겨주시기 바랍니다.`
	}
	if (temp >= 20) {
		return `체력단련에 이보다 좋은 날이 있겠습니까! 야외활동 마음껏 즐기시되 수분 보충도 틈틈히 해주세요.`
	}
	if (temp >= 15) {
		return `운동하기 좋은 선선한 날입니다! 일교차가 있을 수 있으니 겉옷을 챙겨주시기 바랍니다. `
	}
	if (temp >= 10) {
		return `조금 쌀쌀한 날입니다. 충분히 챙겨 입으시고 감기에 유의하세요.`
	}
	if (temp >= 5) {
		return `날씨가 춥습니다. 따뜻하게 입으시고 야외활동 시 목도리와 장갑 등 착용하시길 바랍니다.`
	}
	return ``
}
