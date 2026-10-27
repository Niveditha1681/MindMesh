import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { useSelector } from "react-redux";

import {
  getNodesByGraph,
  validateNodeLayout,
  updateNodePosition,
} from "../../services/nodeService";

import {
  getEdgesByGraph,
} from "../../services/edgeService";

import {
  getGraphAnalysis,
} from "../../services/graphService";

import EdgeElement from "./EdgeElement";
import MeshPreview from "./MeshPreview";


/*
 * =========================================================
 * ROLE NORMALIZATION
 * =========================================================
 */

const normalizeRole = (role) => {

  return String(role || "")
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "");

};


/*
 * =========================================================
 * GRAPH CANVAS
 * =========================================================
 */

const GraphCanvas = ({
  graphId,
  refreshKey = 0,
}) => {

  /*
   * =========================================================
   * AUTHENTICATED USER
   * =========================================================
   */

  const currentUser = useSelector(
    (state) => state.auth?.user
  );

  const userRole =
    normalizeRole(
      currentUser?.role
    );


  /*
   * Knowledge Architects, Research Strategists
   * and existing ADMIN users can edit.
   */

  const canEditGraph =
    userRole === "ADMIN" ||
    userRole === "KNOWLEDGE_ARCHITECT" ||
    userRole === "RESEARCH_STRATEGIST";


  /*
   * =========================================================
   * GRAPH DATA
   * =========================================================
   */

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [savingPosition, setSavingPosition] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [analysis, setAnalysis] =
    useState(null);

  const [analysisLoading, setAnalysisLoading] =
    useState(false);


  /*
   * Selected node opens MeshPreview.
   */

  const [
    selectedNodeId,
    setSelectedNodeId,
  ] = useState(null);


  /*
   * =========================================================
   * CANVAS + DRAG REFERENCES
   * =========================================================
   */

  const canvasRef =
    useRef(null);


  /*
   * IMPORTANT:
   *
   * currentX/currentY store the latest mouse position
   * independently of React state.
   *
   * This guarantees that mouseup always saves the
   * actual final coordinates.
   */

  const dragStateRef =
    useRef({

      dragging: false,

      nodeId: null,

      offsetX: 0,

      offsetY: 0,

      currentX: 0,

      currentY: 0,

    });


  /*
   * Used to distinguish click from drag.
   */

  const dragMovedRef =
    useRef(false);


  /*
   * Latest nodes reference.
   */

  const nodesRef =
    useRef([]);


  useEffect(() => {

    nodesRef.current =
      nodes;

  }, [
    nodes,
  ]);


  /*
   * =========================================================
   * LOAD GRAPH DATA
   * =========================================================
   */

  const loadGraphData = async () => {

    if (!graphId) {

      setNodes([]);

      setEdges([]);

      setAnalysis(null);

      setSelectedNodeId(null);

      setError("");

      setMessage("");

      return;
    }


    setLoading(true);

    setAnalysisLoading(true);

    setError("");

    setMessage("");


    try {

      /*
       * Load nodes and edges together.
       */

      const [
        nodeData,
        edgeData,
      ] = await Promise.all([

        getNodesByGraph(
          graphId
        ),

        getEdgesByGraph(
          graphId
        ),

      ]);


      /*
       * Normalize nodes.
       */

      const graphNodes =
  Array.isArray(nodeData)
    ? nodeData.map((node) => ({

        ...node,

        xCoordinate:
          node?.xCoordinate ??
          node?.xcoordinate ??
          40,

        yCoordinate:
          node?.yCoordinate ??
          node?.ycoordinate ??
          40,

      }))
    : [];


      /*
       * Normalize edges.
       */

      const graphEdges =
        Array.isArray(edgeData)
          ? edgeData
          : [];


      setNodes(
        graphNodes
      );

      setEdges(
        graphEdges
      );


      /*
       * Keep ref immediately synchronized.
       */

      nodesRef.current =
        graphNodes;


      /*
       * Remove selection if selected node
       * no longer exists.
       */

      setSelectedNodeId(
        (previousSelectedId) => {

          if (
            previousSelectedId === null ||
            previousSelectedId === undefined
          ) {

            return null;

          }


          const stillExists =
            graphNodes.some(
              (node) =>
                Number(node?.id) ===
                Number(previousSelectedId)
            );


          return stillExists
            ? previousSelectedId
            : null;

        }
      );


      /*
       * =====================================================
       * LOAD REAL GRAPH ANALYSIS
       * =====================================================
       */

      try {

        const analysisData =
          await getGraphAnalysis(
            graphId
          );


        setAnalysis(
          analysisData || null
        );

      } catch (analysisError) {

        console.warn(
          "Graph analysis could not be loaded:",
          analysisError
        );


        setAnalysis(
          null
        );

      }

    } catch (err) {

      setError(
        err.message ||
        "Unable to load graph data."
      );

    } finally {

      setLoading(false);

      setAnalysisLoading(false);

    }

  };


  /*
   * =========================================================
   * LOAD WHEN GRAPH OR REFRESH CHANGES
   * =========================================================
   */

  useEffect(() => {

    loadGraphData();

  }, [
    graphId,
    refreshKey,
  ]);


  /*
   * =========================================================
   * VALIDATE LAYOUT
   * =========================================================
   */

  const handleValidateLayout = async () => {

    if (!graphId) {
      return;
    }


    setValidating(true);

    setError("");

    setMessage("");


    try {

      const response =
        await validateNodeLayout(
          graphId
        );


      setMessage(
        typeof response === "string"
          ? response
          : "Layout validation completed successfully."
      );


      await loadGraphData();

    } catch (err) {

      setError(
        err.message ||
        "Unable to validate node layout."
      );

    } finally {

      setValidating(false);

    }

  };


  /*
   * =========================================================
   * FIND NODE
   * =========================================================
   */

  const findNode = (nodeId) => {

    return nodes.find(
      (node) =>
        Number(node?.id) ===
        Number(nodeId)
    );

  };


  /*
   * =========================================================
   * SELECT NODE
   * =========================================================
   */

  const handleNodeClick = (nodeId) => {

    /*
     * If the user dragged, ignore the click event
     * fired after mouseup.
     */

    if (
      dragMovedRef.current
    ) {

      dragMovedRef.current =
        false;

      return;

    }


    setSelectedNodeId(
      (previousSelectedId) => {

        if (
          Number(previousSelectedId) ===
          Number(nodeId)
        ) {

          return null;

        }


        return nodeId;

      }
    );

  };


  /*
   * =========================================================
   * START NODE DRAG
   * =========================================================
   */

  const handleNodeMouseDown = (
    event,
    node
  ) => {

    /*
     * Read-only users cannot drag.
     */

    if (!canEditGraph) {
      return;
    }


    if (!canvasRef.current) {
      return;
    }


    /*
     * Only use the primary mouse button.
     */

    if (
      event.button !== 0
    ) {

      return;

    }


    event.preventDefault();


    const canvas =
      canvasRef.current;


    const canvasRect =
      canvas.getBoundingClientRect();


    /*
     * Current persisted position.
     */

    const currentX =
      Number.isFinite(
        Number(node?.xCoordinate)
      )
        ? Number(
            node.xCoordinate
          )
        : 40;


    const currentY =
      Number.isFinite(
        Number(node?.yCoordinate)
      )
        ? Number(
            node.yCoordinate
          )
        : 40;


    /*
     * Mouse position inside scrollable canvas.
     */

    const mouseX =
      event.clientX -
      canvasRect.left +
      canvas.scrollLeft;


    const mouseY =
      event.clientY -
      canvasRect.top +
      canvas.scrollTop;


    /*
     * Initialize drag state.
     */

    dragStateRef.current = {

      dragging: true,

      nodeId: node?.id,

      offsetX:
        mouseX -
        currentX,

      offsetY:
        mouseY -
        currentY,

      currentX:
        currentX,

      currentY:
        currentY,

    };


    dragMovedRef.current =
      false;

  };


  /*
   * =========================================================
   * NODE DRAGGING
   * =========================================================
   *
   * IMPORTANT:
   *
   * This effect does NOT depend on `nodes`.
   *
   * Therefore the document listeners remain stable
   * during the entire drag.
   */

  useEffect(() => {

    const handleMouseMove = (
      event
    ) => {

      const drag =
        dragStateRef.current;


      if (
        !drag.dragging ||
        !canvasRef.current
      ) {

        return;

      }


      const canvas =
        canvasRef.current;


      const canvasRect =
        canvas.getBoundingClientRect();


      /*
       * Calculate current mouse position.
       */

      let newX =
        event.clientX -
        canvasRect.left +
        canvas.scrollLeft -
        drag.offsetX;


      let newY =
        event.clientY -
        canvasRect.top +
        canvas.scrollTop -
        drag.offsetY;


      /*
       * Prevent negative coordinates.
       */

      newX =
        Math.max(
          30,
          Math.round(
            newX
          )
        );


      newY =
        Math.max(
          30,
          Math.round(
            newY
          )
        );


      /*
       * CRITICAL:
       *
       * Store final coordinates directly in the ref.
       *
       * This happens immediately and does not depend
       * on React's asynchronous state updates.
       */

      dragStateRef.current.currentX =
        newX;

      dragStateRef.current.currentY =
        newY;


      dragMovedRef.current =
        true;


      /*
       * Update visual node position.
       */

      setNodes(
        (previousNodes) => {

          const updatedNodes =
            previousNodes.map(
              (node) => {

                if (
                  Number(node?.id) !==
                  Number(
                    drag.nodeId
                  )
                ) {

                  return node;

                }


                return {

                  ...node,

                  xCoordinate:
                    newX,

                  yCoordinate:
                    newY,

                };

              }
            );


          /*
           * Keep latest state synchronized.
           */

          nodesRef.current =
            updatedNodes;


          return updatedNodes;

        }
      );

    };


    const handleMouseUp =
      async () => {

        const drag =
          dragStateRef.current;


        if (
          !drag.dragging
        ) {

          return;

        }


        /*
         * Capture the final coordinates BEFORE
         * resetting the drag state.
         */

        const nodeId =
          drag.nodeId;

        const x =
          Number(
            drag.currentX
          );

        const y =
          Number(
            drag.currentY
          );


        /*
         * Stop dragging.
         */

        dragStateRef.current = {

          dragging: false,

          nodeId: null,

          offsetX: 0,

          offsetY: 0,

          currentX: 0,

          currentY: 0,

        };


        /*
         * No movement means this was only a click.
         */

        if (
          !dragMovedRef.current ||
          !nodeId
        ) {

          return;

        }


        /*
         * Validate final coordinates.
         */

        if (
          !Number.isFinite(x) ||
          !Number.isFinite(y)
        ) {

          setError(
            "Invalid node position."
          );

          dragMovedRef.current =
            false;

          return;

        }


        /*
         * Save position.
         */

        setSavingPosition(
          true
        );

        setError("");

        setMessage("");


        try {

          await updateNodePosition(
            nodeId,
            x,
            y
          );


          setMessage(
            `Node position saved successfully. X: ${x}, Y: ${y}`
          );


        } catch (err) {

          setError(
            err.message ||
            "Unable to save node position."
          );


          /*
           * Restore the persisted backend position.
           */

          await loadGraphData();

        } finally {

          setSavingPosition(
            false
          );


          dragMovedRef.current =
            false;

        }

      };


    document.addEventListener(
      "mousemove",
      handleMouseMove
    );


    document.addEventListener(
      "mouseup",
      handleMouseUp
    );


    return () => {

      document.removeEventListener(
        "mousemove",
        handleMouseMove
      );


      document.removeEventListener(
        "mouseup",
        handleMouseUp
      );

    };

  }, [
    canEditGraph,
  ]);


  /*
   * =========================================================
   * ANALYSIS VALUES
   * =========================================================
   */

  const displayedNodeCount =
    Number.isFinite(
      Number(
        analysis?.nodeCount
      )
    )
      ? Number(
          analysis.nodeCount
        )
      : nodes.length;


  const displayedEdgeCount =
    Number.isFinite(
      Number(
        analysis?.edgeCount
      )
    )
      ? Number(
          analysis.edgeCount
        )
      : edges.length;


  const displayedConnectedNodeCount =
    Number.isFinite(
      Number(
        analysis?.connectedNodeCount
      )
    )
      ? Number(
          analysis.connectedNodeCount
        )
      : Math.max(
          0,
          nodes.length -
          (
            Array.isArray(
              analysis?.disconnectedNodes
            )
              ? analysis.disconnectedNodes.length
              : 0
          )
        );


  const displayedDisconnectedNodeCount =
    Number.isFinite(
      Number(
        analysis?.disconnectedNodeCount
      )
    )
      ? Number(
          analysis.disconnectedNodeCount
        )
      : Array.isArray(
          analysis?.disconnectedNodes
        )
          ? analysis.disconnectedNodes.length
          : 0;


  const displayedComplexity =
    Number.isFinite(
      Number(
        analysis?.complexityScore
      )
    )
      ? Number(
          analysis.complexityScore
        )
      : (
          displayedEdgeCount *
          2
        ) /
        Math.max(
          displayedNodeCount,
          1
        );


  const displayedDensity =
    Number.isFinite(
      Number(
        analysis?.density
      )
    )
      ? Number(
          analysis.density
        )
      : 0;


  const disconnectedNodes =
    Array.isArray(
      analysis?.disconnectedNodes
    )
      ? analysis.disconnectedNodes
      : [];


  /*
   * =========================================================
   * NO GRAPH SELECTED
   * =========================================================
   */

  if (!graphId) {

    return (

      <section className="graph-canvas-section">

        <div className="graph-canvas-header">

          <div>

            <span className="section-label">
              GRAPH VISUALIZATION
            </span>

            <h2>
              Mind Graph Canvas
            </h2>

            <p>
              Select a knowledge graph to visualize
              its concepts and relationships.
            </p>

          </div>

        </div>


        <div className="canvas-empty-state">

          <div className="canvas-empty-icon">
            ◇
          </div>

          <h3>
            No graph selected
          </h3>

          <p>
            Select a Mind Graph to start exploring
            its connected concepts.
          </p>

        </div>

      </section>

    );

  }


  /*
   * =========================================================
   * MAIN UI
   * =========================================================
   */

  return (

    <section className="graph-canvas-section">


      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="graph-canvas-header">

        <div>

          <span className="section-label">
            GRAPH VISUALIZATION
          </span>

          <h2>
            Mind Graph Canvas
          </h2>

          <p>
            Visual representation of concepts
            and semantic relationships.
          </p>

        </div>


        <div className="canvas-actions">

          <button
            type="button"
            className="graph-action-button"
            onClick={
              loadGraphData
            }
            disabled={
              loading ||
              savingPosition
            }
          >

            {loading
              ? "Loading..."
              : "Refresh"}

          </button>


          <button
            type="button"
            className="graph-action-button"
            onClick={
              handleValidateLayout
            }
            disabled={
              validating ||
              savingPosition
            }
          >

            {validating
              ? "Validating..."
              : "Validate Layout"}

          </button>

        </div>

      </div>


      {/* ===================================================
          ROLE STATUS
          =================================================== */}

      <div
        className={
          canEditGraph
            ? "canvas-role-status editable"
            : "canvas-role-status readonly"
        }
      >

        {canEditGraph
          ? "Editing enabled — drag nodes to reposition them."
          : "Read-only mode — graph editing is disabled."}

      </div>


      {/* ===================================================
          SUCCESS MESSAGE
          =================================================== */}

      {message && (

        <div
          className="success-message"
          role="status"
        >

          {message}

        </div>

      )}


      {/* ===================================================
          ERROR MESSAGE
          =================================================== */}

      {error && (

        <div
          className="error-message"
          role="alert"
        >

          {error}

        </div>

      )}


      {/* ===================================================
          GRAPH ANALYSIS
          =================================================== */}

      <div className="graph-analysis-panel">

        <div className="graph-analysis-header">

          <div>

            <span className="section-label">
              GRAPH ANALYSIS
            </span>

            <h3>
              Structural Statistics
            </h3>

          </div>


          {analysisLoading && (

            <span className="graph-analysis-loading">
              Updating...
            </span>

          )}

        </div>


        <div className="graph-analysis-grid">


          <div className="graph-analysis-card">

            <span>
              Nodes
            </span>

            <strong>
              {displayedNodeCount}
            </strong>

          </div>


          <div className="graph-analysis-card">

            <span>
              Relationships
            </span>

            <strong>
              {displayedEdgeCount}
            </strong>

          </div>


          <div className="graph-analysis-card">

            <span>
              Connected
            </span>

            <strong>
              {displayedConnectedNodeCount}
            </strong>

          </div>


          <div
            className={
              displayedDisconnectedNodeCount > 0
                ? "graph-analysis-card warning"
                : "graph-analysis-card"
            }
          >

            <span>
              Disconnected
            </span>

            <strong>
              {displayedDisconnectedNodeCount}
            </strong>

          </div>


          <div className="graph-analysis-card">

            <span>
              Complexity
            </span>

            <strong>
              {displayedComplexity.toFixed(2)}
            </strong>

          </div>


          <div className="graph-analysis-card">

            <span>
              Density
            </span>

            <strong>
              {displayedDensity.toFixed(3)}
            </strong>

          </div>

        </div>


        {/* =================================================
            DISCONNECTED NODES
            ================================================= */}

        {displayedDisconnectedNodeCount > 0 && (

          <div className="disconnected-nodes-panel">

            <div className="disconnected-nodes-title">

              <strong>
                Disconnected Nodes
              </strong>

              <span>
                These concepts currently have no
                relationship connected to another node.
              </span>

            </div>


            <div className="disconnected-node-list">

              {disconnectedNodes.map(
                (node) => (

                  <button
                    key={node?.id}
                    type="button"
                    className="disconnected-node-item"
                    onClick={() =>
                      setSelectedNodeId(
                        node?.id
                      )
                    }
                  >

                    <strong>
                      {node?.label ||
                        "Untitled Node"}
                    </strong>

                    <span>
                      {node?.contentType ||
                        "TEXT"}
                    </span>

                  </button>

                )
              )}

            </div>

          </div>

        )}

      </div>


      {/* ===================================================
          ACTUAL GRAPH CANVAS
          =================================================== */}

      <div
        ref={canvasRef}
        className="mind-graph-canvas"
      >


        {loading &&
        nodes.length === 0 ? (

          <div className="canvas-loading">

            <div className="graph-spinner"></div>

            <p>
              Loading graph...
            </p>

          </div>


        ) : nodes.length === 0 ? (

          <div className="canvas-empty-state">

            <div className="canvas-empty-icon">
              +
            </div>

            <h3>
              No concept nodes
            </h3>

            <p>
              Add concept nodes to this graph
              to see them appear here.
            </p>

          </div>


        ) : (

          <>


            {/* =================================================
                EDGES
                ================================================= */}

            {edges.map((edge) => {

              const sourceId =
                edge?.sourceNode?.id;

              const targetId =
                edge?.targetNode?.id;


              const sourceNode =
                findNode(
                  sourceId
                );

              const targetNode =
                findNode(
                  targetId
                );


              if (
                !sourceNode ||
                !targetNode
              ) {

                return null;

              }


              return (

                <EdgeElement
                  key={
                    edge?.id ||
                    `${sourceId}-${targetId}`
                  }
                  edge={edge}
                  sourceNode={sourceNode}
                  targetNode={targetNode}
                />

              );

            })}


            {/* =================================================
                NODES
                ================================================= */}

            {nodes.map(
              (node) => {

                const x =
                  Number.isFinite(
                    Number(
                      node?.xCoordinate
                    )
                  )
                    ? Number(
                        node.xCoordinate
                      )
                    : 40;


                const y =
                  Number.isFinite(
                    Number(
                      node?.yCoordinate
                    )
                  )
                    ? Number(
                        node.yCoordinate
                      )
                    : 40;


                const color =
                  /^#[0-9A-Fa-f]{6}$/.test(
                    node?.colorHex || ""
                  )
                    ? node.colorHex
                    : "#2563eb";


                const isSelected =
                  Number(node?.id) ===
                  Number(
                    selectedNodeId
                  );


                return (

                  <div
                    className={
                      isSelected
                        ? "mind-graph-node selected"
                        : "mind-graph-node"
                    }

                    key={node?.id}

                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      borderColor: color,
                      zIndex: 2,
                      cursor:
                        canEditGraph
                          ? "grab"
                          : "default",
                    }}

                    onMouseDown={(
                      event
                    ) =>
                      handleNodeMouseDown(
                        event,
                        node
                      )
                    }

                    onClick={() =>
                      handleNodeClick(
                        node?.id
                      )
                    }

                    role="button"

                    tabIndex={0}

                    aria-label={
                      canEditGraph
                        ? `Select and drag ${
                            node?.label ||
                            "Untitled Node"
                          }`
                        : `Select ${
                            node?.label ||
                            "Untitled Node"
                          }`
                    }

                    onKeyDown={(event) => {

                      if (
                        event.key ===
                          "Enter" ||
                        event.key ===
                          " "
                      ) {

                        event.preventDefault();

                        handleNodeClick(
                          node?.id
                        );

                      }

                    }}
                  >


                    <div
                      className="mind-graph-node-dot"
                      style={{
                        backgroundColor:
                          color,
                      }}
                    />


                    <div className="mind-graph-node-content">

                      <strong>
                        {node?.label ||
                          "Untitled Node"}
                      </strong>


                      <span>
                        {node?.contentType ||
                          "TEXT"}
                      </span>
                      <small>
  X: {x} | Y: {y}
</small>

                    </div>


                  </div>

                );

              }
            )}

          </>

        )}

      </div>


      {/* ===================================================
          CANVAS FOOTER
          =================================================== */}

      <div className="graph-canvas-footer">

        <span>
          {nodes.length}{" "}
          {nodes.length === 1
            ? "concept"
            : "concepts"}
        </span>


        <span>
          {edges.length}{" "}
          {edges.length === 1
            ? "relationship"
            : "relationships"}
        </span>


        <span>
          Graph ID: {graphId}
        </span>


        {savingPosition && (

          <span>
            Saving position...
          </span>

        )}

      </div>


      {/* ===================================================
          NODE INSIGHT
          =================================================== */}

      <MeshPreview
        nodes={nodes}
        edges={edges}
        selectedNodeId={
          selectedNodeId
        }
        onClose={() =>
          setSelectedNodeId(null)
        }
      />


    </section>

  );

};


export default GraphCanvas;