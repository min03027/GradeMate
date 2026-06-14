import { useRef, useState } from "react";
import { TERMS, recentYears } from "../utils/semester.js";

// 과목 직접 입력 폼
// 학기/학점/성적은 추가 후에도 그대로 유지해서, 같은 학기 과목을 빠르게 연달아 넣을 수 있게 함
function SubjectForm({ onAdd }) {
  const years = recentYears();

  const [name, setName] = useState("");
  const [year, setYear] = useState(String(years[0])); // 기본: 올해
  const [term, setTerm] = useState("1");
  const [credit, setCredit] = useState("3");
  const [grade, setGrade] = useState("A+");

  const nameRef = useRef(null); // 추가 후 과목명 칸으로 커서 다시 보내기

  // 성적 종류 (P는 패스과목)
  const gradeOptions = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F", "P"];

  const handleSubmit = (e) => {
    e.preventDefault(); // 폼 누르면 새로고침 되는거 막기

    if (name.trim() === "") {
      alert("과목명을 입력해주세요.");
      nameRef.current && nameRef.current.focus();
      return;
    }

    const semester = `${year}-${term}`; // "2024-1"
    onAdd(name.trim(), credit, grade, semester);

    // 과목명만 비우고 학기/학점/성적은 유지 → 다음 과목 바로 입력
    setName("");
    nameRef.current && nameRef.current.focus();
  };

  return (
    <form className="subject-form" onSubmit={handleSubmit}>
      <h2>과목 추가</h2>

      {/* 학기 (언제 들었는지) */}
      <div className="form-row">
        <label>학기</label>
        <div className="semester-inputs">
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <select value={term} onChange={(e) => setTerm(e.target.value)}>
            {TERMS.map((t) => (
              <option key={t.code} value={t.code}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 과목명 */}
      <div className="form-row">
        <label>과목명</label>
        <input
          ref={nameRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예) 자료구조"
          autoFocus
        />
      </div>

      {/* 학점 + 성적 한 줄에 */}
      <div className="form-row">
        <label>학점/성적</label>
        <div className="credit-grade-inputs">
          <input
            type="number"
            min="1"
            max="9"
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
          />
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="add-button">
        추가하기
      </button>
      <p className="form-hint">
        학기·학점·성적은 그대로 유지돼요. 과목명만 바꿔 빠르게 추가하세요. (Enter로
        추가)
      </p>
    </form>
  );
}

export default SubjectForm;
