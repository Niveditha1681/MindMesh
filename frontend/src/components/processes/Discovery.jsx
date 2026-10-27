import React, {
  useMemo,
  useState,
} from "react";

import "./Discovery.css";


const Discovery = ({
  nodes = [],
  edges = [],
}) => {


  /*
   * =========================================================
   * SAFE DATA
   * =========================================================
   */

  const safeNodes =
    Array.isArray(nodes)
      ? nodes
      : [];


  const safeEdges =
    Array.isArray(edges)
      ? edges
      : [];
  const [
  selectedNode,
  setSelectedNode,
] = useState(null);


  /*
   * =========================================================
   * FIND CONNECTED NODE IDS
   * =========================================================
   */

  const connectedNodeIds =
    useMemo(() => {

      const ids =
        new Set();


      safeEdges.forEach(
        (edge) => {

          const sourceId =
            edge?.sourceId ||
            edge?.sourceNodeId ||
            edge?.sourceNode?.id ||
            edge?.source;


          const targetId =
            edge?.targetId ||
            edge?.targetNodeId ||
            edge?.targetNode?.id ||
            edge?.target;


          if (
            sourceId !== undefined &&
            sourceId !== null
          ) {

            ids.add(
              String(sourceId)
            );

          }


          if (
            targetId !== undefined &&
            targetId !== null
          ) {

            ids.add(
              String(targetId)
            );

          }

        }
      );


      return ids;

    }, [safeEdges]);


  /*
   * =========================================================
   * DISCONNECTED NODES
   * =========================================================
   */

  const disconnectedNodes =
    useMemo(() => {

      return safeNodes.filter(
        (node) => {

          const nodeId =
            node?.id ||
            node?.nodeId;


          if (
            nodeId === undefined ||
            nodeId === null
          ) {

            return false;

          }


          return (
            !connectedNodeIds.has(
              String(nodeId)
            )
          );

        }
      );

    }, [
      safeNodes,
      connectedNodeIds,
    ]);


  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (

    <div className="viewer-discovery-content">


      {/* =====================================================
          DISCOVERY SUMMARY
          ===================================================== */}

      <section className="discovery-summary">


        {/* AVAILABLE CONCEPTS */}

        <div className="discovery-summary-card">

          <div className="summary-icon">
            ◇
          </div>


          <div>

            <span className="summary-value">

              {safeNodes.length}

            </span>


            <span className="summary-title">

              Available Concepts

            </span>

          </div>

        </div>


        {/* DISCONNECTED CONCEPTS */}

        <div className="discovery-summary-card">

          <div className="summary-icon">
            ⊘
          </div>


          <div>

            <span className="summary-value">

              {disconnectedNodes.length}

            </span>


            <span className="summary-title">

              Disconnected Concepts

            </span>

          </div>

        </div>


        {/* KNOWLEDGE CONNECTIONS */}

        <div className="discovery-summary-card">

          <div className="summary-icon">
            ↗
          </div>


          <div>

            <span className="summary-value">

              {safeEdges.length}

            </span>


            <span className="summary-title">

              Knowledge Connections

            </span>

          </div>

        </div>


      </section>


      {/* =====================================================
          DISCONNECTED CONCEPTS
          ===================================================== */}

      <section className="discovery-section">


        <div className="discovery-section-header">


          <div>

            <span className="section-label">

              KNOWLEDGE INSIGHTS

            </span>


            <h2>

              Disconnected Concepts

            </h2>


            <p>

              Concepts that are available but not currently
              connected to the knowledge mesh.

            </p>

          </div>


          <div className="concept-count">

            {disconnectedNodes.length} Found

          </div>


        </div>


        {/* =================================================
            EMPTY STATE
            ================================================= */}

        {disconnectedNodes.length === 0 ? (

          <div className="discovery-empty-state">


            <div className="empty-icon">

              ◇

            </div>


            <h3>

              No disconnected concepts found

            </h3>


            <p>

              All available concepts are currently connected,
              or there are no concepts available for discovery.

            </p>


            <div className="empty-status">

              <span></span>

              Knowledge mesh is up to date

            </div>


          </div>

        ) : (

          <div className="concept-grid">


            {disconnectedNodes.map(
              (node, index) => {


                const nodeId =
                  node?.id ||
                  node?.nodeId ||
                  index;


                const nodeName =
                  node?.name ||
                  node?.label ||
                  node?.title ||
                  "Unnamed Concept";


                const nodeDescription =
  node?.description ||
  node?.content ||
  node?.rawContent ||
  "No description available for this concept.";


                const nodeType =
                  node?.type ||
                  node?.nodeType ||
                  node?.contentType ||
                  "Concept";


                return (

                  <div
                    className="concept-card"
                    key={nodeId}
                  >


                    <div className="concept-card-top">


                      <div className="concept-icon">

                        ◇

                      </div>


                      <span className="concept-type">

                        {nodeType}

                      </span>


                    </div>


                    <h3>

                      {nodeName}

                    </h3>


                    <p>

                      {nodeDescription}

                    </p>


                    <div className="concept-card-footer">


                      <span>

                        Not Connected

                      </span>


                      <button
                        type="button"
                        className="view-concept-btn"
                        onClick={() => setSelectedNode(node)}
                      >

                        View Details →

                      </button>


                    </div>


                  </div>

                );

              }
            )}


          </div>

        )}


      </section>


      {/* =====================================================
          VIEWER ANALYST INFORMATION
          ===================================================== */}

      <div className="viewer-info-card">


        <div className="viewer-info-icon">

          i

        </div>


        <div>

          <h3>

            Viewer Analyst Access

          </h3>


          <p>

            You can explore and analyze knowledge concepts
            and connections. Modification of the knowledge
            mesh is restricted for this role.

          </p>

        </div>


      </div>

        {selectedNode && (
  <div
    className="concept-details-overlay"
    onClick={() => setSelectedNode(null)}
  >

    <div
      className="concept-details-modal"
      onClick={(event) => event.stopPropagation()}
    >

      <div className="concept-details-header">

        <div>
          <span className="section-label">
            CONCEPT DETAILS
          </span>

          <h2>
            {
              selectedNode?.name ||
              selectedNode?.label ||
              selectedNode?.title ||
              "Unnamed Concept"
            }
          </h2>
        </div>

        <button
          type="button"
          className="concept-details-close"
          onClick={() => setSelectedNode(null)}
          aria-label="Close concept details"
        >
          ×
        </button>

      </div>


      <div className="concept-details-body">

        <div className="concept-detail-row">

          <span>Type</span>

          <strong>
            {
              selectedNode?.type ||
              selectedNode?.nodeType ||
              selectedNode?.contentType ||
              "CONCEPT"
            }
          </strong>

        </div>


        <div className="concept-detail-row">

          <span>Node ID</span>

          <strong>
            {
              selectedNode?.id ||
              selectedNode?.nodeId ||
              "—"
            }
          </strong>

        </div>


        <div className="concept-detail-description">

          <span>DESCRIPTION</span>

          <p>
            {
              selectedNode?.description ||
              selectedNode?.content ||
              selectedNode?.rawContent ||
              "No description available for this concept."
            }
          </p>

        </div>


        <div className="concept-detail-row">

          <span>Connection Status</span>

          <strong>
            Not Connected
          </strong>

        </div>


        {
          (
            selectedNode?.xCoordinate !== undefined ||
            selectedNode?.yCoordinate !== undefined
          ) && (

            <div className="concept-detail-row">

              <span>Position</span>

              <strong>
                X:{" "}
                {
                  selectedNode?.xCoordinate ??
                  selectedNode?.xcoordinate ??
                  "—"
                }
                {"  "}
                Y:{" "}
                {
                  selectedNode?.yCoordinate ??
                  selectedNode?.ycoordinate ??
                  "—"
                }
              </strong>

            </div>

          )
        }

      </div>


      <button
        type="button"
        className="concept-details-close-button"
        onClick={() => setSelectedNode(null)}
      >
        Close Details
      </button>

    </div>

  </div>
)}
    </div>

  );

};


export default Discovery;