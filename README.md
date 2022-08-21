> 2022 국방 데이터 활용 경진대회 출품작... 그것도 무려 오픈소스로

# 체. 단. 실 (체력단련실)

> 국군 3대 체력측정, 특급 찍어볼까?

## 기능
“체력단련실”은 운동 및 헬스에 관심 있는 국군 장병들에게,

    1) 개인화된 운동 루틴 및 체력 증진, 건강관리에 필요한 요소들을 제공함으로써 맞춤형 체력단련을 누리게 합니다. 
    
    2) 랭킹화를 통한 상호경쟁을 유도하여 체력단련에 대한 동기를 부여하며 이를 통한 교육훈련 준비가 가능합니다. 
    
    3)  체력단련에 유용한 정보제공 및 공공데이터를 활용한 올인원 체력단련 시스템으로 매일 목표를 설정하고 이를 간편하고 재미있게 성취할 수 있도록 합니다.

## 활용 데이터

- 국방부 연도별 장병 체력검정 기준 정보: https://www.data.go.kr/data/15083050/fileData.do
- 국방부 육군 신체측정정보: https://www.data.go.kr/data/3034732/openapi.do
- 국방부 각 부대별 식단정보: https://www.data.go.kr/data/15057715/openapi.do
- 국방부 군병원 정보: https://www.data.go.kr/data/3034721/openapi.do
- 기상청 단기예보: https://www.data.go.kr/data/15084084/openapi.do
- 행정안전부 행정표준코드 법정동코드: https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15077871

## 프로젝트 구조

```
- app
- database
- service
  - backend
  - daily-meal-data: fetch daily meal data using serverless + AWS EventBridge
  - hourly-ranking-cache: cache ranking data (hourly) using serverless + AWS EventBridge
```

## 스택

### 백엔드

- tRPC: fullstack type safety를 보장하기 위한 TypeScript용 RPC 라이브러리
- Prisma: TypeScript에 최적화된 ORM
- Fastify: 빠른 HTTP 서버
- jsonwebtoken: jwt 관련 서비스 제공을 위한 라이브러리
- jest: e2e(end-to-end) 테스팅 라이브러리

### 배포

- AWS Lambda: 서버리스 아키텍쳐를 활용한 배포 방식
- AWS EventBridge: 매일 특정 시간에 반복 실행하는 함수들을 스케쥴링
- AWS DynamoDB: 빠르고 간편한 문서형 DB (데이터/연산 캐싱을 위해 사용)
- AWS Aurora Serverless: 서버리스 아키텍쳐와 시너지를 이루는 SQL형 데이터베이스
- Expo EAS: Expo를 통해 빠르게 앱스토어/플레이스토어에 배포

## icons

- https://feathericons.com/
- https://css.gg/app

- https://thenounproject.com/icon/fitness-coach-1926490/
- https://thenounproject.com/icon/coach-2420008/
- https://thenounproject.com/icon/run-2975840/
- https://thenounproject.com/icon/barbell-1934475/

## TODO

- Frontend
  - Open Source Notice
  * Workout Calendar
  * Training Goal History
