import {
  departments,
  admissionTypes,
  getRequirement,
} from "../data/graduationData.js";
import { calcEarnedCredit } from "../utils/credit.js";

// id로 한글 라벨 찾기
function labelOf(list, id) {
  const found = list.find((x) => x.id === id);
  return found ? found.label : id;
}

// 선택한 입학유형/학과 기준 졸업요건을 보여주는 곳 (선택은 첫 화면에서 함)
function GraduationRequirement({ setup, subjects, onEdit }) {
  const req = getRequirement(setup);
  const earned = calcEarnedCredit(subjects);
  const percent = req ? Math.min(100, Math.round((earned / req.total) * 100)) : 0;

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
          </div>

          {/* 세부 요건 */}
          <div className="grad-detail-cards">
            <div className="grad-detail-card">
              <p className="grad-detail-label">교양</p>
              <p className="grad-detail-value">{req.liberal}</p>
            </div>
            <div className="grad-detail-card">
              <p className="grad-detail-label">전공</p>
              <p className="grad-detail-value">{req.major}</p>
            </div>
            <div className="grad-detail-card">
              <p className="grad-detail-label">자유</p>
              <p className="grad-detail-value">{req.free}</p>
            </div>
            <div className="grad-detail-card">
              <p className="grad-detail-label">채플</p>
              <p className="grad-detail-value">{req.chapel}회</p>
            </div>
          </div>

          <p className="grad-note">
            ※ 전공학점은 단일전공(주전공) 기준입니다. 복수전공·부전공·교직 등은
            다를 수 있으니 학과에 문의하세요.
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
