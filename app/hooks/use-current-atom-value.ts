import { Atom, useAtomValue } from 'jotai'
import { MutableRefObject, useEffect, useRef } from 'react'

type Awaited<T> = T extends Promise<infer V> ? Awaited<V> : T
const useCurrentAtomValue = <Value>(
	atom: Atom<Value>,
): MutableRefObject<Awaited<Value>> => {
	const value = useAtomValue(atom)
	const valueRef = useRef(value)

	useEffect(() => {
		valueRef.current = value
	}, [value])

	return valueRef
}

export default useCurrentAtomValue
