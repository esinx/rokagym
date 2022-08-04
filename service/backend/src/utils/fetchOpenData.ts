import got, { OptionsOfJSONResponseBody } from 'got'

export type OpenDataAPI<RequestInput, RequestOutput, RawResponse = any> = {
	buildRequest: (arg: RequestInput) => OptionsOfJSONResponseBody
	parseResult: (arg: RawResponse) => RequestOutput
}

type OpenDataAPIInput<API> = API extends OpenDataAPI<infer Input, any>
	? Input
	: never
type OpenDataAPIOutput<API> = API extends OpenDataAPI<any, infer Output>
	? Output
	: never

type OpenDataAPIRawResponse<API> = API extends OpenDataAPI<
	any,
	any,
	infer RawResponse
>
	? RawResponse
	: never

type FetchOpenData = {
	<API extends OpenDataAPI<any, any>>(
		api: API,
		arg: OpenDataAPIInput<API>,
	): Promise<OpenDataAPIOutput<API>>
	<API extends OpenDataAPI<any, any>>(
		api: API,
		arg?: OpenDataAPIInput<API>,
	): Promise<OpenDataAPIOutput<API>>
}

const fetchOpenData = async <API extends OpenDataAPI<any, any>>(
	api: API,
	arg: OpenDataAPIInput<API>,
): Promise<OpenDataAPIOutput<API>> => {
	const { buildRequest, parseResult } = api as OpenDataAPI<
		OpenDataAPIInput<API>,
		OpenDataAPIOutput<API>,
		OpenDataAPIRawResponse<API>
	>
	const request = buildRequest(arg)
	const res = await got({
		...request,
		https: {
			rejectUnauthorized: false,
		},
	}).json<OpenDataAPIRawResponse<API>>()
	return parseResult(res)
}

export default fetchOpenData as FetchOpenData
