/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/functions/cache-ranking/handler.ts":
/*!************************************************!*\
  !*** ./src/functions/cache-ranking/handler.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"cacheRankingData\": () => (/* binding */ cacheRankingData)\n/* harmony export */ });\n/* harmony import */ var luxon__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! luxon */ \"luxon\");\n/* harmony import */ var luxon__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(luxon__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _aws_sdk_client_dynamodb__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @aws-sdk/client-dynamodb */ \"@aws-sdk/client-dynamodb\");\n/* harmony import */ var _aws_sdk_client_dynamodb__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_aws_sdk_client_dynamodb__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _aws_sdk_lib_dynamodb__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @aws-sdk/lib-dynamodb */ \"@aws-sdk/lib-dynamodb\");\n/* harmony import */ var _aws_sdk_lib_dynamodb__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_aws_sdk_lib_dynamodb__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nconst RANKINGS = [\n    {\n        name: \"전군\",\n        id: \"ALL\",\n    },\n    {\n        name: \"육군\",\n        id: \"ARMY\",\n    },\n    {\n        name: \"해군\",\n        id: \"NAVY\",\n    },\n    {\n        name: \"공군\",\n        id: \"AIR_FORCE\",\n    },\n    {\n        name: \"해병대\",\n        id: \"MARINE_CORPS\",\n    },\n    {\n        name: \"국방부\",\n        id: \"MINISTRY_OF_DEFENSE\",\n    },\n].flatMap((group) => [\"pushup\", \"situp\", \"run\"].flatMap((workoutTypeId) => [\"daily\", \"monthly\"].map((rankingType) => ({\n    workoutTypeId,\n    rankingType,\n    groupId: group.id,\n    id: `${group.id}.${workoutTypeId}.${rankingType}`,\n})), []), []);\nconst chunkArray = (arr, by) => {\n    if (arr.length <= by) {\n        return [arr];\n    }\n    const sliced = arr.slice(0, by);\n    const rest = arr.slice(by);\n    return [sliced, ...chunkArray(rest, by)];\n};\nconst cacheRankingData = async (event) => {\n    console.log(`[net.esinx.rokagym.cache-ranking-data] executed at: ${event.time}`);\n    const prisma = new _prisma_client__WEBPACK_IMPORTED_MODULE_3__.PrismaClient({});\n    const fetchTopOf = async ({ limit = 30, workoutTypeId, group, timeRange, }) => (await prisma.$queryRaw `SELECT WorkoutLog.userId, User.name AS username, User.rank, User.baseId, Base.name AS basename, Base.group,\n    SUM(WorkoutLog.value) AS value\nFROM WorkoutLog\nRIGHT JOIN User ON WorkoutLog.userId = User.id\nRIGHT JOIN Base ON User.baseId = Base.id\nWHERE WorkoutLog.timestamp > ${luxon__WEBPACK_IMPORTED_MODULE_0__.DateTime.fromJSDate(timeRange[0]).toISO()}\n        AND WorkoutLog.timestamp < ${luxon__WEBPACK_IMPORTED_MODULE_0__.DateTime.fromJSDate(timeRange[1]).toISO()}\n        AND WorkoutLog.workoutTypeId = ${workoutTypeId}\n        ${group ? _prisma_client__WEBPACK_IMPORTED_MODULE_3__.Prisma.sql `AND Base.group = ${group}` : _prisma_client__WEBPACK_IMPORTED_MODULE_3__.Prisma.empty}\nGROUP BY WorkoutLog.userId, WorkoutLog.workoutTypeId\nORDER BY SUM(value) DESC\nLIMIT ${limit}`);\n    const fetchRanking = async (ranking) => {\n        const todayKST = luxon__WEBPACK_IMPORTED_MODULE_0__.DateTime.now().setZone(\"Asia/Seoul\");\n        const range = ranking.rankingType === \"monthly\"\n            ? [\n                todayKST.startOf(\"month\").toJSDate(),\n                todayKST.endOf(\"month\").toJSDate(),\n            ]\n            : [\n                todayKST.startOf(\"day\").toJSDate(),\n                todayKST.endOf(\"day\").toJSDate(),\n            ];\n        const data = await fetchTopOf({\n            timeRange: range,\n            workoutTypeId: ranking.workoutTypeId,\n            group: ranking.groupId === \"ALL\" ? undefined : ranking.groupId,\n        });\n        return data;\n    };\n    try {\n        console.log(\"fetching rankings...\");\n        const allRankings = await Promise.all(RANKINGS.map(async (ranking) => {\n            const fetched = await fetchRanking(ranking);\n            console.log(\"did fetch\", ranking.id);\n            return [ranking, fetched];\n        }));\n        console.log(`Need to store: ${allRankings.length} documents`);\n        const createdAt = new Date().getTime();\n        const dynamoDBClient = new _aws_sdk_client_dynamodb__WEBPACK_IMPORTED_MODULE_1__.DynamoDBClient({\n            region: process.env.REGION ?? \"ap-northeast-2\",\n            endpointDiscoveryEnabled: true,\n        });\n        const documentClient = _aws_sdk_lib_dynamodb__WEBPACK_IMPORTED_MODULE_2__.DynamoDBDocument.from(dynamoDBClient);\n        console.log(\"writing rankings...\");\n        const execAll = await Promise.all(allRankings.map(async ([{ id }, data], idx, arr) => {\n            console.log(`writing  ${idx}/${arr.length}`);\n            const res = await documentClient.put({\n                Item: { id, createdAt, data },\n                TableName: \"rokagym-ranking-cache\",\n            });\n            console.log(`did write chunk ${idx}/${arr.length}`);\n            return res;\n        }));\n        console.log(`Execution result: ${JSON.stringify(execAll)}`);\n        dynamoDBClient.destroy();\n    }\n    catch (error) {\n        console.error(error);\n    }\n    return;\n};\n\n\n//# sourceURL=webpack://rokagym-ranking-cache/./src/functions/cache-ranking/handler.ts?");

/***/ }),

/***/ "@aws-sdk/client-dynamodb":
/*!*******************************************!*\
  !*** external "@aws-sdk/client-dynamodb" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("@aws-sdk/client-dynamodb");

/***/ }),

/***/ "@aws-sdk/lib-dynamodb":
/*!****************************************!*\
  !*** external "@aws-sdk/lib-dynamodb" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("@aws-sdk/lib-dynamodb");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "luxon":
/*!************************!*\
  !*** external "luxon" ***!
  \************************/
/***/ ((module) => {

module.exports = require("luxon");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/functions/cache-ranking/handler.ts");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;