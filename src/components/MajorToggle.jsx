// 과목 구분 토글
// 기본(2지선다): 전공 / 교양  (value: "major" | "liberal")
// multi(3지선다): 주전공 / 다전공 / 교양  (value: "major" | "second" | "liberal")
function MajorToggle({ value, onChange, size, multi }) {
  const opts = multi
    ? [
        ["major", "주전공"],
        ["second", "다전공"],
        ["liberal", "교양"],
      ]
    : [
        ["major", "전공"],
        ["liberal", "교양"],
      ];

  // 2지선다일 땐 liberal 외엔 전공으로 취급
  const current = multi
    ? value || "major"
    : value === "liberal"
      ? "liberal"
      : "major";

  return (
    <div
      className={
        "major-toggle" + (size === "sm" ? " sm" : "") + (multi ? " multi" : "")
      }
    >
      {opts.map(([val, label]) => (
        <button
          key={val}
          type="button"
          className={current === val ? "active" : ""}
          onClick={() => onChange(val)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default MajorToggle;
