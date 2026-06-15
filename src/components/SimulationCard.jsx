import { useState } from "react";
import {
  gpaStats,
  gradePointMap,
  requiredAvgForCourses,
} from "../utils/credit.js";

// 직접 조합에 쓸 성적들
const MIX_GRADES = ["A+", "A", "B+", "B", "C+", "C"];

// 빈 시뮬레이션 시나리오 하나 만들기
function makeSim(index) {
  return {
    id: Date.now() + index,
    name: `시뮬레이션 ${index}`,
    target: "",
    creditPerCourse: 3,
    planned: "", // 앞으로 들을 과목 수
    mix: {}, // 성적별 과목 수
  };
}

// 목표 평점 시뮬레이션 (시나리오로 저장됨 · 실제 학점엔 영향 없음)
function SimulationCard({ subjects, simulations, onChange }) {
  const [activeId, setActiveId] = useState(
    simulations[0] ? simulations[0].id : null
  );

  const { gpa: currentGPA, gpaCredit, totalPoint } = gpaStats(subjects);
  const hasGrades = gpaCredit > 0;

  const active =
    simulations.find((s) => s.id === activeId) || simulations[0] || null;

  // ── 시나리오 관리 ──
  const addSim = () => {
    const sim = makeSim(simulations.length + 1);
    onChange([...simulations, sim]);
    setActiveId(sim.id);
  };
  const removeSim = (id) => {
    const next = simulations.filter((s) => s.id !== id);
    onChange(next);
    if (id === activeId) setActiveId(next[0] ? next[0].id : null);
  };
  const patchActive = (patch) =>
    onChange(
      simulations.map((s) => (s.id === active.id ? { ...s, ...patch } : s))
    );

  // 시나리오가 하나도 없을 때
  if (!active) {
    return (
      <div className="sim-card">
        <h2>🎯 목표 평점 시뮬레이션</h2>
        <p className="sim-note">
          목표 평점을 정하고, 앞으로 받을 성적을 조합해 보세요. 시나리오는 저장돼서
          나중에 다시 볼 수 있어요. (실제 과목·학점엔 영향 없음)
        </p>
        <button type="button" className="sim-add-first" onClick={addSim}>
          + 새 시뮬레이션 만들기
        </button>
      </div>
    );
  }

  // ── 활성 시나리오 값 ──
  const target = active.target;
  const creditPerCourse = active.creditPerCourse || 3;
  const planned = active.planned;
  const mix = active.mix || {};

  const targetNum = parseFloat(target);
  const validTarget = !isNaN(targetNum) && targetNum > 0 && targetNum <= 4.5;

  // (1) 앞으로 N과목 들을 때 필요한 평균 성적
  const plannedNum = parseInt(planned, 10);
  const validPlanned = !isNaN(plannedNum) && plannedNum > 0;
  const avgReq =
    validTarget && validPlanned
      ? requiredAvgForCourses(subjects, targetNum, creditPerCourse, plannedNum)
      : null;

  // (2) 직접 조합 → 예상 평점
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
  const projMeets = validTarget && projGPA !== null && projGPA >= targetNum;

  const bumpMix = (g, d) => {
    const next = Math.max(0, (mix[g] || 0) + d);
    patchActive({ mix: { ...mix, [g]: next } });
  };

  return (
    <div className="sim-card">
      <h2>🎯 목표 평점 시뮬레이션</h2>

      {/* 시나리오 탭 */}
      <div className="sim-tabs">
        {simulations.map((s) => (
          <button
            key={s.id}
            type="button"
            className={"sim-tab" + (s.id === active.id ? " active" : "")}
            onClick={() => setActiveId(s.id)}
          >
            {s.name}
          </button>
        ))}
        <button type="button" className="sim-tab add" onClick={addSim}>
          + 새로
        </button>
      </div>

      {/* 시나리오 이름 + 삭제 */}
      <div className="sim-name-row">
        <input
          className="sim-name-input"
          value={active.name}
          onChange={(e) => patchActive({ name: e.target.value })}
          placeholder="시뮬레이션 이름"
        />
        <button
          type="button"
          className="sim-del"
          onClick={() => removeSim(active.id)}
        >
          삭제
        </button>
      </div>

      <div className="sim-current">
        현재 평점 <strong>{hasGrades ? currentGPA.toFixed(2) : "—"}</strong> / 4.5
        {!hasGrades && (
          <span className="sim-current-sub"> · 아직 평점 낼 과목이 없어요</span>
        )}
      </div>

      {/* 입력값 */}
      <div className="sim-inputs">
        <label className="sim-field">
          <span>목표 평점</span>
          <input
            type="number"
            min="0"
            max="4.5"
            step="0.01"
            value={target}
            onChange={(e) => patchActive({ target: e.target.value })}
            placeholder="예: 4.0"
          />
        </label>
        <label className="sim-field">
          <span>앞으로 들을 과목 수</span>
          <input
            type="number"
            min="0"
            step="1"
            value={planned}
            onChange={(e) => patchActive({ planned: e.target.value })}
            placeholder="예: 8"
          />
        </label>
        <label className="sim-field">
          <span>한 과목당 학점</span>
          <select
            value={creditPerCourse}
            onChange={(e) =>
              patchActive({ creditPerCourse: Number(e.target.value) })
            }
          >
            <option value={1}>1학점</option>
            <option value={2}>2학점</option>
            <option value={3}>3학점</option>
          </select>
        </label>
      </div>

      {/* (1) N과목 → 필요 평균 성적 */}
      {!validTarget ? (
        <p className="sim-msg">목표 평점을 입력해 보세요.</p>
      ) : !validPlanned ? (
        <p className="sim-msg">
          앞으로 들을 과목 수를 입력하면, 필요한 평균 성적을 알려드려요.
        </p>
      ) : (
        <div
          className={
            "sim-avg" +
            (avgReq.trivial ? " ok" : avgReq.possible ? "" : " no")
          }
        >
          {avgReq.trivial ? (
            <p>
              🎉 앞으로 <b>{plannedNum}과목</b>은 어떤 성적이어도 목표{" "}
              {targetNum.toFixed(2)} 달성 가능해요.
            </p>
          ) : avgReq.possible ? (
            <p>
              앞으로 <b>{plannedNum}과목</b>({plannedNum * creditPerCourse}학점)을
              들어 목표 {targetNum.toFixed(2)}를 맞추려면, 평균{" "}
              <b className="sim-avg-grade">{avgReq.point.toFixed(2)}</b> (약{" "}
              {avgReq.grade} 이상) 받아야 해요.
            </p>
          ) : (
            <p>
              앞으로 {plannedNum}과목으로는 목표 {targetNum.toFixed(2)} 달성이
              어려워요. (평균 {avgReq.point.toFixed(2)} 필요 · 최대 4.5) 과목 수를
              늘려보세요.
            </p>
          )}
        </div>
      )}

      {/* (2) 직접 조합 */}
      <div className="sim-mix">
        <div className="sim-mix-head">
          <h3>직접 조합해보기</h3>
          {addCount > 0 && (
            <button
              type="button"
              className="sim-mix-reset"
              onClick={() => patchActive({ mix: {} })}
            >
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
            "sim-proj" + (validTarget ? (projMeets ? " ok" : " no") : "")
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
            {validTarget && projGPA !== null && (
              <span className="sim-proj-judge">
                {projMeets
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
