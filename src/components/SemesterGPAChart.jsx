import { calcGPABySemester } from "../utils/credit.js";
import { shortTermLabel } from "../utils/semester.js";

// 학기별 평균평점 선그래프 (외부 라이브러리 없이 SVG로 직접 그림)
function SemesterGPAChart({ subjects }) {
  const data = calcGPABySemester(subjects);

  // 평점 낼 과목이 있는 학기가 0~1개면 선이 안 그려지니 안내만
  if (data.length < 2) {
    return (
      <div className="gpa-chart">
        <h2>📈 학기별 평점 추이</h2>
        <p className="empty-message">
          선그래프는 평점이 있는 학기가 2개 이상일 때 그려져요.
        </p>
      </div>
    );
  }

  // SVG 좌표계 (가로 100% 로 늘어나도 비율 유지)
  const W = 640;
  const H = 280;
  const pad = { top: 24, right: 20, bottom: 48, left: 36 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const yMax = 4.5;
  const xAt = (i) =>
    pad.left + (data.length === 1 ? plotW / 2 : (plotW * i) / (data.length - 1));
  const yAt = (gpa) => pad.top + (1 - gpa / yMax) * plotH;

  // 가로 눈금선 (0, 1, 2, 3, 4, 4.5)
  const yTicks = [0, 1, 2, 3, 4, 4.5];

  const points = data.map((d, i) => ({ ...d, x: xAt(i), y: yAt(d.gpa) }));
  const linePath = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="gpa-chart">
      <h2>📈 학기별 평점 추이</h2>
      <svg
        className="gpa-chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="학기별 평균 평점 선그래프"
      >
        {/* 가로 눈금선 + y축 라벨 */}
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={pad.left}
              y1={yAt(t)}
              x2={W - pad.right}
              y2={yAt(t)}
              className="chart-grid"
            />
            <text x={pad.left - 8} y={yAt(t) + 4} className="chart-ylabel">
              {t.toFixed(1)}
            </text>
          </g>
        ))}

        {/* 선 + 점 채우기 영역 */}
        <polyline className="chart-line" points={linePath} />

        {points.map((p, i) => {
          const [grade, code] = p.semester.split("-");
          return (
            <g key={p.semester}>
              <circle className="chart-dot" cx={p.x} cy={p.y} r="4.5" />
              {/* 점 위 평점 값 */}
              <text x={p.x} y={p.y - 12} className="chart-value">
                {p.gpa.toFixed(2)}
              </text>
              {/* x축 라벨 (학년 / 학기 두 줄) */}
              <text x={p.x} y={H - pad.bottom + 20} className="chart-xlabel">
                {grade}학년
              </text>
              <text x={p.x} y={H - pad.bottom + 36} className="chart-xlabel sub">
                {shortTermLabel(code)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default SemesterGPAChart;
