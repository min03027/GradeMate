import {
  departments,
  admissionTypes,
  getRequirement,
  getMajorPlan,
  requiredSemesters,
  MULTI_REQS,
} from "../data/graduationData.js";
import {
  calcEarnedCredit,
  calcEarnedByCategory,
  calcGPA,
} from "../utils/credit.js";
import { countRegularSemesters } from "../utils/semester.js";

// id로 한글 라벨 찾기
function labelOf(list, id) {
  const found = list.find((x) => x.id === id);
  return found ? found.label : id;
}

// 선택한 입학유형/학과 기준 졸업요건을 보여주는 곳 (선택은 첫 화면에서 함)
function GraduationRequirement({ setup, subjects, onEdit }) {
  const req = getRequirement(setup);
  const plan = getMajorPlan(setup); // {type, typeLabel, primary, second, secondName}
  const isMulti = plan && plan.type !== "single";
  const earned = calcEarnedCredit(subjects);
  const byCat = calcEarnedByCategory(subjects); // {major, second, liberal, free}
  const percent = req ? Math.min(100, Math.round((earned / req.total) * 100)) : 0;

  // 이수학기
  const semDone = countRegularSemesters(subjects);
  const semNeed = requiredSemesters(setup.deptId);

  // 다전공 신청 자격 체크 (이수학기·평점)
  const gpa = calcGPA(subjects);
  const multiReq = isMulti ? MULTI_REQS[plan.type] : null;
  const eligOk =
    multiReq && semDone >= multiReq.semesters && gpa >= multiReq.gpa;

  return (
    <div className="grad-req">
      <div className="grad-req-head">
        <h2>🎯 졸업 요건</h2>
        <button type="button" className="grad-change-btn" onClick={onEdit}>
          설정 변경
        </button>
      </div>

      {/* 선택한 정보 요약 */}
      <div className="grad-setup-summary">
        <span className="grad-chip">{labelOf(admissionTypes, setup.admission)}</span>
        <span className="grad-chip">{labelOf(departments, setup.deptId)}</span>
        {isMulti && (
          <span className="grad-chip multi">
            {plan.typeLabel}
            {plan.secondName ? ` · ${plan.secondName}` : ""}
          </span>
        )}
      </div>

      {req ? (
        <div className="grad-result">
          {/* 졸업학점 + 진행률 */}
          <div className="grad-total">
            <div className="grad-total-top">
              <span className="grad-total-label">졸업 필요 학점</span>
              <span className="grad-total-value">{req.total}학점</span>
            </div>

            <div className="grad-bar">
              <div className="grad-bar-fill" style={{ width: percent + "%" }} />
            </div>

            <div className="grad-progress-text">
              현재 <b>{earned}</b>학점 이수 · 남은 학점{" "}
              <b>{Math.max(0, req.total - earned)}</b>학점 ({percent}%)
            </div>

            {/* 이수학기 */}
            <div className="grad-sem-row">
              <span>이수 학기 (계절 제외)</span>
              <span className={semDone >= semNeed ? "sem-ok" : "sem-warn"}>
                <b>{semDone}</b> / {semNeed}학기
              </span>
            </div>
          </div>

          {/* 구분별 이수 / 필요 학점 */}
          <div className="grad-detail-cards">
            {isMulti ? (
              <>
                <div className="grad-detail-card">
                  <p className="grad-detail-label">주전공</p>
                  <p className="grad-detail-value">{byCat.major}</p>
                  <p className="grad-detail-need">/ {plan.primary}</p>
                </div>
                <div className="grad-detail-card">
                  <p className="grad-detail-label">{plan.typeLabel}</p>
                  <p className="grad-detail-value">{byCat.second}</p>
                  <p className="grad-detail-need">/ {plan.second}</p>
                </div>
              </>
            ) : (
              <div className="grad-detail-card">
                <p className="grad-detail-label">전공</p>
                <p className="grad-detail-value">{byCat.major}</p>
                <p className="grad-detail-need">/ {req.major}</p>
              </div>
            )}
            <div className="grad-detail-card">
              <p className="grad-detail-label">교양</p>
              <p className="grad-detail-value">{byCat.liberal}</p>
              <p className="grad-detail-need">/ {req.liberal}</p>
            </div>
            <div className="grad-detail-card">
              <p className="grad-detail-label">자유</p>
              <p className="grad-detail-value">{req.free}</p>
              <p className="grad-detail-need">필요</p>
            </div>
            <div className="grad-detail-card">
              <p className="grad-detail-label">채플</p>
              <p className="grad-detail-value">{req.chapel}</p>
              <p className="grad-detail-need">회</p>
            </div>
          </div>

          {/* 다전공 신청 자격 안내 */}
          {isMulti && multiReq && (
            <div className={"grad-elig" + (eligOk ? " ok" : "")}>
              <span className="grad-elig-title">
                {plan.typeLabel} 신청 자격
              </span>
              <span className="grad-elig-body">
                {multiReq.semesters}학기 이상
                {multiReq.gpa > 0 ? ` · 평점 ${multiReq.gpa.toFixed(1)} 이상` : ""}
                {" → "}
                <b>{eligOk ? "충족 ✓" : "미충족"}</b>
                <span className="grad-elig-now">
                  {" "}
                  (현재 {semDone}학기 · 평점 {gpa.toFixed(2)})
                </span>
              </span>
            </div>
          )}

          <p className="grad-note">
            ※ 과목마다 구분(주전공/{isMulti ? "다전공/" : ""}교양)을 골라 학점을
            합산합니다. {isMulti ? "다전공 과목은 \"다전공\"으로 표시하세요. " : ""}
            전공학점·다전공 학점은 학교 기본표 기준이며, 학과/학번별로 다를 수
            있으니 자세한 건 학과에 문의하세요.
          </p>
        </div>
      ) : (
        <p className="grad-empty">
          선택하신 조합은 졸업요건 정보가 없습니다. (예: 약학과는 전과 대상이
          아님) 설정을 변경해 주세요.
        </p>
      )}
    </div>
  );
}

export default GraduationRequirement;
