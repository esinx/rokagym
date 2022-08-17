import { TRPCError } from '@trpc/server'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { MilGroup } from '@prisma/client'

type RankingEntry = {
	userId: string
	username: string
	rank: string
	baseId: string
	basename: string
	group: MilGroup
	value: number
}

type Response = {
	createdAt: number
	id: string
	data: RankingEntry[]
}

export const getRankingData = async (id: string): Promise<Response> => {
	// create DynamoDB connection, write data
	const dynamoDBClient = new DynamoDBClient({
		region: process.env.AWS_ROKAGYM_RANKING_REGION ?? 'ap-northeast-2',
	})
	const documentClient = DynamoDBDocument.from(dynamoDBClient)

	const res = await documentClient.query({
		TableName: process.env.AWS_ROKAGYM_RANKING_TABLE_NAME,
		Limit: 1,
		KeyConditionExpression: 'id = :id',
		ExpressionAttributeValues: {
			':id': id,
		},
		ScanIndexForward: false,
	})

	const ranking = res.Items?.[0] as Response
	if (!ranking) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			cause: 'DataNotFound',
			message: "Ranking data doesn't exist",
		})
	}
	return ranking
}
