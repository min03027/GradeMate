// 전공 / 교양 세그먼트 토글 (value: "major" | "liberal")
function MajorToggle({ value, onChange, size }) {
  const isMajor = value !== "liberal"; // 기본 전공

  return (
    <div className={"major-toggle" + (size === "sm" ? " sm" : "")}>
      <button
        type="button"
        className={isMajor ? "active" : ""}
        onClick={() => onChange("major")}
      >
        전공
      </button>
      <button
        type="button"
        className={!isMajor ? "active" : ""}
        onClick={() => onChange("liberal")}
      >
        교양
      </button>
    </div>
  );
}

export default MajorToggle;
