import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import './welcome.css';  // CSS 파일을 임포트합니다.

const Welcome = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    grade: '',
    class: ''
  });

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    Cookies.set('userData', JSON.stringify(formData));
    router.push('/');  // index.tsx로 리디렉션
  };

  // 폼 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="welcome-container">
      <div className="welcome-box">
      <div className="logo-container">
            <img src="/images/logo.svg" alt="Logo" className="logo" />
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름"
              required
            />
            <br />
            <select name="department" value={formData.department} onChange={handleChange} required>
              <option value="" disabled>학과 선택</option>
              <option value="컴퓨터디자인과">컴퓨터디자인과</option>
              <option value="스마트소프트웨어과">스마트소프트웨어과</option>
              <option value="인공지능프로그래밍과">인공지능프로그래밍과</option>
              <option value="판매관리과">판매관리과</option>
              <option value="사무행정과">사무행정과</option>
            </select>
          </div>
          {(formData.department !== '판매관리과' && formData.department !== '사무행정과') && (
            <div className="form-group">
              <select name="grade" value={formData.grade} onChange={handleChange} required>
                <option value="" disabled>학년 선택</option>
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                {formData.department !== '컴퓨터디자인과' && formData.department !== '인공지능프로그래밍과' && (
                  <option value="3">3학년</option>
                )}
              </select>
            </div>
          )}
          {(formData.department !== '판매관리과' && formData.department !== '사무행정과') && (
            <div className="form-group">
              <select name="class" value={formData.class} onChange={handleChange} required>
                <option value="" disabled>반 선택</option>
                <option value="1">1반</option>
                <option value="2">2반</option>
                <option value="3">3반</option>
              </select>
            </div>
          )}
          <button type="submit" className="login-button">로그인</button>
        </form>
      </div>
    </div>
  );
};

export default Welcome;
