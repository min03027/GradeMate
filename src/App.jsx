import { useState, useEffect } from "react";
import Login from "./components/Login.jsx";
import Onboarding from "./components/Onboarding.jsx";
import SubjectInput from "./components/SubjectInput.jsx";
import SubjectList from "./components/SubjectList.jsx";
import GPAResult from "./components/GPAResult.jsx";
import GraduationRequirement from "./components/GraduationRequirement.jsx";
import GraduationChecklist from "./components/GraduationChecklist.jsx";
import { getRequirement } from "./data/graduationData.js";
import {
  loadProfile,
  saveProfile,
  getLastStudentId,
  clearLast,
} from "./utils/storage.js";
import "./App.css";

const DEFAULT_CHECKLIST = { areas: {}, chapel: false, smoking: false };

// 마지막으로 쓰던 학번의 프로필을 읽어서 초기값으로 (자동 로그인)
const lastId = getLastStudentId();
const lastProfile = lastId ? loadProfile(lastId) : null;

function App() {
  // 로그인된 학번 (없으면 로그인 화면)
  const [currentStudentId, setCurrentStudentId] = useState(lastId);
  const [profileName, setProfileName] = useState(
    (lastProfile && lastProfile.name) || ""
  );

  // 저장 대상 상태들
  const [setup, setSetup] = useState((lastProfile && lastProfile.setup) || null);
  const [subjects, setSubjects] = useState(
    (lastProfile && lastProfile.subjects) || []
  );
  const [checklist, setChecklist] = useState(
    (lastProfile && lastProfile.checklist) || DEFAULT_CHECKLIST
  );
  const [editingSetup, setEditingSetup] = useState(false);

  // 값이 바뀔 때마다 현재 학번 프로필에 자동 저장
  useEffect(() => {
    if (!currentStudentId) return;
    saveProfile(currentStudentId, {
      name: profileName,
      setup,
      subjects,
      checklist,
    });
  }, [currentStudentId, profileName, setup, subjects, checklist]);

  // 학번으로 로그인/시작
  const handleLogin = (studentId, name) => {
    const prof = loadProfile(studentId);
    if (prof) {
      // 기존 프로필 이어서
      setSetup(prof.setup || null);
      setSubjects(prof.subjects || []);
      setChecklist(prof.checklist || DEFAULT_CHECKLIST);
      setProfileName(prof.name || name || "");
    } else {
      // 새 프로필
      setSetup(null);
      setSubjects([]);
      setChecklist(DEFAULT_CHECKLIST);
      setProfileName(name || "");
    }
    setEditingSetup(false);
    setCurrentStudentId(studentId);
  };

  // 로그아웃 (데이터는 보존, 로그인 화면으로)
  const handleLogout = () => {
    clearLast();
    setCurrentStudentId(null);
  };

  // 과목 추가하는 함수 (Form에서 호출함)
  const addSubject = (name, credit, grade, semester, category) => {
    const isRetake = subjects.some((s) => s.name === name);

    const newSubject = {
      id: Date.now(),
      name: name,
      credit: Number(credit),
      grade: grade,
      semester: semester || "",
      category: category || "major",
      retake: isRetake,
      dropped: false,
    };

    setSubjects([...subjects, newSubject]);
  };

  // 성적표에서 여러 과목 한꺼번에 추가 (replace=true면 기존거 비우고 넣음)
  const addManySubjects = (items, replace) => {
    setSubjects((prev) => {
      const result = replace ? [] : [...prev];

      items.forEach((item, i) => {
        const isRetake = result.some((s) => s.name === item.name);
        result.push({
          id: Date.now() + i,
          name: item.name,
          credit: Number(item.credit),
          grade: item.grade,
          semester: item.semester || "",
          category: item.category || "major",
          retake: isRetake,
          dropped: false,
        });
      });

      return result;
    });
  };

  // 과목 삭제
  const deleteSubject = (id) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  // 학점포기 토글
  const toggleDropped = (id) => {
    setSubjects(
      subjects.map((s) => (s.id === id ? { ...s, dropped: !s.dropped } : s))
    );
  };

  // 과목 구분(전공/교양/자유) 변경
  const changeCategory = (id, category) => {
    setSubjects(
      subjects.map((s) => (s.id === id ? { ...s, category } : s))
    );
  };

  // 1) 로그인 안 했으면 → 로그인 화면
  if (!currentStudentId) {
    return <Login onLogin={handleLogin} />;
  }

  // 2) 졸업요건 설정 안 했거나 변경 중이면 → 온보딩
  if (!setup || editingSetup) {
    return (
      <Onboarding
        initial={setup}
        onComplete={(value) => {
          setSetup(value);
          setEditingSetup(false);
        }}
      />
    );
  }

  // 3) 메인
  const requirement = getRequirement(setup);
  // 1~6학년 모두 선택 가능 (건축 5년제·약학 6년제 등 대비)
  const maxGrade = 6;

  return (
    <div className="app">
      {/* 사용자 바 (학번/이름 + 로그아웃) */}
      <div className="app-userbar">
        <span className="app-user">
          {profileName ? `${profileName} · ` : ""}
          {currentStudentId} 님
        </span>
        <button type="button" className="app-logout" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      <header className="app-header">
        <h1>🎓 GradeMate</h1>
        <p>삼육대를 위한 학점 관리 서비스</p>
      </header>

      <main className="app-main">
        {/* 첫 화면에서 고른 입학유형/학과 기준 졸업요건 */}
        <GraduationRequirement
          setup={setup}
          subjects={subjects}
          onEdit={() => setEditingSetup(true)}
        />

        {/* 졸업 필수 항목 점검 */}
        <GraduationChecklist
          subjects={subjects}
          chapelCount={(requirement && requirement.chapel) || 7}
          checklist={checklist}
          onChange={setChecklist}
        />

        {/* 과목 입력 (직접 입력 / 성적표 불러오기 탭) */}
        <SubjectInput
          onAdd={addSubject}
          onAddMany={addManySubjects}
          maxGrade={maxGrade}
        />

        {/* 평균학점, 이수학점 결과 */}
        <GPAResult subjects={subjects} />

        {/* 과목 목록 */}
        <SubjectList
          subjects={subjects}
          onDelete={deleteSubject}
          onToggleDropped={toggleDropped}
          onChangeCategory={changeCategory}
        />
      </main>

      <footer className="app-footer">
        <p>산학연계 프로젝트 · GradeMate</p>
      </footer>
    </div>
  );
}

export default App;
