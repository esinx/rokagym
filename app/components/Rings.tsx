import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect } from 'react'
import { useRef } from 'react'
import { Animated, Easing, Platform } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
const polarToCartesian = (
	centerX: number,
	centerY: number,
	radius: number,
	angleInDegrees: number,
) => {
	const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
	return {
		x: centerX + radius * Math.cos(angleInRadians),
		y: centerY + radius * Math.sin(angleInRadians),
	}
}

const drawArc = (
	x: number,
	y: number,
	radius: number,
	startAngle: number,
	endAngle: number,
) => {
	startAngle %= 360
	endAngle %= 360
	const start = polarToCartesian(x, y, radius, endAngle)
	const end = polarToCartesian(x, y, radius, startAngle)
	const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
	return [
		'M',
		start.x,
		start.y,
		'A',
		radius,
		radius,
		0,
		largeArcFlag,
		0,
		end.x,
		end.y,
	].join(' ')
}

const drawRadialChevron = (
	x: number,
	y: number,
	radius: number,
	angle: number,
	length: number,
) => {
	const pointOfIntersection = polarToCartesian(x, y, radius, angle)
	const radians = ((angle - 90) * Math.PI) / 180.0
	const COS_T = Math.sin(radians)
	const SIN_T = Math.cos(radians)
	// fyi: I had to rewatch MATH114 videos to do this.
	const POINTS = [
		[
			length * Math.SQRT1_2 * (COS_T + SIN_T) + pointOfIntersection.x,
			length * Math.SQRT1_2 * (COS_T - SIN_T) + pointOfIntersection.y,
		],
		[
			length * Math.SQRT1_2 * (COS_T - SIN_T) + pointOfIntersection.x,
			length * Math.SQRT1_2 * -1 * (COS_T + SIN_T) + pointOfIntersection.y,
		],
	]
	return [
		'M',
		...POINTS[0],
		'L',
		pointOfIntersection.x,
		pointOfIntersection.y,
		'L',
		...POINTS[1],
	].join(' ')
}

const Rings: React.FC<{
	ringValues: number[]
	size?: number
	ringColors?: [string, string][]
	ringWidth?: number
}> = ({
	ringValues,
	ringColors = [
		['rgb(255, 95, 95)', 'rgb(255, 204, 204)'],
		['rgb(255, 200, 95)', 'rgb(255, 238, 204)'],
		['rgb(95, 101, 255)', 'rgb(204, 206, 255)'],
	],
	size = 300,
	ringWidth = size / 10,
}) => {
	const RADIUS = size / 2
	const radiusAtIndex = (idx: number) =>
		size / 2 - ringWidth / 2 - idx * ringWidth
	const pathAnimation = useRef(new Animated.Value(0)).current
	const pathRefs = useRef<
		Record<`${'ring' | 'chevron' | 'circle'}-${number}`, any>
	>({})

	useFocusEffect(
		useCallback(() => {
			Animated.timing(pathAnimation, {
				toValue: 1,
				duration: 1300,
				useNativeDriver: true,
				easing: Easing.elastic(0.1),
			}).start()
			// cleanup!
			return () => {
				pathAnimation.setValue(0)
			}
		}, []),
	)

	useEffect(() => {
		pathAnimation.addListener(({ value }) => {
			if (Platform.OS !== 'web') {
				ringValues.forEach((ringValue, idx) => {
					pathRefs.current[`circle-${idx}`]?.setNativeProps({
						stroke: ringColors[idx][ringValue * value > 1 ? 0 : 1],
					})
					pathRefs.current[`ring-${idx}`]?.setNativeProps({
						d: drawArc(
							RADIUS,
							RADIUS,
							radiusAtIndex(idx),
							0,
							Math.min(360 * ringValue * value, 359),
						),
					})
					pathRefs.current[`chevron-${idx}`]?.setNativeProps({
						d: drawRadialChevron(
							RADIUS,
							RADIUS,
							radiusAtIndex(idx),
							360 * ringValue * value,
							Math.max(5, ringWidth / 10),
						),
					})
				})
			}
		})
	}, [pathAnimation])

	if (Platform.OS === 'web') {
		// skip animation in web
		return (
			<Svg width={size} height={size}>
				{ringColors.map(([foreground, background], idx) => (
					<Circle
						key={idx}
						id={`ring-${idx}-bg`}
						cx={RADIUS}
						cy={RADIUS}
						r={radiusAtIndex(idx)}
						stroke={ringValues[idx] >= 1 ? foreground : background}
						strokeWidth={ringWidth}
						fill="none"
					/>
				))}
				{ringColors.map(([foreground], idx) => (
					<Path
						key={idx}
						d={drawArc(
							RADIUS,
							RADIUS,
							radiusAtIndex(idx),
							0,
							ringValues[idx] * 360,
						)}
						stroke={foreground}
						strokeWidth={ringWidth}
						strokeLinejoin="round"
						strokeLinecap="round"
						fill="none"
					/>
				))}
				{ringColors.map((_, idx) => (
					<Path
						key={idx}
						d={drawRadialChevron(
							RADIUS,
							RADIUS,
							radiusAtIndex(idx),
							ringValues[idx] * 360,
							Math.max(5, ringWidth / 10),
						)}
						stroke="#FFF"
						strokeWidth={3}
						strokeLinecap="round"
						strokeLinejoin="round"
						fill="none"
					/>
				))}
			</Svg>
		)
	}
	return (
		<Svg width={size} height={size}>
			{ringColors.map(([, background], idx) => (
				<Circle
					key={idx}
					ref={(ref) => ref && (pathRefs.current[`circle-${idx}`] = ref)}
					id={`ring-${idx}-bg`}
					cx={RADIUS}
					cy={RADIUS}
					r={radiusAtIndex(idx)}
					stroke={background}
					strokeWidth={ringWidth}
					fill="none"
				/>
			))}
			{ringColors.map(([foreground], idx) => (
				<Path
					key={idx}
					ref={(ref) => ref && (pathRefs.current[`ring-${idx}`] = ref)}
					d={drawArc(RADIUS, RADIUS, radiusAtIndex(idx), 0, 0)}
					stroke={foreground}
					strokeWidth={ringWidth}
					strokeLinejoin="round"
					strokeLinecap="round"
					fill="none"
				/>
			))}
			{ringColors.map((_, idx) => (
				<Path
					key={idx}
					ref={(ref) => ref && (pathRefs.current[`chevron-${idx}`] = ref)}
					d={drawRadialChevron(
						RADIUS,
						RADIUS,
						radiusAtIndex(idx),
						10,
						Math.max(5, ringWidth / 10),
					)}
					stroke="#FFF"
					strokeWidth={3}
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
			))}
		</Svg>
	)
}

export default Rings
