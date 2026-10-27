import React from "react";

const CapacityBar = ({
  value = 0,
  max = 100,
  label = "Capacity",
  showValue = true,
}) => {

  const numericValue = Number(value);
  const numericMax = Number(max);

  const safeValue = Number.isFinite(numericValue)
    ? numericValue
    : 0;

  const safeMax =
    Number.isFinite(numericMax) && numericMax > 0
      ? numericMax
      : 100;

  const percentage = Math.min(
    100,
    Math.max(
      0,
      (safeValue / safeMax) * 100
    )
  );


  /*
   * Determine capacity status.
   */

  let status = "normal";

  if (percentage >= 90) {
    status = "critical";
  } else if (percentage >= 70) {
    status = "warning";
  }


  return (
    <div className="capacity-bar">

      {/* Header */}

      <div className="capacity-bar-header">

        <span className="capacity-bar-label">
          {label}
        </span>

        {showValue && (
          <span className="capacity-bar-value">
            {safeValue} / {safeMax}
          </span>
        )}

      </div>


      {/* Track */}

      <div
        className="capacity-bar-track"
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin="0"
        aria-valuemax={safeMax}
        aria-label={label}
      >

        <div
          className={`capacity-bar-fill ${status}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>


      {/* Percentage */}

      {showValue && (
        <div className="capacity-bar-percentage">
          {Math.round(percentage)}%
        </div>
      )}

    </div>
  );
};

export default CapacityBar;