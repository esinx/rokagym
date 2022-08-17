declare global {
	namespace NodeJS {
		interface ProcessEnv {
			AWS_ROKAGYM_MEAL_TABLE_NAME: string
			AWS_ROKAGYM_MEAL_REGION: string
			AWS_ROKAGYM_RANKING_TABLE_NAME: string
			AWS_ROKAGYM_RANKING_REGION: string
			PRIVATE_KEY: string
			PUBLIC_KEY: string
			MND_OPEN_DATA_API_KEY: string
			GOV_OPEN_DATA_API_KEY: string
			REGION_CODE_COORDINATES_PATH: string
		}
	}
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
