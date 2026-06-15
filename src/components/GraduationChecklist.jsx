import { countChapel } from "../utils/credit.js";
import { basicLiberalCourses } from "../data/graduationData.js";

// 교양 영역별 필수 (영역당 1과목 이상 이수해야 함)
const AREAS = ["인성교양", "인문예술", "자연과학", "사회과학", "디지털 리터러시"];

// 과목명 비교용 정규화: 공백·괄호 제거, 소문자, 로마숫자 I/II/III → 1/2/3
function normName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/[()]/g, "")
    .replace(/iii|ⅲ/g, "3")
    .replace(/ii|ⅱ/g, "2")
    .replace(/i|ⅰ/g, "1");
}

// 입력한 과목 중에 이 필수과목을 이수했는지 (F·학점포기 제외)
function hasCourse(subjects, course) {
  const keys = [course.name, ...(course.aliases || [])].map(normName);
  return subjects.some((s) => {
    if (s.dropped || s.grade === "F") return false;
    const n = normName(s.name);
    return keys.some((k) => k && n.includes(k));
  });
}

// 졸업 필수 항목 점검 (체크 상태는 App이 갖고 있고 자동저장됨 → 여기선 props로 받음)
function GraduationChecklist({
  subjects,
  chapelCount = 7,
  entranceYear,
  checklist,
  onChange,
}) {
  const areaDone = checklist.areas || {};
  const smokingDone = !!checklist.smoking;

  // 학번에 맞는 기초교양 필수과목 + 이수 여부 자동 판정
  const basicCourses = basicLiberalCourses(entranceYear);
  const basicStatus = basicCourses.map((c) => ({
    ...c,
    done: hasCourse(subjects, c),
  }));

  // 채플: 입력한 횟수를 세서 필요 횟수 채우면 자동 이수 (수동 체크도 허용)
  const chapelTaken = countChapel(subjects);
  const chapelByCount = chapelTaken >= chapelCount;
  const chapelDone = chapelByCount || !!checklist.chapel;

  const toggleArea = (area) =>
    onChange({ ...checklist, areas: { ...areaDone, [area]: !areaDone[area] } });
  const setChapel = (v) => onChange({ ...checklist, chapel: v });
  const setSmoking = (v) => onChange({ ...checklist, smoking: v });

  // 아직 이수 안 한 항목 모으기 (경고문구용)
  const missing = [];
  basicStatus.forEach((c) => {
    if (!c.done) missing.push(c.name);
  });
  AREAS.forEach((a) => {
    if (!areaDone[a]) missing.push(`${a} 영역`);
  });
  if (!chapelDone) missing.push(`채플 (${chapelTaken}/${chapelCount}회)`);
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

      {/* 교양필수 - 기초교양 (학번별 필수과목, 입력 과목에서 자동 감지) */}
      <h3 className="gc-subtitle">
        교양필수 · 기초교양{" "}
        <span className="gc-sub-note">
          ({entranceYear != null ? `${entranceYear}학번 기준 · ` : ""}자동 감지)
        </span>
      </h3>
      <p className="gc-hint">
        입력한 과목에서 자동으로 찾아요. 과목명이 달라 못 찾으면 이름을 맞춰
        입력해 주세요.
      </p>
      <div className="gc-list">
        {basicStatus.map((c) => (
          <div
            key={c.name}
            className={"gc-item auto" + (c.done ? " done" : "")}
          >
            <span className="gc-auto-icon">{c.done ? "✅" : "⬜"}</span>
            <span className="gc-item-name">
              {c.name} <small>({c.credit}학점)</small>
            </span>
            <span className={"gc-badge" + (c.done ? " ok" : "")}>
              {c.done ? "이수" : "미이수"}
            </span>
          </div>
        ))}
      </div>

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
        {/* 채플 — 입력 횟수로 자동 카운트, 필요 횟수 채우면 자동 체크 */}
        <label className={"gc-item" + (chapelDone ? " done" : "")}>
          <input
            type="checkbox"
            checked={chapelDone}
            disabled={chapelByCount}
            onChange={() => setChapel(!checklist.chapel)}
          />
          <span className="gc-item-name">
            채플 {chapelCount}회 <small>({chapelTaken}/{chapelCount}회 입력됨)</small>
          </span>
          {chapelByCount ? (
            <span className="gc-badge ok">자동 이수</span>
          ) : (
            !chapelDone && <span className="gc-badge">미이수</span>
          )}
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
