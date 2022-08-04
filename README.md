# 체. 단. 실 (체력단련실)

> 국군 3대 체력측정, 특급 찍어볼까?

## 기능

## 활용 데이터

- 국방부 각 부대별 식단정보: https://www.data.go.kr/data/15057715/openapi.do
- 국방부 연도별 장병 체력검정 기준 정보: https://www.data.go.kr/data/15083050/fileData.do
- 기상청 생활기상지수(자외선): https://www.data.go.kr/data/15085288/openapi.do
- 기상청 단기예보: https://www.data.go.kr/data/15084084/openapi.do
- 행정안전부 행정표준코드 법정동코드: https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15077871

## 프로젝트 구조

```
- app
- database
- playground
- service
  - backend
  - daily-meal-data: fetch daily meal data using serverless + AWS EventBridge
  - hourly-ranking-cache: cache ranking data (hourly) using serverless + AWS EventBridge
```

## 스택

### 백엔드

- tRPC: fullstack type safety를 보장하기 위한 TypeScript용 RPC 라이브러리
- Prisma: TypeScript에 최적화된 ORM
- Fastify: 가장 빠른 HTTP 서버
- jose: jwt 관련 서비스 제공을 위한 라이브러리
- jest: e2e(end-to-end) 테스팅 라이브러리

### 배포

- AWS Lambda: 서버리스 아키텍쳐를 활용한 배포 방식
- AWS EventBridge: 매일 자정에 실행하는 함수들을 스케쥴링
- AWS DynamoDB: 빠르고 간편한 문서형 DB (데이터/연산 캐싱을 위해 사용)
- AWS Aurora Serverless: 서버리스 아키텍쳐와 시너지를 이루는 SQL형 데이터베이스
- Expo EAS: Expo를 통해 빠르게 앱스토어/플레이스토어에 배포

## icons

- https://feathericons.com/
- https://css.gg/app

## TODO
