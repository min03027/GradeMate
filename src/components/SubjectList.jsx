import SubjectItem from "./SubjectItem.jsx";

// 과목들 쭉 보여주는 곳
function SubjectList({ subjects, onDelete, onToggleDropped }) {
  return (
    <div className="subject-list">
      <h2>내 과목 목록</h2>

      {subjects.length === 0 ? (
        // 아직 과목 하나도 없을 때
        <p className="empty-message">아직 추가된 과목이 없습니다.</p>
      ) : (
        <ul>
          {/* 과목 하나씩 map으로 그리기 */}
          {subjects.map((subject) => (
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
