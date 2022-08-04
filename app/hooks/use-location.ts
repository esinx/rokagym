import * as Location from 'expo-location'
import { useCallback, useEffect, useState } from 'react'

export enum LocationStatus {
	Pending,
	Error,
	Resolved,
}

const getLocationSuspensed = () => {
	let status = LocationStatus.Pending
	let result: Location.LocationObject
	let error: Error
	const suspender = (async () => {
		const permission = await Location.requestForegroundPermissionsAsync()
		if (!permission.granted) {
			error = new Error('PermissionRejected')
			status = LocationStatus.Error
			return
		}
		result = await Location.getCurrentPositionAsync({})
		status = LocationStatus.Resolved
	})()
	return {
		read() {
			switch (status) {
				case LocationStatus.Pending:
					throw suspender
				case LocationStatus.Error:
					throw error
				case LocationStatus.Resolved:
					return result
			}
		},
	}
}

export const useLocationSuspensed = () => getLocationSuspensed().read()

export const useLocation = () => {
	const [location, setLocation] = useState<Location.LocationObject>()
	const [error, setError] = useState<Error>()
	const [status, setStatus] = useState(LocationStatus.Pending)

	const refreshLocation = useCallback(async () => {
		setStatus(LocationStatus.Pending)
		const permission = await Location.requestForegroundPermissionsAsync()
		if (!permission.granted) {
			setError(new Error('PermissionRejected'))
			setStatus(LocationStatus.Error)
			return
		}
		const lastLocation = await Location.getLastKnownPositionAsync()
		if (lastLocation) {
			setLocation(lastLocation)
		} else {
			setLocation(
				await Location.getCurrentPositionAsync({
					accuracy: 2,
				}),
			)
		}
		setStatus(LocationStatus.Resolved)
	}, [])

	useEffect(() => {
		refreshLocation()
	}, [])

	return {
		location,
		error,
		status,
		refreshLocation,
	}
}
