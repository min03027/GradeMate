import { useState } from "react";
import { listProfiles } from "../utils/storage.js";

// 학번으로 시작하는 첫 화면 (이 기기에 프로필별 저장)
function Login({ onLogin }) {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const profiles = listProfiles();

  const submit = (e) => {
    e.preventDefault();
    const id = studentId.trim();
    if (!id) {
      alert("학번을 입력해주세요.");
      return;
    }
    onLogin(id, name.trim());
  };

  return (
    <div className="onboarding">
      <div className="onb-card">
        <div className="onb-hero">
          <div className="onb-logo">🎓</div>
          <h1 className="onb-title">GradeMate</h1>
          <p className="onb-tagline">학번으로 시작하면 이 기기에 저장돼요</p>
        </div>

        <form onSubmit={submit}>
          <div className="onb-section">
            <p className="onb-label">학번</p>
            <input
              className="login-input"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="예) 202012345"
              inputMode="numeric"
              autoFocus
            />
          </div>

          <div className="onb-section">
            <p className="onb-label">이름 (선택)</p>
            <input
              className="login-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예) 김민"
            />
          </div>

          <button type="submit" className="onb-start">
            시작하기 →
          </button>
        </form>

        {/* 이미 저장된 프로필이 있으면 바로 이어서 */}
        {profiles.length > 0 && (
          <div className="login-profiles">
            <p className="login-profiles-label">이어서 하기</p>
            {profiles.map((p) => (
              <button
                key={p.studentId}
                type="button"
                className="login-profile-btn"
                onClick={() => onLogin(p.studentId, p.name)}
              >
                <span>
                  {p.name ? `${p.name} · ` : ""}
                  {p.studentId}
                </span>
                <span className="login-profile-go">→</span>
              </button>
            ))}
          </div>
        )}

        <p className="login-note">
          ⚠️ 데이터는 이 브라우저(기기)에만 저장됩니다. 학번은 비밀번호가 아니니
          공용 PC에서는 주의하세요.
        </p>
      </div>
    </div>
  );
}

export default Login;
