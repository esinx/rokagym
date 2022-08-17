import { InferQueryOutput } from '@/utils/trpc'

export type ArrayElement<T> = T extends (infer E)[] ? E : never

export type WorkoutType = ArrayElement<
	InferQueryOutput<'workout.getCoreWorkouts'>
>
