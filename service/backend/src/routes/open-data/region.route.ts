import path from 'path'

import { TRPCError } from '@trpc/server'

import * as csv from '@fast-csv/parse'
import { z } from 'zod'

import createRouter from '@/utils/routers/createRouter'

const readCSV = (file: string) =>
	new Promise<string[][]>((resolve, reject) => {
		const chunks: string[][] = []
		csv
			.parseFile(file, {
				delimiter: ',',
			})
			.on('error', (error) => reject(error))
			.on('data', (row) => chunks.push(row))
			.on('end', () => resolve(chunks))
	})
const findRowCSV = (file: string, find: (row: string[]) => boolean) =>
	new Promise<string[]>((resolve, reject) => {
		csv
			.parseFile(file, {
				delimiter: ',',
			})
			.on('error', (error) => reject(error))
			.on('data', (row) => {
				if (find(row)) {
					resolve(row)
				}
			})
			.on('end', () => {
				reject()
			})
	})

const rowToObject = ([code, nx, ny, level1, level2, level3]: string[]) => ({
	code,
	nx,
	ny,
	level1,
	level2,
	level3,
})

const regionRoutes = createRouter()
	.query('getRegionCodes', {
		input: z.array(z.string()),
		resolve: async ({ input }) => {
			const [level1, level2, level3] = input
			const filePath = path.resolve(
				process.env.REGION_CODE_COORDINATES_PATH,
				level3 || level2
					? path.join(level1, `${level2}.csv`)
					: level1
					? path.join(level1, 'index.csv')
					: 'index.csv',
			)
			if (level3) {
				//find
				const found = await findRowCSV(filePath, (row) =>
					row.some((c) => c === level3),
				)
				if (!found)
					throw new TRPCError({
						message: 'Region is not found',
						code: 'NOT_FOUND',
					})
				return rowToObject(found)
			}
			const content = await readCSV(filePath)
			if (level2) {
				return content.map((x) => rowToObject(x))
			}
			if (!level1 || !level2) {
				return content.flatMap((x) => x)
			}
			return content
		},
	})
	.query('getRegionCodesLevel0', {
		input: z.undefined(),
		resolve: async () => {
			const filePath = path.resolve(
				process.env.REGION_CODE_COORDINATES_PATH,
				'index.csv',
			)
			const content = await readCSV(filePath)
			return content.flatMap((x) => x)
		},
	})
	.query('getRegionCodesLevel1', {
		input: z.string().or(z.tuple([z.string()])),
		resolve: async ({ input }) => {
			const level1 = typeof input === 'string' ? input : input[0]
			const filePath = path.resolve(
				process.env.REGION_CODE_COORDINATES_PATH,
				path.join(level1, 'index.csv'),
			)
			const content = await readCSV(filePath)
			return content.flatMap((x) => x)
		},
	})
	.query('getRegionCodesLevel2', {
		input: z.tuple([z.string(), z.string()]),
		resolve: async ({ input }) => {
			const [level1, level2] = input
			const filePath = path.resolve(
				process.env.REGION_CODE_COORDINATES_PATH,
				path.join(level1, `${level2}.csv`),
			)
			const content = await readCSV(filePath)
			return content.map((x) => rowToObject(x))
		},
	})
	.query('getRegionCodesLevel3', {
		input: z.tuple([z.string(), z.string(), z.string()]),
		resolve: async ({ input }) => {
			const [level1, level2, level3] = input
			const filePath = path.resolve(
				process.env.REGION_CODE_COORDINATES_PATH,
				path.join(level1, `${level2}.csv`),
			)
			if (level3) {
				//find
				const found = await findRowCSV(filePath, (row) =>
					row.some((c) => c === level3),
				)
				if (!found)
					throw new TRPCError({
						message: 'Region is not found',
						code: 'NOT_FOUND',
					})
				return rowToObject(found)
			}
		},
	})

export default regionRoutes
