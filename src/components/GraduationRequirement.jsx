import { useState } from "react";
import {
  departments,
  admissionTypes,
  transferYears,
  transferGrades,
  getRequirement,
  isCsGroup,
  changeNeedsGrade,
} from "../data/graduationData.js";
import { calcEarnedCredit } from "../utils/credit.js";

// 학과 + 입학유형 고르면 졸업요건(졸업학점 등)을 자동으로 보여주는 곳
function GraduationRequirement({ subjects }) {
  const [admission, setAdmission] = useState("freshman"); // 입학유형
  const [deptId, setDeptId] = useState("general"); // 학과(계열)
  const [transferYear, setTransferYear] = useState("from23"); // 편입 cs계열 학번
  const [transferGrade, setTransferGrade] = useState("2"); // 전과한 학년

  // 선택값으로 졸업요건 찾기
  const req = getRequirement({ admission, deptId, transferYear, transferGrade });

  // 지금까지 이수한 학점
  const earned = calcEarnedCredit(subjects);

  // 추가로 보여줄 입력칸 판단
  const showTransferYear = admission === "transfer" && isCsGroup(deptId);
  const showTransferGrade = admission === "change" && changeNeedsGrade(deptId);

  return (
    <div className="grad-req">
      <h2>🎯 졸업 요건 설정</h2>

      {/* 입학 유형 */}
      <div className="form-row">
        <label>입학 유형</label>
        <select value={admission} onChange={(e) => setAdmission(e.target.value)}>
          {admissionTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* 학과(계열) */}
      <div className="form-row">
        <label>학과 / 계열</label>
        <select value={deptId} onChange={(e) => setDeptId(e.target.value)}>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* 편입 cs계열일 때만: 학번 (졸업학점이 학번마다 다름) */}
      {showTransferYear && (
        <div className="form-row">
          <label>학번</label>
          <select
            value={transferYear}
            onChange={(e) => setTransferYear(e.target.value)}
          >
            {transferYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 전과일 때만: 전과한 학년 (전공학점이 학년마다 다름) */}
      {showTransferGrade && (
        <div className="form-row">
          <label>전과 학년</label>
          <select
            value={transferGrade}
            onChange={(e) => setTransferGrade(e.target.value)}
          >
            {transferGrades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 결과: 졸업요건이 있으면 보여주고, 없으면 안내 */}
      {req ? (
        <div className="grad-result">
          {/* 졸업학점 + 진행률 */}
          <div className="grad-total">
            <div className="grad-total-top">
              <span className="grad-total-label">졸업 필요 학점</span>
              <span className="grad-total-value">{req.total}학점</span>
            </div>

            {/* 진행 막대 */}
            <div className="grad-bar">
              <div
                className="grad-bar-fill"
                style={{
                  width:
                    Math.min(100, Math.round((earned / req.total) * 100)) + "%",
                }}
              />
            </div>

            <div className="grad-progress-text">
              현재 <b>{earned}</b>학점 이수 · 남은 학점{" "}
              <b>{Math.max(0, req.total - earned)}</b>학점
            </div>
          </div>

          {/* 세부 요건 (교양/전공/자유) */}
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
          선택하신 학과는 해당 입학유형의 졸업요건 정보가 없습니다. (예: 약학과는
          전과 대상이 아님)
        </p>
      )}
    </div>
  );
}

export default GraduationRequirement;
