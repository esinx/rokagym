import * as SecureStore from 'expo-secure-store'
import { atom } from 'jotai'
import { Platform } from 'react-native'

// web polyfill
const getStoredValue = async (
	key: string,
): Promise<string | null | undefined> =>
	Platform.OS === 'web'
		? localStorage.getItem(key)
		: await SecureStore.getItemAsync(key)

const saveStoredValue = async (key: string, value: string): Promise<void> =>
	Platform.OS === 'web'
		? localStorage.setItem(key, value)
		: await SecureStore.setItemAsync(key, value)

export const atomWithSecoreStorage = <T>(key: string, initialValue?: T) => {
	const storeKey = `jotai-persistence-${key}`
	const baseAtom = atom(initialValue)
	baseAtom.onMount = (setValue) => {
		;(async () => {
			const item = await getStoredValue(storeKey)
			console.log({ storeKey, item })
			setValue(item ? JSON.parse(item) : null)
		})()
	}
	const derivedAtom = atom(
		(get) => get(baseAtom),
		(get, set, update) => {
			const nextValue =
				typeof update === 'function' ? update(get(baseAtom)) : update
			set(baseAtom, nextValue)
			saveStoredValue(storeKey, JSON.stringify(nextValue))
		},
	)
	return derivedAtom
}
