import {
  calcGPA,
  calcEarnedCredit,
  getValidSubjects,
} from "../utils/credit.js";
import { countRegularSemesters } from "../utils/semester.js";
import {
  earlyGradCredit,
  earlyGradSemesters,
  HONOR_GPA,
} from "../data/graduationData.js";

// 한 조건 줄
function Cond({ ok, label, now }) {
  return (
    <li className={"sg-cond" + (ok ? " ok" : "")}>
      <span className="sg-cond-icon">{ok ? "✅" : "⬜"}</span>
      <span className="sg-cond-label">{label}</span>
      {now != null && <span className="sg-cond-now">{now}</span>}
    </li>
  );
}

// 조기졸업 / 우등졸업 신청 자격 자동 점검
function SpecialGraduation({ subjects, setup }) {
  const gpa = calcGPA(subjects);
  const earned = calcEarnedCredit(subjects);
  const sem = countRegularSemesters(subjects);

  // 조기졸업
  const earlyCredit = earlyGradCredit(setup);
  const earlySemMax = earlyGradSemesters(setup.deptId);
  const eSem = sem > 0 && sem <= earlySemMax;
  const eGpa = gpa >= HONOR_GPA;
  const eCredit = earned >= earlyCredit;
  const earlyOk = eSem && eGpa && eCredit;

  // 우등졸업: D+ 이하(D+/D/F) 학점이 없어야 함 (채플 포함)
  const LOW = ["D+", "D", "F"];
  const hasLow = getValidSubjects(subjects).some((s) => LOW.includes(s.grade));
  const hSem = sem >= 4;
  const hGpa = gpa >= HONOR_GPA;
  const hNoLow = !hasLow;
  const honorOk = hSem && hGpa && hNoLow;

  return (
    <div className="sg-card">
      <h2>🎓 조기·우등 졸업 자격 점검</h2>

      {/* 조기졸업 */}
      <div className="sg-block">
        <h3 className="sg-title">조기졸업</h3>
        <ul className="sg-conds">
          <Cond
            ok={eSem}
            label={`이수학기 ${earlySemMax}학기 이내`}
            now={`현재 ${sem}학기`}
          />
          <Cond
            ok={eGpa}
            label={`평균평점 ${HONOR_GPA.toFixed(2)} 이상`}
            now={`현재 ${gpa.toFixed(2)}`}
          />
          <Cond
            ok={eCredit}
            label={`취득학점 ${earlyCredit}학점 이상`}
            now={`현재 ${earned}학점`}
          />
        </ul>
        <div className={"sg-verdict" + (earlyOk ? " ok" : "")}>
          {earlyOk
            ? "조기졸업 신청 자격을 충족합니다! 🎉"
            : "아직 조기졸업 자격을 충족하지 못했어요."}
        </div>
        <p className="sg-warn">
          ⚠️ <b>SU秀 MVP 인증프로그램</b> 추가 이수 여부를 꼭 확인하세요! (앱에서
          자동 확인 불가)
        </p>
      </div>

      {/* 우등졸업 */}
      <div className="sg-block">
        <h3 className="sg-title">우등졸업</h3>
        <ul className="sg-conds">
          <Cond ok={hSem} label="이수학기 4학기 이상" now={`현재 ${sem}학기`} />
          <Cond
            ok={hGpa}
            label={`평균평점 ${HONOR_GPA.toFixed(2)} 이상`}
            now={`현재 ${gpa.toFixed(2)}`}
          />
          <Cond ok={hNoLow} label="D+ 이하 학점 없음 (채플 포함)" />
        </ul>
        <div className={"sg-verdict" + (honorOk ? " ok" : "")}>
          {honorOk
            ? "우등졸업 신청 자격을 충족합니다! 🎉"
            : "아직 우등졸업 자격을 충족하지 못했어요."}
        </div>
        <p className="sg-warn">
          ⚠️ <b>SU秀 MVP 인증프로그램</b>(또는 학과 지정조건) 이수 여부를 꼭
          확인하세요! 학과장·교무처장 추천과 졸업사정위 승인도 필요합니다.
        </p>
      </div>

      <p className="sg-foot">
        SU秀 MVP 인증프로그램:{" "}
        <a
          href="https://su-plus.syu.ac.kr"
          target="_blank"
          rel="noreferrer"
        >
          su-plus.syu.ac.kr
        </a>{" "}
        → 학생경력관리제도 참조
      </p>
    </div>
  );
}

export default SpecialGraduation;
