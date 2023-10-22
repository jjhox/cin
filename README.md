# 청주IT과학고등학교 인트라넷
![썸네일](https://raw.githubusercontent.com/jjhox/cin/main/public/image/1.png)

## Deploy 가이드

1. 이 레포지토리를 포크합니다.
2. [Vercel](https://vercel.com/)에서 새 프로젝트를 생성하고 포크한 레포지토리를 선택합니다.
3. Vercel의 프로젝트 설정에서 다음의 환경 변수를 설정합니다:

   - `CITY_NAME`: 오픈웨더 지방자치단체이름 (예: Cheongju-si)
   - `OPEN_WEATHER_API_KEY`: 오픈웨더 API 키
   - `NEIS_API_KEY`: 나이스 교육정보 개방 포털 API 키
   - `NEIS_ATPT_OFCDC_SC_CODE`: 나이스 교육청 아이디
   - `NEIS_SD_SCHUL_CODE`: 나이스 학교 아이디
   - `SCHOOL_RSS_LINK`: 학교 가정통신문 RSS 주소

4. 모든 환경 변수를 설정한 후, Vercel에서 프로젝트를 Deploy 합니다.
