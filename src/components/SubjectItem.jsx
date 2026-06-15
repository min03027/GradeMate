import { useState } from "react";
import { formatSemester, TERMS, gradeOptions } from "../utils/semester.js";
import { isRepeatableCourse } from "../utils/credit.js";
import MajorToggle from "./MajorToggle.jsx";

const GRADE_CHOICES = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F", "P"];

// 과목 한 개 보여주는거 (수정 모드 포함)
function SubjectItem({
  subject,
  onDelete,
  onToggleDropped,
  onChangeCategory,
  onEdit,
  hasSecondMajor,
  secondLabel,
  maxGrade = 6,
}) {
  const [editing, setEditing] = useState(false);

  // 수정용 임시 값 (semester "2-1" → 학년/학기 분리)
  const [name, setName] = useState(subject.name);
  const [credit, setCredit] = useState(String(subject.credit));
  const [grade, setGrade] = useState(subject.grade);
  const [year, setYear] = useState(
    subject.semester ? subject.semester.split("-")[0] : "1"
  );
  const [term, setTerm] = useState(
    subject.semester ? subject.semester.split("-")[1] || "1" : "1"
  );

  const startEdit = () => {
    // 열 때 현재 값으로 초기화
    setName(subject.name);
    setCredit(String(subject.credit));
    setGrade(subject.grade);
    setYear(subject.semester ? subject.semester.split("-")[0] : "1");
    setTerm(subject.semester ? subject.semester.split("-")[1] || "1" : "1");
    setEditing(true);
  };

  const save = () => {
    if (name.trim() === "") {
      alert("과목명을 입력해주세요.");
      return;
    }
    onEdit(subject.id, {
      name: name.trim(),
      credit: Number(credit),
      grade,
      semester: `${year}-${term}`,
    });
    setEditing(false);
  };

  // ---- 수정 모드 ----
  if (editing) {
    const years = gradeOptions(maxGrade);
    return (
      <li className="subject-item editing">
        <div className="subject-edit">
          <div className="subject-edit-row">
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {years.map((g) => (
                <option key={g} value={g}>
                  {g}학년
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

          <input
            type="text"
            className="subject-edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="과목명"
          />

          <div className="subject-edit-row">
            <input
              type="number"
              min="0"
              max="9"
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
            />
            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              {GRADE_CHOICES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="subject-edit-actions">
            <button className="save-button" onClick={save}>
              저장
            </button>
            <button
              className="cancel-button"
              onClick={() => setEditing(false)}
            >
              취소
            </button>
          </div>
        </div>
      </li>
    );
  }

  // ---- 일반 모드 ----
  return (
    <li className={"subject-item" + (subject.dropped ? " dropped" : "")}>
      <div className="subject-info">
        {subject.semester && (
          <span className="subject-sem">{formatSemester(subject.semester)}</span>
        )}
        <span className="subject-name">{subject.name}</span>

        {/* 전공 / 교양 (다전공이면 주전공/다전공/교양) 토글 */}
        <MajorToggle
          value={subject.category || "major"}
          onChange={(v) => onChangeCategory(subject.id, v)}
          size="sm"
          multi={hasSecondMajor}
          secondLabel={secondLabel}
        />

        <span className="subject-detail">
          {subject.credit}학점 · {subject.grade}
        </span>

        {/* 재수강이거나 학점포기면 표시 (채플 등 반복 이수 과목은 재수강 아님) */}
        <span className="badges">
          {subject.retake && !isRepeatableCourse(subject.name) && (
            <span className="badge retake">재수강</span>
          )}
          {subject.dropped && (
            <span className="badge dropped-badge">학점포기</span>
          )}
        </span>
      </div>

      <div className="subject-actions">
        {/* 수정 버튼 */}
        <button className="edit-button" onClick={startEdit}>
          수정
        </button>

        {/* 학점포기 버튼 (누르면 글자 바뀜) */}
        <button
          className="drop-button"
          onClick={() => onToggleDropped(subject.id)}
        >
          {subject.dropped ? "포기취소" : "학점포기"}
        </button>

        {/* 삭제 버튼 */}
        <button className="delete-button" onClick={() => onDelete(subject.id)}>
          삭제
        </button>
      </div>
    </li>
  );
}

export default SubjectItem;
