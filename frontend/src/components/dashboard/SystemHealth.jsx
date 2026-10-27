import React, { useMemo } from "react";


/*
 * =========================================================
 * SYSTEM HEALTH
 * =========================================================
 *
 * SRS:
 *
 * SystemHealth.jsx
 * Diagnostics readout.
 *
 * No dedicated system-health endpoint is specified
 * in the SRS, so this component performs lightweight
 * frontend diagnostics without introducing a new API.
 */


const SystemHealth = ({
  nodes = [],
  edges = [],
  graphs = [],
  loading = false,
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

  const safeGraphs =
    Array.isArray(graphs)
      ? graphs
      : [];


  /*
   * =========================================================
   * DIAGNOSTICS
   * =========================================================
   */

  const diagnostics = useMemo(() => {

    /*
     * Node diagnostics
     */

    const invalidNodes =
      safeNodes.filter(
        (node) =>
          !node ||
          node.id === undefined ||
          node.id === null
      );


    /*
     * Edge diagnostics
     */

    const invalidEdges =
      safeEdges.filter(
        (edge) => {

          if (!edge) {
            return true;
          }


          const sourceId =
            edge?.sourceNode?.id ??
            edge?.sourceNodeId ??
            edge?.sourceId;


          const targetId =
            edge?.targetNode?.id ??
            edge?.targetNodeId ??
            edge?.targetId;


          return (
            sourceId === undefined ||
            sourceId === null ||
            targetId === undefined ||
            targetId === null
          );

        }
      );


    /*
     * Duplicate node IDs
     */

    const nodeIds =
      safeNodes
        .map((node) => node?.id)
        .filter(
          (id) =>
            id !== undefined &&
            id !== null
        );


    const uniqueNodeIds =
      new Set(nodeIds);


    const duplicateNodeCount =
      nodeIds.length -
      uniqueNodeIds.size;


    /*
     * Duplicate graph IDs
     */

    const graphIds =
      safeGraphs
        .map((graph) => graph?.id)
        .filter(
          (id) =>
            id !== undefined &&
            id !== null
        );


    const uniqueGraphIds =
      new Set(graphIds);


    const duplicateGraphCount =
      graphIds.length -
      uniqueGraphIds.size;


    /*
     * Determine overall health.
     */

    const issueCount =
      invalidNodes.length +
      invalidEdges.length +
      duplicateNodeCount +
      duplicateGraphCount;


    let status = "Healthy";

    if (issueCount > 0) {
      status = "Attention";
    }


    if (loading) {
      status = "Checking";
    }


    return {
      invalidNodes,
      invalidEdges,
      duplicateNodeCount,
      duplicateGraphCount,
      issueCount,
      status,
    };

  }, [
    safeNodes,
    safeEdges,
    safeGraphs,
    loading,
  ]);


  /*
   * =========================================================
   * STATUS CLASS
   * =========================================================
   */

  const statusClass =
    diagnostics.status
      .toLowerCase();


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <section className="system-health">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="system-health-header">

        <div>

          <span className="section-label">
            SYSTEM HEALTH
          </span>

          <h2>
            Diagnostics
          </h2>

          <p>
            Current workspace and knowledge graph
            diagnostics.
          </p>

        </div>


        <div
          className={`system-health-status ${statusClass}`}
          role="status"
        >

          <span className="system-health-status-dot">
            ●
          </span>

          <span>
            {diagnostics.status}
          </span>

        </div>

      </div>


      {/* =================================================
          HEALTH OVERVIEW
          ================================================= */}

      <div className="system-health-grid">

        {/* Graphs */}

        <article className="system-health-card">

          <div className="system-health-card-icon">
            ◇
          </div>

          <div className="system-health-card-content">

            <span className="system-health-card-label">
              Graphs
            </span>

            <strong>
              {safeGraphs.length}
            </strong>

            <p>
              Knowledge workspaces
            </p>

          </div>

        </article>


        {/* Nodes */}

        <article className="system-health-card">

          <div className="system-health-card-icon">
            ●
          </div>

          <div className="system-health-card-content">

            <span className="system-health-card-label">
              Nodes
            </span>

            <strong>
              {safeNodes.length}
            </strong>

            <p>
              Concept nodes
            </p>

          </div>

        </article>


        {/* Edges */}

        <article className="system-health-card">

          <div className="system-health-card-icon">
            ⟷
          </div>

          <div className="system-health-card-content">

            <span className="system-health-card-label">
              Relationships
            </span>

            <strong>
              {safeEdges.length}
            </strong>

            <p>
              Semantic connections
            </p>

          </div>

        </article>


        {/* Issues */}

        <article className="system-health-card">

          <div className="system-health-card-icon">
            !
          </div>

          <div className="system-health-card-content">

            <span className="system-health-card-label">
              Issues
            </span>

            <strong>
              {diagnostics.issueCount}
            </strong>

            <p>
              Diagnostic findings
            </p>

          </div>

        </article>

      </div>


      {/* =================================================
          DIAGNOSTIC DETAILS
          ================================================= */}

      <div className="system-health-details">

        <div className="system-health-details-header">

          <div>

            <h3>
              Diagnostic Readout
            </h3>

            <p>
              Basic integrity checks for the current
              knowledge workspace.
            </p>

          </div>

        </div>


        {/* Node integrity */}

        <div className="system-health-check">

          <div className="system-health-check-indicator">

            {diagnostics.invalidNodes.length === 0
              ? "✓"
              : "!"}

          </div>


          <div className="system-health-check-content">

            <strong>
              Node integrity
            </strong>

            <span>

              {diagnostics.invalidNodes.length === 0
                ? "All nodes have valid identifiers."
                : `${diagnostics.invalidNodes.length} node(s) have invalid identifiers.`}

            </span>

          </div>

        </div>


        {/* Edge integrity */}

        <div className="system-health-check">

          <div className="system-health-check-indicator">

            {diagnostics.invalidEdges.length === 0
              ? "✓"
              : "!"}

          </div>


          <div className="system-health-check-content">

            <strong>
              Relationship integrity
            </strong>

            <span>

              {diagnostics.invalidEdges.length === 0
                ? "All relationships have valid endpoints."
                : `${diagnostics.invalidEdges.length} relationship(s) have invalid endpoints.`}

            </span>

          </div>

        </div>


        {/* Duplicate nodes */}

        <div className="system-health-check">

          <div className="system-health-check-indicator">

            {diagnostics.duplicateNodeCount === 0
              ? "✓"
              : "!"}

          </div>


          <div className="system-health-check-content">

            <strong>
              Node identifiers
            </strong>

            <span>

              {diagnostics.duplicateNodeCount === 0
                ? "No duplicate node identifiers detected."
                : `${diagnostics.duplicateNodeCount} duplicate node identifier(s) detected.`}

            </span>

          </div>

        </div>


        {/* Graph identifiers */}

        <div className="system-health-check">

          <div className="system-health-check-indicator">

            {diagnostics.duplicateGraphCount === 0
              ? "✓"
              : "!"}

          </div>


          <div className="system-health-check-content">

            <strong>
              Graph identifiers
            </strong>

            <span>

              {diagnostics.duplicateGraphCount === 0
                ? "No duplicate graph identifiers detected."
                : `${diagnostics.duplicateGraphCount} duplicate graph identifier(s) detected.`}

            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          FOOTER
          ================================================= */}

      <div className="system-health-footer">

        <span>
          Diagnostics ready
        </span>

        <span>
          MindMesh Knowledge Workspace
        </span>

      </div>

    </section>
  );
};


export default SystemHealth;