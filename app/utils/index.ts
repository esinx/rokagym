export const padtwo = (num: Number) =>
	String(num).length >= 2 ? String(num) : '0' + num

export const timestampToSeconds = (str: string) => {
	const [minutes, seconds] = str.split(':').map((n) => Number(n))
	return minutes * 60 + seconds
}

export const secondsToTimestamp = (time: number, withDecimal?: boolean) =>
	`${padtwo(Math.floor(time / 60))}:${padtwo(Math.floor(time % 60))}` +
	(withDecimal ? `.${padtwo(Math.floor((time * 100) % 100))}` : '')
