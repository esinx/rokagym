import fs from 'fs'

import { parseFile, writeToPath } from 'fast-csv'
type Row = {
	regionCode: string
	nx: string
	ny: string
	addressLevel1: string
	addressLevel2: string
	addressLevel3: string
	[key: string]: string
}

const prefix = `region_code_coordinates`

let streams: Record<string, Record<string, fs.WriteStream>> = {}
let master: Record<string, Record<string, string[][]>> = {}

const flush = (key1: string, key2: string) => {
	if (!streams[key1]) {
		streams[key1] = {}
		fs.mkdirSync(`./${prefix}/${key1}`)
	}
	if (!streams[key1][key2]) {
		streams[key1][key2] = fs.createWriteStream(
			`./${prefix}/${key1}/${key2 || '_'}.csv`,
		)
	}
	streams[key1][key2].write(
		master[key1][key2].map((row) => row.join(',')).join('\r\n') + '\r\n',
	)
	master[key1][key2] = []
}

const writeToMaster = (key1: string, key2: string, row: string[]) => {
	if (!master[key1]) master[key1] = {}
	if (!master[key1][key2]) master[key1][key2] = []
	master[key1][key2].push(row)
	if (master[key1][key2].length > 100) {
		flush(key1, key2)
	}
}

parseFile<Row, Row>('./region_code_coordinates.csv', {
	headers: true,
})
	.on('data', (row: Row) => {
		const { regionCode, nx, ny, addressLevel1, addressLevel2, addressLevel3 } =
			row
		writeToMaster(addressLevel1, addressLevel2, [
			regionCode,
			nx,
			ny,
			addressLevel1,
			addressLevel2,
			addressLevel3,
		])
	})
	.on('error', (error) => console.error(error))
	.on('end', (rowCount: number) => {
		console.log(`Parsed ${rowCount} rows`)
		Object.entries(master).forEach(([k1, v1]) =>
			Object.keys(v1).forEach((k2) => flush(k1, k2)),
		)
		Object.entries(master).forEach(([k1, v1]) =>
			Object.keys(v1).forEach((k2) => streams[k1][k2].end()),
		)
		Object.entries(master).forEach(([k1, v1]) =>
			Object.keys(v1).forEach((k2) => streams[k1][k2].end()),
		)
		writeToPath(
			`./${prefix}/index.csv`,
			Object.keys(master).map((r) => [r || '_']),
			{
				delimiter: ',',
				rowDelimiter: '\r\n',
			},
		)
		Object.entries(master).forEach(([k1, v1]) =>
			writeToPath(
				`./${prefix}/${k1}/index.csv`,
				Object.keys(v1).map((r) => [r || '_']),
				{
					delimiter: ',',
					rowDelimiter: '\r\n',
				},
			),
		)
	})
