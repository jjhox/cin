import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import './Index.css';
import xml2js from 'xml2js';

// 평일 기준 기간에 대한 상수입니다.
const WEEKDAYS = {
  'MonWedFri': [
    { name: '등교', start: '00:00', end: '08:30' },
    { name: '조회', start: '08:30', end: '08:40' },
    { name: '1교시', start: '08:40', end: '09:30' },
    { name: '1교시 쉬는시간', start: '09:30', end: '09:40' },
    { name: '2교시', start: '09:40', end: '10:30' },
    { name: '2교시 쉬는시간', start: '10:30', end: '10:40' },
    { name: '3교시', start: '10:40', end: '11:30' },
    { name: '3교시 쉬는시간', start: '11:30', end: '11:40' },
    { name: '4교시', start: '11:40', end: '12:30' },
    { name: '점심시간', start: '12:30', end: '13:30' },
    { name: '5교시', start: '13:30', end: '14:20' },
    { name: '5교시 쉬는시간', start: '14:20', end: '14:30' },
    { name: '6교시', start: '14:30', end: '15:20' },
    { name: '6교시 쉬는시간', start: '15:20', end: '15:30' },
    { name: '7교시', start: '16:30', end: '16:20' },
    { name: '청소 및 종례', start: '16:20', end: '16:40' },
    { name: '야자 또는 방과후', start: '16:40', end: '21:00' },
    { name: '하교', start: '21:00', end: '23:59' },
  ],
  'ThuFri': [
    { name: '등교', start: '00:00', end: '08:30' },
    { name: '조회', start: '08:30', end: '08:40' },
    { name: '1교시', start: '08:40', end: '09:30' },
    { name: '1교시 쉬는시간', start: '09:30', end: '09:40' },
    { name: '2교시', start: '09:40', end: '10:30' },
    { name: '2교시 쉬는시간', start: '10:30', end: '10:40' },
    { name: '3교시', start: '10:40', end: '11:30' },
    { name: '3교시 쉬는시간', start: '11:30', end: '11:40' },
    { name: '4교시', start: '11:40', end: '12:30' },
    { name: '점심시간', start: '12:30', end: '13:30' },
    { name: '5교시', start: '13:30', end: '14:20' },
    { name: '5교시 쉬는시간', start: '14:20', end: '14:30' },
    { name: '6교시', start: '14:30', end: '15:20' },
    { name: '청소 및 종례', start: '15:20', end: '15:40' },
    { name: '야자 또는 방과후', start: '15:40', end: '21:00' },
    { name: '하교', start: '21:00', end: '23:59' },
  ],
  'Weekend': [{ name: '휴일', start: '00:00', end: '23:59' }]
};

// 현재 날짜의 기간을 가져옵니다.
const getTimePeriods = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  if ([0, 6].includes(dayOfWeek)) return WEEKDAYS['Weekend'];
  if ([4, 5].includes(dayOfWeek)) return WEEKDAYS['ThuFri'];
  return WEEKDAYS['MonWedFri'];
};

type Period = {
  name: string;
  start: string;
  end: string;
  progress: number;
};

// 시간과 현재 기간을 기준으로 현재 기간을 계산합니다.
const getCurrentPeriod = () => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const timePeriods = getTimePeriods();
  
  for (let period of timePeriods) {
    const [startHour, startMinute] = period.start.split(':');
    const [endHour, endMinute] = period.end.split(':');
    const periodStart = parseInt(startHour) * 60 + parseInt(startMinute);
    const periodEnd = parseInt(endHour) * 60 + parseInt(endMinute);
    
    if (currentTime >= periodStart && currentTime < periodEnd) {
      return {
        name: period.name,
        start: period.start,
        end: period.end,
        progress: ((currentTime - periodStart) / (periodEnd - periodStart)) * 100
      };
    }
  }
  
  return { name: '시간표 외 시간', start: '', end: '', progress: 0 };
};

// 사용자 데이터 쿠키를 삭제합니다.
const deleteCookie = () => {
  Cookies.remove('userData');
};

const Index = ({ letters }) => {
  const router = useRouter();
  const userData = Cookies.get('userData');
  const [dateOffset, setDateOffset] = useState(0);  // 날짜 오프셋 상태 추가
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period>({ name: '', start: '', end: '', progress: 0 });
  const [lunchData, setLunchData] = useState<LunchData | null>(null);
  const [dinnerData, setDinnerData] = useState<DinnerData | null>(null);
  const userName = userData ? JSON.parse(userData).name : '';
  const [weatherData, setWeatherData] = useState<{ weather: [{ description: string }], main: { temp: number } } | null>(null);

  useEffect(() => {
    fetchWeather(setWeatherData);
  }, []);

 // 날씨 데이터를 가져옵니다.
 const fetchWeather = async (setWeatherData) => {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${process.env.CITY_NAME}&appid=${process.env.OPEN_WEATHER_API_KEY}`);
    const data = await response.json();
    setWeatherData(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
};

// 날씨 API의 영어 설명을 한국어로 번역합니다.
const translateWeatherDescription = (description) => {
  const translations = {
      'clear sky': '맑은 하늘',
      'few clouds': '약간의 구름',
      'scattered clouds': '흩어진 구름',
      'overcast clouds': '흐린 구름',
      'broken clouds': '조각난 구름',
      'drizzle': '이슬비',
      'rain': '비',
      'shower rain': '소나기',
      'thunderstorm': '천둥번개',
      'snow': '눈',
      'mist': '안개'

    };
    return translations[description] || description;
  };

// 날짜를 'YYYY-MM-DD' 형식으로 형식화합니다.
function formatDate(dateString: string): string {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul'
  };
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', dateOptions).replace(/\. /g, '월 ').replace(/\./g, '일');
}

  useEffect(() => {
    const intervalId = setInterval(() => {
    setCurrentPeriod(getCurrentPeriod());
    }, 1000);  // 1초마다 갱신
    return () => clearInterval(intervalId);  // 컴포넌트 언마운트 시 인터벌 정리
  }, []);


  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + dateOffset);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${date}`;
    setCurrentDate(dateString);
  }, [dateOffset]);  // dateOffset 상태가 변경될 때마다 이 useEffect가 실행됩니다.

useEffect(() => {
    if (!userData) {
        router.push('/welcome');
    } else if (currentDate) {
        const { department, grade, class: classNumber } = JSON.parse(userData);
        const url = `https://open.neis.go.kr/hub/hisTimetable?KEY=${process.env.NEIS_API_KEY}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${process.env.ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${process.env.SD_SCHUL_CODE}&ALL_TI_YMD=${currentDate}&GRADE=${grade}&DDDEP_NM=${encodeURIComponent(department)}&CLASS_NM=${classNumber}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.hisTimetable && data.hisTimetable[1] && data.hisTimetable[1].row) {
                    setTimetable(data.hisTimetable[1].row);
                } else {
                    console.error('Invalid or missing data', data);  // 오류 로깅
                    setTimetable([]);  // 시간표를 빈 배열로 설정하여 오류를 방지
                }
            })
            .catch(error => {
                console.error('Error fetching timetable data:', error);
            });
    }
}, [currentDate, userData]);


  const changeDate = (offset: number) => {
    setDateOffset(prevOffset => prevOffset + offset);
  };

  const fetchMeal = async (): Promise<void> => {
    try {
      const lunchResponse = await fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${process.env.NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${process.env.ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${process.env.SD_SCHUL_CODE}&MLSV_YMD=${currentDate}&MMEAL_SC_CODE=2`);
      if (!lunchResponse.ok) throw new Error('Failed to fetch lunch data');
      const dinnerResponse = await fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${process.env.NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${process.env.ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${process.env.SD_SCHUL_CODE}&MLSV_YMD=${currentDate}&MMEAL_SC_CODE=3`);
      if (!dinnerResponse.ok) throw new Error('Failed to fetch dinner data');
  
      const lunchData = await lunchResponse.json();
      const dinnerData = await dinnerResponse.json();
  
      if (lunchData.mealServiceDietInfo && lunchData.mealServiceDietInfo[1]?.row) {
        setLunchData(lunchData.mealServiceDietInfo[1].row[0]);
      } else {
        setLunchData({DDISH_NM: "오늘은 점심이 없습니다.", NTR_INFO: "", ORPLC_INFO: "" });
      }
    
      if (dinnerData.mealServiceDietInfo && dinnerData.mealServiceDietInfo[1]?.row) {
        setDinnerData(dinnerData.mealServiceDietInfo[1].row[0]);
      } else {
        setDinnerData({DDISH_NM: "오늘은 석식이 없습니다.", NTR_INFO: "", ORPLC_INFO: "" });
      }
    } catch (error) {
      console.error('Error fetching meal data:', error);
    }
  };

  const getDayMessage = () => {
    const dayMessages = {
      '0': '오늘은 일요일입니다, 좋은 주말 보내세요! 😉',
      '1': '오늘은 월요일입니다, 힘내세요! 👏',
      '2': '오늘은 화요일입니다, 오늘 하루 행복하셨으면 좋겠어요! 😝',
      '3': '오늘은 수요일입니다, 벌써 절반을 보내셨네요! 😮',
      '4': '오늘은 목요일입니다, 일주일은 생각보다 금방 가는 것 같아요 😎',
      '5': '오늘은 금요일입니다, 드디어 내일은 주말이에요! 😙',
      '6': '오늘은 토요일입니다, 좋은 주말 보내세요! 🤗',
    };
    const now = new Date();
    const dayOfWeek = now.getDay().toString();
    return dayMessages[dayOfWeek];
  };
  
  useEffect(() => {
    if (currentDate) {
      fetchMeal();
    }
  }, [currentDate]);

  function toggleDetailInfo() {
    const detailInfo = document.querySelector('.detail-info') as HTMLElement;
    
    if (detailInfo) {
      const computedStyle = window.getComputedStyle(detailInfo);
      
      if (computedStyle.display === 'none') {
        detailInfo.style.display = 'block';
      } else {
        detailInfo.style.display = 'none';  // 이 줄 추가
      }
    }
}

  interface LunchData {
    DDISH_NM: string;
    NTR_INFO: string;
    ORPLC_INFO: string;
  }
  

  interface DinnerData {
    DDISH_NM: string;
    NTR_INFO: string;
    ORPLC_INFO: string;
  }
  

  const timetableData = timetable.reduce((acc, entry) => {  // This line is fixed
    const period = entry.PERIO;
    const subject = entry.ITRT_CNTNT;
  
    acc[period] = subject;
    return acc;
  }, {});

  const getToday = () => {
    if (currentDate) {
      return `${currentDate.substring(0, 4)}-${currentDate.substring(4, 6)}-${currentDate.substring(6, 8)}`;
    }
    return '---';
  };

  return (
  <div className="container">
    <header className="header">
        <div className="logo-container">
            <img src="/image/logo.svg" alt="Logo" className="logo" />
        </div>
    </header>
    <div className="box timetable-wrapper">
    {userName !== null && (
    <div className="welcome-message"><h3>{userName} 학생님 환영합니다,</h3>
    <div className="meal-content">{getDayMessage()}</div>
            </div>
            
          )}
              {weatherData ? (
          <div>
            <div className="meal-content">날씨는 {translateWeatherDescription(weatherData.weather[0].description)}에 {Math.round(weatherData.main.temp - 273.15)}°C 입니다.</div>
          </div>
        ) : (
          <p>날씨 데이터 로딩 중...</p>
        )}<br />
      </div>
    <div className="box current-period">
    <div className="section-title">  
            현재 시각
        </div>
    <div className="current-period-name">
        {currentPeriod.name}
    </div>
    <br /><br />
    <div className="progress-container">
        <span className="start-time">{currentPeriod.start}</span>
        <progress value={currentPeriod.progress} max="100"></progress>
        <span className="end-time">{currentPeriod.end}</span>
    </div>
</div>

<div className="box timetable-wrapper">
<div className="section-title">  
            시간표
        </div><br></br>
    <div className="timetable-container">
        <table className="timetable">
            <thead>
                <tr>
                    <th>교시</th>
                    <th>과목</th>
                </tr>
            </thead>
            <tbody>
                {[1, 2, 3, 4, 5, 6, 7].map(period => (
                    <tr key={period}>
                        <td>{period}</td>
                        <td>{timetableData[period] || '---'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</div>

  <div className="box meal-container">
  <div className="section-title">  
            급식
        </div>
  {lunchData && (
    <div>
        <h3>{getToday().substring(5, 7)}월 {getToday().substring(8)}일 점심 메뉴</h3>
        <div className="meal-content">
          <p>{lunchData.DDISH_NM.replace(/<br\/>/g, ', ')}</p>
        </div>
    </div>
)}


    <button className="show-button" onClick={toggleDetailInfo}>자세히 보기</button>
    <div className="detail-info">
        {lunchData && lunchData.NTR_INFO && (
            <div>
                <h4>영양 정보</h4>
                <div className="meal-content">
                  <p>{lunchData.NTR_INFO.replace(/<br\/>/g, ', ')}</p>
                </div>
            </div>
        )}

        {lunchData && lunchData.ORPLC_INFO && (
            <div>
                <h4>원산지 정보</h4>
                <div className="meal-content">
                <p>{lunchData.ORPLC_INFO.replace(/<br\/>/g, ', ')}</p>
                </div>
            </div>
        )}

    </div>
    </div>
    <div className="box letters-container">
        <div className="section-title">
          가정통신문
        </div>
        {letters.map((letter, index) => (
  <div className="letter" key={index}>
    <h3>{letter.title}</h3>
    <div className="meal-content">
      <p>{formatDate(letter.date)}</p>
      <button
        className="show-button"
        onClick={() => window.open(`${letter.link}`, 'noopener,noreferrer')}
      >
        글 보러가기
      </button>
    </div>
  </div>
        ))}
      </div>
    <div className="box meal-container">
    <div className="section-title">  
    데이터 삭제
        </div>
        <br />
        <button className="show-button" onClick={deleteCookie}>로그아웃 후 초기화면으로 돌아가기</button><br /><br /><br />
        <div className="section-title">  
            날짜 조정
        </div><br />
           <div className="date-buttons">
            <button className="date-button" onClick={() => changeDate(-1)}>어제</button>
            <div className="meal-content">{getToday().substring(5, 7)}월 {getToday().substring(8)}일</div>
            <button className="date-button" onClick={() => changeDate(1)}>내일</button>
        </div>
        </div>
  <div className="footer">
    <br></br>
    <p><a href="https://instagram.com/cjit.cin">인스타그램</a> 계정을 팔로우하고 소식을 들어보세요.</p>
      <p>© 2023 CiN / Design & Development with ❤ by <a href="https://instagram.com/wkdd">장준하</a></p>
  </div>
  </div>
  );
};

export async function getServerSideProps() {
  const res = await fetch(`${process.env.SCHOOL_RSS_LINK}`);
  const text = await res.text();
  const parser = new xml2js.Parser();
  const parsedXml = await parser.parseStringPromise(text);

  // 최근 3개의 항목만 선택
  const items = parsedXml.rss.channel[0].item.slice(0, 3).map(item => ({
    title: item.title[0],
    link: item.link[0],
    date: item.pubDate[0],  // 날짜 정보를 가져옵니다.
  }));

  return { props: { letters: items } };
}

export default Index;