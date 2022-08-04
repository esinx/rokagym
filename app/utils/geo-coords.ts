type Coordinates = {
	longitude: number
	latitude: number
}

export const coordinatesToKM = (coordinates: Coordinates): number =>
	Math.sqrt(
		(coordinates.longitude * 110.574) ** 2 +
			111.32 * Math.cos(coordinates.longitude),
	)

// thank you https://www.movable-type.co.uk/scripts/latlong.html
export const coordinateDistances = (
	coord1: Coordinates,
	coord2: Coordinates,
) => {
	const R = 6371e3 // metres
	const phi1 = (coord1.latitude * Math.PI) / 180 // phi, lambda in radians
	const phi2 = (coord2.latitude * Math.PI) / 180
	const deltaphi = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
	const deltalambda = ((coord2.longitude - coord1.longitude) * Math.PI) / 180
	const a =
		Math.sin(deltaphi / 2) * Math.sin(deltaphi / 2) +
		Math.cos(phi1) *
			Math.cos(phi2) *
			Math.sin(deltalambda / 2) *
			Math.sin(deltalambda / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	const d = R * c // in metres
	return d / 1000
}
