import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DateTime } from 'luxon'
import { BASE_CODES, MealData } from 'rokameal'

export const getMealData = async (
	baseCode: typeof BASE_CODES[number],
	date: Date,
): Promise<MealData> => {
	const id = `${baseCode}-${DateTime.fromJSDate(date).toFormat('yyyy-MM-dd')}`

	// create DynamoDB connection, write data
	const dynamoDBClient = new DynamoDBClient({
		region: process.env.AWS_ROKAGYM_MEAL_REGION ?? 'ap-northeast-2',
	})
	const documentClient = DynamoDBDocument.from(dynamoDBClient)

	const res = await documentClient.get({
		Key: {
			id,
		},
		TableName: process.env.AWS_ROKAGYM_MEAL_TABLE_NAME,
	})

	return res.Item as MealData
}

export const getAllMealData = async (date: Date): Promise<MealData[]> => {
	const codes = BASE_CODES.map(
		(code) => `${code}-${DateTime.fromJSDate(date).toFormat('yyyy-MM-dd')}`,
	)

	// create DynamoDB connection, write data
	const dynamoDBClient = new DynamoDBClient({
		region: process.env.AWS_ROKAGYM_MEAL_REGION ?? 'ap-northeast-2',
	})
	const documentClient = DynamoDBDocument.from(dynamoDBClient)

	const res = await documentClient.batchGet({
		RequestItems: {
			[process.env.AWS_ROKAGYM_MEAL_TABLE_NAME]: {
				Keys: codes.map((code) => ({ id: code })),
			},
		},
	})

	return (res.Responses?.[process.env.AWS_ROKAGYM_MEAL_TABLE_NAME] ??
		[]) as MealData[]
}
