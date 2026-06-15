import { useState } from "react";
import {
  departments,
  admissionTypes,
  transferYears,
  transferGrades,
  multiTypes,
  linkedMajors,
  microMajors,
  getRequirement,
  getMajorPlan,
  isCsGroup,
  changeNeedsGrade,
  allowsMultiMajor,
} from "../data/graduationData.js";

// 첫 화면: 입학유형 + 학과(계열)을 고르고 시작
function Onboarding({ initial, onComplete }) {
  const [admission, setAdmission] = useState(
    (initial && initial.admission) || "freshman"
  );
  const [deptId, setDeptId] = useState((initial && initial.deptId) || "general");
  const [transferYear, setTransferYear] = useState(
    (initial && initial.transferYear) || "from23"
  );
  const [transferGrade, setTransferGrade] = useState(
    (initial && initial.transferGrade) || "2"
  );
  const [multiType, setMultiType] = useState(
    (initial && initial.multiType) || "single"
  );
  const [secondMajorName, setSecondMajorName] = useState(
    (initial && initial.secondMajorName) || ""
  );

  const showTransferYear = admission === "transfer" && isCsGroup(deptId);
  const showTransferGrade = admission === "change" && changeNeedsGrade(deptId);
  const canMulti = allowsMultiMajor(deptId);
  // 다전공 불가 학과면 단일전공으로 강제
  const effMultiType = canMulti ? multiType : "single";
  const setup = {
    admission,
    deptId,
    transferYear,
    transferGrade,
    multiType: effMultiType,
    secondMajorName,
  };
  const req = getRequirement(setup);
  const plan = getMajorPlan(setup);

  // 연계/마이크로전공은 학교 지정 목록이 있어 추천 제공
  const suggestions =
    effMultiType === "linked"
      ? linkedMajors
      : effMultiType === "micro"
        ? microMajors
        : [];

  const handleStart = () => {
    onComplete(setup);
  };

  return (
    <div className="onboarding">
      <div className="onb-card">
        <div className="onb-hero">
          <div className="onb-logo">🎓</div>
          <h1 className="onb-title">GradeMate</h1>
          <p className="onb-tagline">삼육대 맞춤 학점·졸업 관리</p>
        </div>

        {/* 입학 유형 (세그먼트) */}
        <div className="onb-section">
          <p className="onb-label">입학 유형</p>
          <div className="seg">
            {admissionTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                className={"seg-btn" + (admission === t.id ? " active" : "")}
                onClick={() => setAdmission(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 학과 / 계열 (카드 그리드) */}
        <div className="onb-section">
          <p className="onb-label">학과 / 계열</p>
          <div className="opt-grid">
            {departments.map((d) => (
              <button
                key={d.id}
                type="button"
                className={"opt-card" + (deptId === d.id ? " active" : "")}
                onClick={() => setDeptId(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* 편입 cs계열: 학번 */}
        {showTransferYear && (
          <div className="onb-section">
            <p className="onb-label">학번</p>
            <div className="seg">
              {transferYears.map((y) => (
                <button
                  key={y.id}
                  type="button"
                  className={"seg-btn" + (transferYear === y.id ? " active" : "")}
                  onClick={() => setTransferYear(y.id)}
                >
                  {y.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 전과: 전과 학년 */}
        {showTransferGrade && (
          <div className="onb-section">
            <p className="onb-label">전과 학년</p>
            <div className="seg">
              {transferGrades.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={"seg-btn" + (transferGrade === g.id ? " active" : "")}
                  onClick={() => setTransferGrade(g.id)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 다전공 (전공 이수 형태) */}
        {canMulti && (
          <div className="onb-section">
            <p className="onb-label">전공 이수 형태</p>
            <div className="opt-grid">
              {multiTypes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={"opt-card" + (effMultiType === m.id ? " active" : "")}
                  onClick={() => setMultiType(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* 다전공이면 전공명(선택) 입력 */}
            {effMultiType !== "single" && (
              <div className="onb-second">
                <input
                  type="text"
                  value={secondMajorName}
                  onChange={(e) => setSecondMajorName(e.target.value)}
                  placeholder={
                    suggestions.length
                      ? "다전공 선택 (예: " + suggestions[0] + ")"
                      : "다전공 학과/전공명 (선택)"
                  }
                  list="second-major-list"
                />
                {suggestions.length > 0 && (
                  <datalist id="second-major-list">
                    {suggestions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                )}
              </div>
            )}
          </div>
        )}

        {/* 졸업학점 미리보기 */}
        {req ? (
          <div className="onb-preview">
            <span>졸업 필요 학점</span>
            <strong>{req.total}학점</strong>
            {plan && plan.type !== "single" && (
              <span className="onb-preview-sub">
                주전공 {plan.primary} · {plan.typeLabel} {plan.second}학점
              </span>
            )}
          </div>
        ) : (
          <p className="onb-warn">
            이 조합은 졸업요건 정보가 없어요. (예: 약학과는 전과 대상 아님)
          </p>
        )}

        <button type="button" className="onb-start" onClick={handleStart}>
          시작하기 →
        </button>
      </div>
    </div>
  );
}

export default Onboarding;
