import SubjectItem from "./SubjectItem.jsx";
import { semesterSortKey } from "../utils/semester.js";

// 과목들 쭉 보여주는 곳
function SubjectList({ subjects, onDelete, onToggleDropped }) {
  // 학기 빠른 순으로 정렬 (학기 없는 건 맨 뒤). 원본은 안 건드리게 복사 후 정렬
  const sorted = [...subjects].sort((a, b) => {
    const ka = semesterSortKey(a.semester);
    const kb = semesterSortKey(b.semester);
    if (ka < kb) return -1;
    if (ka > kb) return 1;
    return a.id - b.id; // 같은 학기면 추가한 순서대로
  });

  return (
    <div className="subject-list">
      <h2>내 과목 목록</h2>

      {subjects.length === 0 ? (
        // 아직 과목 하나도 없을 때
        <p className="empty-message">아직 추가된 과목이 없습니다.</p>
      ) : (
        <ul>
          {/* 과목 하나씩 map으로 그리기 */}
          {sorted.map((subject) => (
            <SubjectItem
              key={subject.id} // key는 id로 (안 넣으면 경고 뜸)
              subject={subject}
              onDelete={onDelete}
              onToggleDropped={onToggleDropped}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default SubjectList;
