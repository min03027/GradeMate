import { useState } from "react";
import { gpaStats, simulateTargetGPA, gradePointMap } from "../utils/credit.js";

// 목표 평점 시뮬레이션 (입력값은 실제 학점에 저장되지 않음)
const PRESETS = [4.5, 4.0, 3.5, 3.0];
// 직접 조합에 쓸 성적들
const MIX_GRADES = ["A+", "A", "B+", "B", "C+", "C"];

function SimulationCard({ subjects }) {
  const [target, setTarget] = useState("");
  const [creditPerCourse, setCreditPerCourse] = useState(3);
  // 직접 조합: 성적별 과목 수 { "A+": 0, "A": 0, ... }
  const [mix, setMix] = useState({});

  const { gpa: currentGPA, gpaCredit, totalPoint } = gpaStats(subjects);
  const hasGrades = gpaCredit > 0;

  const targetNum = parseFloat(target);
  const valid = !isNaN(targetNum) && targetNum > 0 && targetNum <= 4.5;
  const sim = valid
    ? simulateTargetGPA(subjects, targetNum, creditPerCourse)
    : null;

  // 직접 조합 결과: 추가 과목 반영한 예상 평점
  const bumpMix = (g, delta) =>
    setMix((prev) => {
      const next = Math.max(0, (prev[g] || 0) + delta);
      return { ...prev, [g]: next };
    });
  const resetMix = () => setMix({});

  let addPoint = 0;
  let addCredit = 0;
  let addCount = 0;
  MIX_GRADES.forEach((g) => {
    const n = mix[g] || 0;
    addCount += n;
    addCredit += n * creditPerCourse;
    addPoint += gradePointMap[g] * n * creditPerCourse;
  });
  const projTotalCredit = gpaCredit + addCredit;
  const projGPA =
    projTotalCredit === 0 ? null : (totalPoint + addPoint) / projTotalCredit;
  const projMeetsTarget = valid && projGPA !== null && projGPA >= targetNum;

  return (
    <div className="sim-card">
      <h2>🎯 목표 평점 시뮬레이션</h2>
      <p className="sim-note">
        목표 평점을 입력하면 앞으로 어떤 성적을 몇 과목 받아야 하는지 알려줘요.
        <br />
        (여기 입력한 값은 실제 과목·학점에 저장되지 않아요.)
      </p>

      <div className="sim-current">
        현재 평점{" "}
        <strong>{hasGrades ? currentGPA.toFixed(2) : "—"}</strong> / 4.5
        {!hasGrades && (
          <span className="sim-current-sub"> · 아직 평점 낼 과목이 없어요</span>
        )}
      </div>

      <div className="sim-inputs">
        <label className="sim-field">
          <span>목표 평점</span>
          <input
            type="number"
            min="0"
            max="4.5"
            step="0.01"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="예: 4.0"
          />
        </label>
        <label className="sim-field">
          <span>한 과목당 학점</span>
          <select
            value={creditPerCourse}
            onChange={(e) => setCreditPerCourse(Number(e.target.value))}
          >
            <option value={1}>1학점</option>
            <option value={2}>2학점</option>
            <option value={3}>3학점</option>
          </select>
        </label>
      </div>

      {/* 빠른 선택 */}
      <div className="sim-presets">
        {PRESETS.map((v) => (
          <button
            key={v}
            type="button"
            className={"sim-preset" + (target === String(v) ? " on" : "")}
            onClick={() => setTarget(String(v))}
          >
            {v.toFixed(1)}
          </button>
        ))}
      </div>

      {/* 안내 / 결과 */}
      {target === "" && (
        <p className="sim-msg">목표 평점을 입력해 보세요.</p>
      )}
      {target !== "" && !valid && (
        <p className="sim-msg warn">0 ~ 4.5 사이의 값으로 입력해 주세요.</p>
      )}

      {sim && sim.alreadyMet && (
        <p className="sim-msg ok">
          🎉 현재 평점이 이미 목표({targetNum.toFixed(2)})를 넘었어요! 지금 성적을
          유지하면 됩니다.
        </p>
      )}

      {sim && !sim.alreadyMet && (
        <div className="sim-results">
          <p className="sim-results-head">
            목표 <strong>{targetNum.toFixed(2)}</strong> 달성하려면 앞으로
            <span className="sim-assume"> (한 과목 {creditPerCourse}학점 기준)</span>
          </p>
          <ul>
            {sim.results.map((r) => (
              <li
                key={r.grade}
                className={"sim-row" + (r.possible ? "" : " na")}
              >
                <span className="sim-grade">{r.grade}</span>
                {r.possible ? (
                  <span className="sim-count">
                    <strong>{r.count}과목</strong>
                    <small> · {r.count * creditPerCourse}학점</small>
                  </span>
                ) : (
                  <span className="sim-count na-text">
                    이 성적만으로는 목표 도달이 어려워요
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="sim-foot">
            ※ 앞으로 듣는 과목을 모두 같은 성적으로 받는다고 가정했을 때 필요한
            최소 과목 수예요.
          </p>
        </div>
      )}

      {/* ── 직접 조합 ── */}
      <div className="sim-mix">
        <div className="sim-mix-head">
          <h3>직접 조합해보기</h3>
          {addCount > 0 && (
            <button type="button" className="sim-mix-reset" onClick={resetMix}>
              초기화
            </button>
          )}
        </div>
        <p className="sim-mix-desc">
          A+를 줄이고 A를 늘리는 식으로 직접 조합해서 예상 평점을 확인해 보세요.
        </p>

        <div className="sim-mix-grid">
          {MIX_GRADES.map((g) => (
            <div className="sim-mix-row" key={g}>
              <span className="sim-mix-grade">{g}</span>
              <div className="sim-stepper">
                <button
                  type="button"
                  onClick={() => bumpMix(g, -1)}
                  disabled={(mix[g] || 0) === 0}
                  aria-label={g + " 줄이기"}
                >
                  −
                </button>
                <span className="sim-mix-num">{mix[g] || 0}</span>
                <button
                  type="button"
                  onClick={() => bumpMix(g, 1)}
                  aria-label={g + " 늘리기"}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          className={
            "sim-proj" +
            (valid ? (projMeetsTarget ? " ok" : " no") : "")
          }
        >
          <div className="sim-proj-main">
            <span className="sim-proj-label">예상 평점</span>
            <span className="sim-proj-value">
              {projGPA === null ? "—" : projGPA.toFixed(2)}
            </span>
          </div>
          <div className="sim-proj-sub">
            추가 {addCount}과목 · {addCredit}학점
            {valid && projGPA !== null && (
              <span className="sim-proj-judge">
                {projMeetsTarget
                  ? ` · 목표 ${targetNum.toFixed(2)} 달성 ✓`
                  : ` · 목표 ${targetNum.toFixed(2)}까지 ${(
                      targetNum - projGPA
                    ).toFixed(2)} 부족`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulationCard;
