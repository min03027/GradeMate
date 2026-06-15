import { formatSemester } from "../utils/semester.js";
import { isRepeatableCourse } from "../utils/credit.js";
import MajorToggle from "./MajorToggle.jsx";

// 과목 한 개 보여주는거
function SubjectItem({ subject, onDelete, onToggleDropped, onChangeCategory }) {
  return (
    <li className={"subject-item" + (subject.dropped ? " dropped" : "")}>
      <div className="subject-info">
        {subject.semester && (
          <span className="subject-sem">{formatSemester(subject.semester)}</span>
        )}
        <span className="subject-name">{subject.name}</span>

        {/* 전공 / 교양 토글 */}
        <MajorToggle
          value={subject.category || "major"}
          onChange={(v) => onChangeCategory(subject.id, v)}
          size="sm"
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
