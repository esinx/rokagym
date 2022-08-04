# 체. 단. 실 (체력단련실)

> 상위 1% 특급전사가 되어보자!

## 기능

## 활용 데이터

- 국방부 각 부대별 식단정보: https://www.data.go.kr/data/15057715/openapi.do
- 국방부 연도별 장병 체력검정 기준 정보: https://www.data.go.kr/data/15083050/fileData.do
- 기상청 생활기상지수(자외선): https://www.data.go.kr/data/15085288/openapi.do
- 기상청 단기예보: https://www.data.go.kr/data/15084084/openapi.do

## 프로젝트 구조

```
- app
- database
- playground
- service
  - backend
  - daily-meal-data: serverless implementation for cronjob
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
- Expo EAS: 맥북 없이도 앱스토어/플레이스토어에 배포

## icons

- https://feathericons.com/
- https://css.gg/app

## 회고

정말 짧은 기간(7. 20 ~ 8. 20)동안 풀스택 프로젝트를 제작해봤습니다. 최신 기술인 tRPC를 사용하면서 꽤 재미있는 경험이 되기도 했네요.

## TODO
