import { useEffect, useRef, useState } from 'react'

import { timestampToSeconds } from '@/utils'
import { trpc } from '@/utils/trpc'

export const useGradeFromFitnessData = () => {
	const query = trpc.useQuery(['opendata.getUserFitnessTestData'])

	const resolveRef = useRef<(k: any) => void>()
	useEffect(() => {
		resolveRef.current?.(query.data)
	}, [query.data])

	return {
		getGradeFromFitnessData: async (workoutTypeId: string, value: number) => {
			let fitnessTestData: typeof query.data = query.data
			if (!fitnessTestData) {
				fitnessTestData = await new Promise((resolve) => {
					resolveRef.current = resolve
				})
			}
			if (!fitnessTestData) throw new Error('Could not fetch fitness data')
			return (
				fitnessTestData.find((data) => {
					if (workoutTypeId === '3km-run') {
						const [a, b] = data.range.map((r) => timestampToSeconds(r))
						return Math.min(a, b) <= value && Math.max(a, b) >= value
					}
					const [a, b] = data.range.map((r) => Number(r))
					return Math.min(a, b) <= value && Math.max(a, b) >= value
				})?.grade || '-급'
			)
		},
	}
}

const GRADES = ['특급', '1급', '2급', '3급', '무급', '-급']

export const useUserCurrentFitnessData = () => {
	const { getGradeFromFitnessData } = useGradeFromFitnessData()
	const assessmentQuery = trpc.useQuery(['workout.getMostRecentAssessment', {}])

	const [grade, setGrade] = useState('-')

	useEffect(() => {
		;(async () => {
			if (!assessmentQuery.data) return
			const run = assessmentQuery.data.find(
				(d) => d.workoutTypeId === '3km-run',
			)
			const situp = assessmentQuery.data.find(
				(d) => d.workoutTypeId === '2m-situp',
			)
			const pushup = assessmentQuery.data.find(
				(d) => d.workoutTypeId === '2m-pushup',
			)
			const grades = await Promise.all([
				run ? getGradeFromFitnessData('3km-run', run.value) : '-급',
				situp ? getGradeFromFitnessData('2m-situp', situp.value) : '-급',
				pushup ? getGradeFromFitnessData('2m-pushup', pushup.value) : '-급',
			])
			const _grade =
				GRADES[
					Math.max(
						...grades.map((k) => {
							const idx = GRADES.indexOf(k)
							return idx >= 0 ? idx : GRADES.length - 1
						}),
					)
				]
			setGrade(_grade)
		})()
	}, [getGradeFromFitnessData, assessmentQuery.data])

	return grade
}
