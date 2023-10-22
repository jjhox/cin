import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import './welcome.css'; // CSS 스타일을 임포트합니다.

const Welcome = () => {
  const router = useRouter();

  // 사용자 입력 데이터 상태
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    grade: '',
    class: ''
  });

  // 폼 제출 시 실행되는 함수
  const handleSubmit = (e) => {
    e.preventDefault();
    Cookies.set('userData', JSON.stringify(formData)); // 사용자 데이터를 쿠키에 저장합니다.
    router.push('/'); // 메인 페이지로 리디렉션 합니다.
  };

  // 폼 내용이 변경될 때 실행되는 함수
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // 변경된 폼 데이터를 상태에 저장합니다.
  };

  return (
    <div className="welcome-container">
      <div className="welcome-box">
        <div className="logo-container">
          <img src="/image/logo.svg" alt="Logo" className="logo" />
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
              {/* 학과 옵션들 */}
              <option value="컴퓨터디자인과">컴퓨터디자인과</option>
              {/* ... */}
            </select>
          </div>

          {/* 특정 학과에만 보이는 학년 선택 영역 */}
          {(formData.department !== '판매관리과' && formData.department !== '사무행정과') && (
            <div className="form-group">
              <select name="grade" value={formData.grade} onChange={handleChange} required>
                <option value="" disabled>학년 선택</option>
                {/* 학년 옵션들 */}
                {/* ... */}
              </select>
            </div>
          )}

          {/* 특정 학과에만 보이는 반 선택 영역 */}
          {(formData.department !== '판매관리과' && formData.department !== '사무행정과') && (
            <div className="form-group">
              <select name="class" value={formData.class} onChange={handleChange} required>
                <option value="" disabled>반 선택</option>
                {/* 반 옵션들 */}
                {/* ... */}
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
