import React from "react";

const EdgeElement = ({
  edge,
  sourceNode,
  targetNode,
}) => {
  /*
   * =========================================================
   * SAFETY CHECK
   * =========================================================
   */

  if (!edge || !sourceNode || !targetNode) {
    return null;
  }

  /*
   * =========================================================
   * NODE COORDINATES
   * =========================================================
   */

  const sourceX =
    Number.isFinite(Number(sourceNode?.xCoordinate))
      ? Number(sourceNode.xCoordinate)
      : 0;

  const sourceY =
    Number.isFinite(Number(sourceNode?.yCoordinate))
      ? Number(sourceNode.yCoordinate)
      : 0;

  const targetX =
    Number.isFinite(Number(targetNode?.xCoordinate))
      ? Number(targetNode.xCoordinate)
      : 0;

  const targetY =
    Number.isFinite(Number(targetNode?.yCoordinate))
      ? Number(targetNode.yCoordinate)
      : 0;

  /*
   * =========================================================
   * LINE GEOMETRY
   * =========================================================
   */

  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;

  const length = Math.sqrt(
    deltaX * deltaX + deltaY * deltaY
  );

  const angle =
    Math.atan2(deltaY, deltaX) *
    (180 / Math.PI);

  /*
   * =========================================================
   * RELATIONSHIP
   * =========================================================
   */

  const relationship =
    edge?.relationshipType ||
    edge?.type ||
    edge?.relationship ||
    "RELATES_TO";

  /*
   * =========================================================
   * CONNECTION STRENGTH
   * =========================================================
   */

  const numericStrength =
    Number(edge?.connectionStrength);

  const strength =
    Number.isFinite(numericStrength)
      ? numericStrength
      : 1;

  const lineHeight = Math.max(
    1,
    Math.min(6, strength)
  );

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div
      className="graph-edge"
      style={{
        position: "absolute",
        left: `${sourceX}px`,
        top: `${sourceY}px`,
        width: `${length}px`,
        height: "20px",
        transform: `rotate(${angle}deg)`,
        transformOrigin: "0 50%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {/* Connection line */}

      <div
        className="graph-edge-line"
        style={{
          height: `${lineHeight}px`,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />

      {/* Relationship label */}

      {relationship && (
        <span className="graph-edge-label">
          {relationship}
        </span>
      )}
    </div>
  );
};

export default EdgeElement;