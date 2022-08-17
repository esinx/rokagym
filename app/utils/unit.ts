export const unitToKorean = (unit: string) => {
	switch (unit) {
		case 'COUNT':
			return '개'
		case 'DISTANCE':
			return 'KM'
	}
	return ''
}

export const workoutTypeToUnit = (id: string) => {
	switch (true) {
		case id === 'run':
			return 'KM'
		case id.includes('situp'):
		case id.includes('pushup'):
			return '개'
	}
	return ''
}
