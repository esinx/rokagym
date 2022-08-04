import { parseFile } from 'fast-csv'
type Row = {
	regionCode: string
	nx: string
	ny: string
	addressLevel1: string
	addressLevel2: string
	addressLevel3: string
}

parseFile<Row, Row>('./region_code_coordinates_after.csv', {
	headers: true,
})
	.on('data', (row: Row) => {})
	.on('error', (error) => console.error(error))
	.on('end', (rowCount: number) => {})
