import { DateTime } from 'luxon'

const getKoreanAgeFromBirthday = (date: Date | string) =>
	Math.floor(
		-1 *
			(typeof date === 'string'
				? DateTime.fromISO(date)
				: DateTime.fromJSDate(date)
			)
				.diffNow()
				.as('years') +
			1,
	)

export default getKoreanAgeFromBirthday
