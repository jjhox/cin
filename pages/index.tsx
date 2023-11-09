import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import './Index.css';
import xml2js from 'xml2js';

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
    { name: '7교시', start: '15:30', end: '16:20' },
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

const deleteCookie = () => {
  Cookies.remove('userData');
};

const Index = ({ letters }) => {
  const router = useRouter();
  const userData = Cookies.get('userData');
  const [dateOffset, setDateOffset] = useState(0);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period>({ name: '', start: '', end: '', progress: 0 });
  const [lunchData, setLunchData] = useState<LunchData | null>(null);
  const [dinnerData, setDinnerData] = useState<DinnerData | null>(null);
  const userName = userData ? JSON.parse(userData).name : '';
  const [weatherData, setWeatherData] = useState<{ weather: [{ description: string }], main: { temp: number } } | null>(null);

  useEffect(() => {
    fetchWeather();
  }, []);
  
  const fetchWeather = async () => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${process.env.NEXT_PUBLIC_CITY_NAME}&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_API_KEY}`);
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };
  
  const translateWeatherDescription = (description) => {
    const translations = {
      'thunderstorm with light rain': { description: '가벼운 비와 함께하는 천둥번개', imageUrl: '/images/11d.png' },
      'thunderstorm with rain': { description: '비와 함께하는 천둥번개', imageUrl: '/images/11d.png' },
      'thunderstorm with heavy rain': { description: '심한 비와 함께하는 천둥번개', imageUrl: '/images/11d.png' },
      'light thunderstorm': { description: '가벼운 천둥번개', imageUrl: '/images/11d.png' },
      'thunderstorm': { description: '천둥번개', imageUrl: '/images/11d.png' },
      'heavy thunderstorm': { description: '심한 천둥번개', imageUrl: '/images/11d.png' },
      'ragged thunderstorm': { description: '불규칙한 천둥번개', imageUrl: '/images/11d.png' },
      'thunderstorm with light drizzle': { description: '이슬비와 함께하는 천둥번개', imageUrl: '/images/11d.png' },
      'thunderstorm with drizzle': { description: '천둥번개와 이슬비', imageUrl: '/images/11d.png' },
      'thunderstorm with heavy drizzle': { description: '심한 이슬비와 함께하는 천둥번개', imageUrl: '/images/11d.png' },
      'light intensity drizzle': { description: '가벼운 이슬비', imageUrl: '/images/09d.png' },
      'drizzle': { description: '이슬비', imageUrl: '/images/09d.png' },
      'heavy intensity drizzle': { description: '심한 이슬비', imageUrl: '/images/09d.png' },
      'light intensity drizzle rain': { description: '가벼운 비와 이슬비', imageUrl: '/images/09d.png' },
      'drizzle rain': { description: '비와 이슬비', imageUrl: '/images/09d.png' },
      'heavy intensity drizzle rain': { description: '심한 비와 이슬비', imageUrl: '/images/09d.png' },
      'shower rain and drizzle': { description: '소나기와 이슬비', imageUrl: '/images/09d.png' },
      'heavy shower rain and drizzle': { description: '심한 소나기와 이슬비', imageUrl: '/images/09d.png' },
      'shower drizzle': { description: '이슬비 샤워', imageUrl: '/images/09d.png' },
      'light rain': { description: '가벼운 비', imageUrl: '/images/10d.png' },
      'moderate rain': { description: '중간 강도의 비', imageUrl: '/images/10d.png' },
      'heavy intensity rain': { description: '강한 비', imageUrl: '/images/10d.png' },
      'very heavy rain': { description: '매우 강한 비', imageUrl: '/images/10d.png' },
      'extreme rain': { description: '극심한 비', imageUrl: '/images/10d.png' },
      'freezing rain': { description: '얼어붙는 비', imageUrl: '/images/13d.png' },
      'light intensity shower rain': { description: '가벼운 소나기', imageUrl: '/images/09d.png' },
      'shower rain': { description: '소나기', imageUrl: '/images/09d.png' },
      'heavy intensity shower rain': { description: '강한 소나기', imageUrl: '/images/09d.png' },
      'ragged shower rain': { description: '불규칙한 소나기', imageUrl: '/images/09d.png' },
      'light snow': { description: '가벼운 눈', imageUrl: '/images/13d.png' },
      'snow': { description: '눈', imageUrl: '/images/13d.png' },
      'heavy snow': { description: '심한 눈', imageUrl: '/images/13d.png' },
      'sleet': { description: '진눈깨비', imageUrl: '/images/13d.png' },
      'light shower sleet': { description: '가벼운 진눈깨비 샤워', imageUrl: '/images/13d.png' },
      'shower sleet': { description: '진눈깨비 샤워', imageUrl: '/images/13d.png' },
      'light rain and snow': { description: '가벼운 비와 눈', imageUrl: '/images/13d.png' },
      'rain and snow': { description: '비와 눈', imageUrl: '/images/13d.png' },
      'light shower snow': { description: '가벼운 눈 샤워', imageUrl: '/images/13d.png' },
      'shower snow': { description: '눈 샤워', imageUrl: '/images/13d.png' },
      'heavy shower snow': { description: '심한 눈 샤워', imageUrl: '/images/13d.png' },
      
      'mist': { description: '안개', imageUrl: '/images/50d.png' },
      'smoke': { description: '연기', imageUrl: '/images/50d.png' },
      'haze': { description: '아지랭이', imageUrl: '/images/50d.png' },
      'sand/dust whirls': { description: '모래/먼지 소용돌이', imageUrl: '/images/50d.png' },
      'fog': { description: '안개', imageUrl: '/images/50d.png' },
      'sand': { description: '모래', imageUrl: '/images/50d.png' },
      'dust': { description: '먼지', imageUrl: '/images/50d.png' },
      'volcanic ash': { description: '화산재', imageUrl: '/images/50d.png' },
      'squalls': { description: '돌풍', imageUrl: '/images/50d.png' },
      'tornado': { description: '토네이도', imageUrl: '/images/50d.png' },
      
      'clear sky': { description: '맑은 하늘', imageUrl: '/images/01d.png' },
      
      'few clouds': { description: '구름 조금', imageUrl: '/images/02d.png' },
      'scattered clouds': { description: '흩어진 구름', imageUrl: '/images/03d.png' },
      'broken clouds': { description: '부서진 구름', imageUrl: '/images/04d.png' },
      'overcast clouds': { description: '흐린 구름', imageUrl: '/images/04d.png' }
    };
    return translations[description] || { description, imageUrl: '/images/default.jpg' };
  };

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
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + dateOffset);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${date}`;
    setCurrentDate(dateString);
  }, [dateOffset]);

  useEffect(() => {
    const fetchData = async () => {
      if (userData) {
        if (currentDate) {
          await fetchTimetable();
        }
      } else {
        router.push('/welcome');
      }
    };
  
    fetchData();
  }, [currentDate, userData]);  

  const fetchTimetable = async () => {
    if (!userData) {
      console.error('No user data');
      return;
    }

    const { department, grade, class: classNumber } = JSON.parse(userData);
    const url = `https://open.neis.go.kr/hub/hisTimetable?KEY=${process.env.NEXT_PUBLIC_NEIS_API_KEY}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${process.env.NEXT_PUBLIC_ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${process.env.NEXT_PUBLIC_SD_SCHUL_CODE}&ALL_TI_YMD=${currentDate}&GRADE=${grade}&DDDEP_NM=${encodeURIComponent(department)}&CLASS_NM=${classNumber}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch timetable data:', response.status);
        setTimetable([]);
        return;
      }

      const data = await response.json();
      if (data.hisTimetable && data.hisTimetable[1] && data.hisTimetable[1].row) {
        setTimetable(data.hisTimetable[1].row);
      } else {
        console.error('Invalid or missing data', data);
        setTimetable([]);
      }
    } catch (error) {
      console.error('Error fetching timetable data:', error);
    }
  };

  const changeDate = (offset: number) => {
    setDateOffset(prevOffset => prevOffset + offset);
  };

  const fetchMeal = async (): Promise<void> => {
    try {
      const lunchRequest = fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${process.env.NEXT_PUBLIC_NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${process.env.NEXT_PUBLIC_ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${process.env.NEXT_PUBLIC_SD_SCHUL_CODE}&MLSV_YMD=${currentDate}&MMEAL_SC_CODE=2`);
      const dinnerRequest = fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${process.env.NEXT_PUBLIC_NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${process.env.NEXT_PUBLIC_ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${process.env.NEXT_PUBLIC_SD_SCHUL_CODE}&MLSV_YMD=${currentDate}&MMEAL_SC_CODE=3`);

      const [lunchResponse, dinnerResponse] = await Promise.all([lunchRequest, dinnerRequest]);

      if (!lunchResponse.ok) throw new Error('Failed to fetch lunch data');
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
            <img src="/images/logo.svg" alt="Logo" className="logo" />
        </div>
    </header>
    <div className="box timetable-wrapper">
    {userName !== null && (
    <div className="welcome-message"><h3>{userName} 학생님 환영합니다,</h3>
    <div className="meal-content">{getDayMessage()}</div>
            </div>
            
          )}
              {weatherData ? (
                <div className="meal-content">
                  <br />
                <div>
      <img className="weatherImg" src={translateWeatherDescription(weatherData.weather[0].description).imageUrl} alt="Weather image"></img>
      </div>
      현재 날씨는 {translateWeatherDescription(weatherData.weather[0].description).description}에 {Math.round(weatherData.main.temp - 273.15)}°C 입니다.
        </div>
        ) : (
          <p>데이터 로딩 중...</p>
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
  const res = await fetch(`${process.env.NEXT_PUBLIC_SCHOOL_RSS_LINK}`);
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