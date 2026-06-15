import { useState } from "react";
import SubjectItem from "./SubjectItem.jsx";
import { formatSemester } from "../utils/semester.js";
import { groupBySemester, calcGPA, gradePointMap } from "../utils/credit.js";

// 과목들을 학기별로 묶어서 접고 펼 수 있게 보여주는 곳
function SubjectList({
  subjects,
  onDelete,
  onToggleDropped,
  onChangeCategory,
  onEdit,
  hasSecondMajor,
  secondLabel,
  maxGrade,
}) {
  // 접힌(collapsed) 학기들 모음. 기본은 다 펼친 상태
  const [collapsed, setCollapsed] = useState({});
  const toggle = (key) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  // 학기별 그룹 (학기 빠른 순, 미지정은 맨 뒤)
  const groups = groupBySemester(subjects);

  return (
    <div className="subject-list">
      <h2>내 과목 목록</h2>

      {subjects.length === 0 ? (
        <p className="empty-message">아직 추가된 과목이 없습니다.</p>
      ) : (
        <div className="sem-groups">
          {groups.map((group) => {
            const key = group.semester || "none";
            const isOpen = !collapsed[key];
            const title = group.semester
              ? formatSemester(group.semester)
              : "학기 미지정";

            // 이 학기에 평점 낼 과목이 있으면 학기 평점 표시
            const hasGraded = group.subjects.some(
              (s) => !s.dropped && typeof gradePointMap[s.grade] === "number"
            );
            const semGpa = hasGraded ? calcGPA(group.subjects) : null;

            // 같은 학기 안에서도 추가 순서대로
            const items = [...group.subjects].sort((a, b) => a.id - b.id);

            return (
              <section className="sem-group" key={key}>
                <button
                  type="button"
                  className="sem-head"
                  onClick={() => toggle(key)}
                  aria-expanded={isOpen}
                >
                  <span className={"sem-caret" + (isOpen ? " open" : "")}>▶</span>
                  <span className="sem-title">{title}</span>
                  <span className="sem-meta">
                    {semGpa !== null && (
                      <span className="sem-gpa">평점 {semGpa.toFixed(2)}</span>
                    )}
                    <span className="sem-count">{items.length}과목</span>
                  </span>
                </button>

                {isOpen && (
                  <ul className="sem-body">
                    {items.map((subject) => (
                      <SubjectItem
                        key={subject.id}
                        subject={subject}
                        onDelete={onDelete}
                        onToggleDropped={onToggleDropped}
                        onChangeCategory={onChangeCategory}
                        onEdit={onEdit}
                        hasSecondMajor={hasSecondMajor}
                        secondLabel={secondLabel}
                        maxGrade={maxGrade}
                      />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SubjectList;
