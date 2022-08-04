export const rangeContains = (
	range: [number, number],
	contains: number,
): boolean => range[0] < contains && range[1] > contains
