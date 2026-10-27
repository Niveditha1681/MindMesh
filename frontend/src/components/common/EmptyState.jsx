import React from "react";

const EmptyState = ({
  icon = "◇",
  title = "Nothing here yet",
  message = "There is no data to display.",
  actionLabel = "",
  onAction = null,
}) => {
  return (
    <div className="empty-state">

      <div
        className="empty-state-icon"
        aria-hidden="true"
      >
        {icon}
      </div>

      <h3 className="empty-state-title">
        {title}
      </h3>

      <p className="empty-state-message">
        {message}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          className="graph-action-button"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}

    </div>
  );
};

export default EmptyState;