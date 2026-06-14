import { useState } from "react";
import SubjectInput from "./components/SubjectInput.jsx";
import SubjectList from "./components/SubjectList.jsx";
import GPAResult from "./components/GPAResult.jsx";
import GraduationRequirement from "./components/GraduationRequirement.jsx";
import GraduationChecklist from "./components/GraduationChecklist.jsx";
import "./App.css";

function App() {
  // 과목들 여기에 다 저장함
  const [subjects, setSubjects] = useState([]);

  // 과목 추가하는 함수 (Form에서 호출함)
  const addSubject = (name, credit, grade) => {
    // 같은 과목명이 이미 있으면 재수강으로 처리
    const isRetake = subjects.some((s) => s.name === name);

    const newSubject = {
      id: Date.now(), // id는 그냥 시간으로 함 (겹칠일 거의 없음)
      name: name,
      credit: Number(credit), // 숫자로 바꿔서 넣기
      grade: grade,
      retake: isRetake,
      dropped: false, // 처음엔 학점포기 아님
    };

    // 원래 있던거 + 새거
    setSubjects([...subjects, newSubject]);
  };

  // 성적표에서 여러 과목 한꺼번에 추가 (replace=true면 기존거 비우고 넣음)
  const addManySubjects = (items, replace) => {
    setSubjects((prev) => {
      const result = replace ? [] : [...prev];

      items.forEach((item, i) => {
        // 같은 과목명이 (기존+이번 배치에) 이미 있으면 재수강 처리
        const isRetake = result.some((s) => s.name === item.name);

        result.push({
          id: Date.now() + i, // 한꺼번에 넣을 때 id 안 겹치게 +i
          name: item.name,
          credit: Number(item.credit),
          grade: item.grade,
          retake: isRetake,
          dropped: false,
        });
      });

      return result;
    });
  };

  // 과목 삭제 (누른거 빼고 다시 저장)
  const deleteSubject = (id) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  // 학점포기 켰다 껐다
  const toggleDropped = (id) => {
    setSubjects(
      subjects.map((s) =>
        s.id === id ? { ...s, dropped: !s.dropped } : s
      )
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎓 GradeMate</h1>
        <p>삼육대를 위한 학점 관리 서비스</p>
      </header>

      <main className="app-main">
        {/* 학과/입학유형 골라서 졸업요건 자동 설정 */}
        <GraduationRequirement subjects={subjects} />

        {/* 졸업 필수 항목(교양 영역, 채플 등) 점검 */}
        <GraduationChecklist subjects={subjects} />

        {/* 과목 입력 (직접 입력 / 성적표 불러오기 탭) */}
        <SubjectInput onAdd={addSubject} onAddMany={addManySubjects} />

        {/* 평균학점, 이수학점 결과 */}
        <GPAResult subjects={subjects} />

        {/* 과목 목록 */}
        <SubjectList
          subjects={subjects}
          onDelete={deleteSubject}
          onToggleDropped={toggleDropped}
        />
      </main>

      <footer className="app-footer">
        <p>산학연계 프로젝트 · GradeMate</p>
      </footer>
    </div>
  );
}

export default App;
