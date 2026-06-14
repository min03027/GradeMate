import { useState } from "react";

// 과목 입력하는 폼
function SubjectForm({ onAdd }) {
  // 입력값들 state로 따로따로 관리
  const [name, setName] = useState("");
  const [credit, setCredit] = useState("3");
  const [grade, setGrade] = useState("A+");

  // 성적 종류 (select에 뿌릴거)
  const gradeOptions = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"];

  // 추가 버튼 눌렀을 때
  const handleSubmit = (e) => {
    e.preventDefault(); // 폼 누르면 새로고침 되는거 막기

    // 과목명 안 적었으면 그냥 멈춤
    if (name.trim() === "") {
      alert("과목명을 입력해주세요.");
      return;
    }

    // App한테 값 넘겨주기
    onAdd(name.trim(), credit, grade);

    // 다 넘겼으니까 입력창 다시 비우기
    setName("");
    setCredit("3");
    setGrade("A+");
  };

  return (
    <form className="subject-form" onSubmit={handleSubmit}>
      <h2>과목 추가</h2>

      {/* 과목명 */}
      <div className="form-row">
        <label>과목명</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예) 자료구조"
        />
      </div>

      {/* 학점 */}
      <div className="form-row">
        <label>학점</label>
        <input
          type="number"
          min="1"
          max="6"
          value={credit}
          onChange={(e) => setCredit(e.target.value)}
        />
      </div>

      {/* 성적 고르기 */}
      <div className="form-row">
        <label>성적</label>
        <select value={grade} onChange={(e) => setGrade(e.target.value)}>
          {gradeOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="add-button">
        추가하기
      </button>
    </form>
  );
}

export default SubjectForm;
