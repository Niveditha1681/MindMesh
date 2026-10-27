import React, {
  useMemo,
} from "react";


const MeshPreview = ({
  nodes = [],
  edges = [],
  selectedNodeId = null,
  onClose,
}) => {


  /*
   * =========================================================
   * SELECTED NODE
   * =========================================================
   */

  const selectedNode =
    useMemo(() => {

      if (
        selectedNodeId === null ||
        selectedNodeId === undefined
      ) {

        return null;

      }


      return (
        nodes.find(
          (node) =>
            Number(node?.id) ===
            Number(selectedNodeId)
        ) || null
      );

    }, [
      nodes,
      selectedNodeId,
    ]);


  /*
   * =========================================================
   * DON'T SHOW MODAL
   * =========================================================
   */

  if (!selectedNode) {

    return null;

  }


  /*
   * =========================================================
   * DESCRIPTION
   * =========================================================
   */

  const description =
    selectedNode?.description ||
    selectedNode?.content ||
    selectedNode?.label ||
    "No description available.";


  /*
   * =========================================================
   * CONCEPTUAL FRAMEWORK
   *
   * Get connected nodes
   * =========================================================
   */

  const connectedNodes =
    edges
      .filter((edge) => {

        const sourceId =
          edge?.sourceNode?.id;

        const targetId =
          edge?.targetNode?.id;


        return (
          Number(sourceId) ===
            Number(selectedNodeId) ||
          Number(targetId) ===
            Number(selectedNodeId)
        );

      })
      .map((edge) => {

        const sourceId =
          edge?.sourceNode?.id;

        const targetId =
          edge?.targetNode?.id;


        const connectedId =
          Number(sourceId) ===
          Number(selectedNodeId)
            ? targetId
            : sourceId;


        return nodes.find(
          (node) =>
            Number(node?.id) ===
            Number(connectedId)
        );

      })
      .filter(Boolean);


  /*
   * =========================================================
   * COMPLEXITY SCORE
   * =========================================================
   */

  const complexityScore =
    selectedNode?.complexity ??
    selectedNode?.complexityScore ??
    (
      connectedNodes.length / 2
    );


  /*
   * =========================================================
   * UNIQUE CONCEPTS
   * =========================================================
   */

  const concepts =
    [
      selectedNode,
      ...connectedNodes,
    ].filter(
      (node, index, array) =>
        array.findIndex(
          (item) =>
            Number(item?.id) ===
            Number(node?.id)
        ) === index
    );


  /*
   * =========================================================
   * CLOSE
   * =========================================================
   */

  const handleClose = () => {

    if (typeof onClose === "function") {

      onClose();

    }

  };


  /*
   * =========================================================
   * MODAL
   * =========================================================
   */

  return (

    <div
      className="mesh-insight-overlay"
      onClick={handleClose}
    >


      <div
        className="mesh-insight-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >


        {/* =================================================
            HEADER
            ================================================= */}

        <div className="mesh-insight-header">


          <h2>

            Mesh Insight: View

          </h2>


          <button
            type="button"
            className="mesh-insight-close"
            onClick={handleClose}
            aria-label="Close insight"
          >

            ×

          </button>


        </div>


        {/* =================================================
            DESCRIPTION
            ================================================= */}

        <div className="mesh-insight-description">


          <span className="mesh-insight-label">

            DESCRIPTION

          </span>


          <p>

            {description}

          </p>


        </div>


        {/* =================================================
            STATS
            ================================================= */}

        <div className="mesh-insight-stats">


          <div className="mesh-insight-stat-card">


            <span>

              Complexity Score

            </span>


            <strong>

              {Number(
                complexityScore
              ).toFixed(1)}

            </strong>


          </div>


          <div className="mesh-insight-stat-card">


            <span>

              Node Count

            </span>


            <strong>

              {nodes.length}

            </strong>


          </div>


        </div>


        {/* =================================================
            DIVIDER
            ================================================= */}

        <div className="mesh-insight-divider" />


        {/* =================================================
            CONCEPTUAL FRAMEWORK
            ================================================= */}

        <div className="mesh-insight-framework">


          <h3>

            Conceptual Framework

          </h3>


          <div className="mesh-insight-concepts">


            {concepts.map(
              (node) => {

                const color =
                  /^#[0-9A-Fa-f]{6}$/.test(
                    node?.colorHex || ""
                  )
                    ? node.colorHex
                    : "#2563eb";


                return (

                  <div
                    key={node?.id}
                    className="mesh-insight-concept"
                  >


                    <span
                      className="mesh-insight-concept-dot"
                      style={{
                        backgroundColor:
                          color,
                      }}
                    />


                    <span>

                      {node?.label ||
                        "Untitled Concept"}

                    </span>


                  </div>

                );

              }
            )}


          </div>


        </div>


        {/* =================================================
            CLOSE BUTTON
            ================================================= */}

        <button
          type="button"
          className="mesh-insight-close-button"
          onClick={handleClose}
        >

          Close Insight

        </button>


      </div>


    </div>

  );

};


export default MeshPreview;