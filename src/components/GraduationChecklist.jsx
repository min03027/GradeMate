// 교양 영역별 필수 (영역당 1과목 이상 이수해야 함)
const AREAS = ["인성교양", "인문예술", "자연과학", "사회과학", "디지털 리터러시"];

// "소프트웨어와 미래사회"(구 컴퓨팅사고력)를 들었는지 과목 목록에서 자동 감지
function hasSwCourse(subjects) {
  return subjects.some((s) => {
    const name = (s.name || "").replace(/\s/g, ""); // 공백 무시하고 비교
    return (
      name.includes("소프트웨어와미래사회") ||
      name.includes("컴퓨팅사고력") ||
      name.includes("컴퓨팅사고")
    );
  });
}

// 졸업 필수 항목 점검 (체크 상태는 App이 갖고 있고 자동저장됨 → 여기선 props로 받음)
function GraduationChecklist({ subjects, chapelCount = 7, checklist, onChange }) {
  const areaDone = checklist.areas || {};
  const chapelDone = !!checklist.chapel;
  const smokingDone = !!checklist.smoking;

  // 자동 감지 항목
  const swDone = hasSwCourse(subjects);

  const toggleArea = (area) =>
    onChange({ ...checklist, areas: { ...areaDone, [area]: !areaDone[area] } });
  const setChapel = (v) => onChange({ ...checklist, chapel: v });
  const setSmoking = (v) => onChange({ ...checklist, smoking: v });

  // 아직 이수 안 한 항목 모으기 (경고문구용)
  const missing = [];
  AREAS.forEach((a) => {
    if (!areaDone[a]) missing.push(`${a} 영역`);
  });
  if (!swDone) missing.push("소프트웨어와 미래사회(구 컴퓨팅사고력)");
  if (!chapelDone) missing.push(`채플 ${chapelCount}회`);
  if (!smokingDone) missing.push("흡연·음주 예방교육");

  return (
    <div className="grad-check">
      <h2>✅ 졸업 필수 이수 점검</h2>

      {/* 경고 / 완료 배너 */}
      {missing.length > 0 ? (
        <div className="gc-warning">
          <p className="gc-warning-title">
            ⚠️ 아직 이수하지 않은 졸업 필수 항목이 있어요
          </p>
          <ul>
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="gc-warning-foot">위 항목을 이수해야 졸업할 수 있어요.</p>
        </div>
      ) : (
        <div className="gc-ok">🎉 졸업 필수 항목을 모두 이수했어요!</div>
      )}

      {/* 교양 영역별 필수 */}
      <h3 className="gc-subtitle">
        교양 영역별 필수 <span className="gc-sub-note">(영역당 1과목 이상)</span>
      </h3>
      <p className="gc-hint">
        과목명만으로는 영역 구분이 어려워, 이수한 영역을 직접 체크해 주세요.
      </p>
      <div className="gc-list">
        {AREAS.map((area) => (
          <label
            key={area}
            className={"gc-item" + (areaDone[area] ? " done" : "")}
          >
            <input
              type="checkbox"
              checked={!!areaDone[area]}
              onChange={() => toggleArea(area)}
            />
            <span className="gc-item-name">{area}</span>
            {!areaDone[area] && <span className="gc-badge">미이수</span>}
          </label>
        ))}
      </div>

      {/* 기타 졸업 필수 */}
      <h3 className="gc-subtitle">기타 졸업 필수</h3>
      <div className="gc-list">
        {/* 소프트웨어와 미래사회 — 입력한 과목에서 자동 감지 */}
        <div className={"gc-item auto" + (swDone ? " done" : "")}>
          <span className="gc-auto-icon">{swDone ? "✅" : "⬜"}</span>
          <span className="gc-item-name">
            소프트웨어와 미래사회 <small>(구 컴퓨팅사고력)</small>
          </span>
          <span className={"gc-badge" + (swDone ? " ok" : "")}>
            {swDone ? "이수" : "미이수"}
          </span>
        </div>

        {/* 채플 — 체크박스 */}
        <label className={"gc-item" + (chapelDone ? " done" : "")}>
          <input
            type="checkbox"
            checked={chapelDone}
            onChange={() => setChapel(!chapelDone)}
          />
          <span className="gc-item-name">채플 {chapelCount}회</span>
          {!chapelDone && <span className="gc-badge">미이수</span>}
        </label>

        {/* 흡연·음주 예방교육 — 수업이 아니라 체크박스 */}
        <label className={"gc-item" + (smokingDone ? " done" : "")}>
          <input
            type="checkbox"
            checked={smokingDone}
            onChange={() => setSmoking(!smokingDone)}
          />
          <span className="gc-item-name">
            흡연·음주 예방교육 <small>(수업 아님 · 이수했으면 체크)</small>
          </span>
          {!smokingDone && <span className="gc-badge">미이수</span>}
        </label>
      </div>
    </div>
  );
}

export default GraduationChecklist;
