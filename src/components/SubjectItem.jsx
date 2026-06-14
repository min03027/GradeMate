import { formatSemester } from "../utils/semester.js";

// 과목 한 개 보여주는거
function SubjectItem({ subject, onDelete, onToggleDropped, onChangeCategory }) {
  const isMajor = (subject.category || "major") === "major";
  return (
    <li className={"subject-item" + (subject.dropped ? " dropped" : "")}>
      <div className="subject-info">
        {subject.semester && (
          <span className="subject-sem">{formatSemester(subject.semester)}</span>
        )}
        <span className="subject-name">{subject.name}</span>

        {/* 전공 여부 (체크하면 전공, 해제하면 교양) */}
        <label className={"subject-major" + (isMajor ? " on" : "")}>
          <input
            type="checkbox"
            checked={isMajor}
            onChange={(e) =>
              onChangeCategory(subject.id, e.target.checked ? "major" : "liberal")
            }
          />
          전공
        </label>

        <span className="subject-detail">
          {subject.credit}학점 · {subject.grade}
        </span>

        {/* 재수강이거나 학점포기면 표시 */}
        <span className="badges">
          {subject.retake && <span className="badge retake">재수강</span>}
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
