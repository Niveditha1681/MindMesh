import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";
import "./DiscoveryGraphViewer.css";
import {
  getNodesByGraph,
} from "../../services/nodeService";

import {
  getEdgesByGraph,
} from "../../services/edgeService";

import EdgeElement
  from "../canvas/EdgeElement";


const DiscoveryGraphViewer = () => {

  /*
   * =========================================================
   * ROUTER
   * =========================================================
   */

  const {
    graphId,
  } = useParams();


  const navigate =
    useNavigate();


  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [
    nodes,
    setNodes,
  ] = useState([]);


  const [
    edges,
    setEdges,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  /*
   * =========================================================
   * FORCE PAGE TO TOP
   * =========================================================
   */

  useEffect(() => {

    window.scrollTo(
      0,
      0
    );


    document.documentElement.scrollTop = 0;

    document.body.scrollTop = 0;


  }, [graphId]);


  /*
   * =========================================================
   * LOAD GRAPH DATA
   * =========================================================
   */

  useEffect(() => {

    const loadGraph = async () => {

      try {

        setLoading(true);

        setError("");


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
         * ===================================================
         * SAFE NODES
         * ===================================================
         */

        const graphNodes =
          Array.isArray(nodeData)
            ? nodeData
            : (
              nodeData?.data ||
              nodeData?.nodes ||
              nodeData?.content ||
              []
            );


        /*
         * ===================================================
         * SAFE EDGES
         * ===================================================
         */

        const graphEdges =
          Array.isArray(edgeData)
            ? edgeData
            : (
              edgeData?.data ||
              edgeData?.edges ||
              edgeData?.content ||
              []
            );


        setNodes(
          Array.isArray(graphNodes)
            ? graphNodes
            : []
        );


        setEdges(
          Array.isArray(graphEdges)
            ? graphEdges
            : []
        );


      } catch (err) {

        console.error(
          "Discovery graph loading error:",
          err
        );


        setError(
          err?.message ||
          "Unable to load graph."
        );


        setNodes([]);

        setEdges([]);


      } finally {

        setLoading(false);

      }

    };


    if (graphId) {

      loadGraph();

    }


  }, [graphId]);


  /*
   * =========================================================
   * FIND NODE
   * =========================================================
   */

  const findNode = (nodeId) => {

    return nodes.find(
      (node) =>
        Number(
          node?.id ||
          node?.nodeId
        ) === Number(nodeId)
    );

  };


  /*
   * =========================================================
   * BACK TO DISCOVERY
   * =========================================================
   */

  const handleBackToDiscovery = () => {

    window.scrollTo(
      0,
      0
    );


    navigate(
      "/discovery"
    );

  };


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {

    return (

      <div className="discovery-graph-page">

        <div className="discovery-graph-loading">

          <div className="discovery-loading-spinner" />

          <p>
            Loading knowledge mesh...
          </p>

        </div>

      </div>

    );

  }


  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error) {

    return (

      <div className="discovery-graph-page">

        <div className="discovery-graph-error">

          <h2>
            Unable to Load Mesh
          </h2>


          <p>
            {error}
          </p>


          <button
            type="button"
            className="back-discovery-btn"
            onClick={
              handleBackToDiscovery
            }
          >

            ← Back to Discovery

          </button>

        </div>

      </div>

    );

  }


  /*
   * =========================================================
   * MAIN VIEWER
   * =========================================================
   */

  return (

    <div className="discovery-graph-page">


      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="discovery-graph-header">


        <div className="discovery-graph-header-content">


          <span className="section-label">

            KNOWLEDGE MESH

          </span>


          <h1>

            Mesh Insight: View

          </h1>


          <p>

            Explore concepts and relationships
            in this knowledge mesh.

          </p>


        </div>


        <button
          type="button"
          className="back-discovery-btn"
          onClick={
            handleBackToDiscovery
          }
        >

          ← Back to Discovery

        </button>


      </div>


      {/* ===================================================
          GRAPH INFORMATION
          =================================================== */}

      <div className="discovery-graph-info">


        {/* CONCEPTS */}

        <div className="discovery-info-card">

          <span>

            Concepts

          </span>


          <strong>

            {nodes.length}

          </strong>

        </div>


        {/* RELATIONSHIPS */}

        <div className="discovery-info-card">

          <span>

            Relationships

          </span>


          <strong>

            {edges.length}

          </strong>

        </div>


        {/* GRAPH ID */}

        <div className="discovery-info-card">

          <span>

            Graph ID

          </span>


          <strong>

            {graphId}

          </strong>

        </div>


      </div>


      {/* ===================================================
          CANVAS SECTION
          =================================================== */}

      <section className="discovery-graph-canvas-section">


        <div className="discovery-canvas-heading">


          <span className="section-label">

            GRAPH VISUALIZATION

          </span>


          <h2>

            Knowledge Mesh Canvas

          </h2>


          <p>

            Visual representation of concepts
            and their relationships.

          </p>


        </div>


        {/* =================================================
            CANVAS
            ================================================= */}

        <div className="discovery-graph-canvas">


          {/* ===============================================
              EMPTY STATE
              =============================================== */}

          {nodes.length === 0 && (

            <div className="discovery-canvas-empty">


              <div className="discovery-empty-icon">

                ◇

              </div>


              <h3>

                No Concepts Available

              </h3>


              <p>

                This knowledge mesh does not
                currently contain any concepts.

              </p>


            </div>

          )}


          {/* ===============================================
              EDGES
              =============================================== */}

          {edges.map(
            (edge) => {


              const sourceId =
                edge?.sourceNode?.id ||
                edge?.sourceId ||
                edge?.sourceNodeId ||
                edge?.source;


              const targetId =
                edge?.targetNode?.id ||
                edge?.targetId ||
                edge?.targetNodeId ||
                edge?.target;


              const sourceNode =
                findNode(sourceId);


              const targetNode =
                findNode(targetId);


              /*
               * Skip invalid relationships.
               */

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

            }
          )}


          {/* ===============================================
              NODES
              =============================================== */}

          {nodes.map(
            (node) => {


              /*
               * X POSITION
               */

              const x =
                Number.isFinite(
                  Number(node?.xCoordinate)
                )
                  ? Number(
                      node.xCoordinate
                    )
                  : 100;


              /*
               * Y POSITION
               */

              const y =
                Number.isFinite(
                  Number(node?.yCoordinate)
                )
                  ? Number(
                      node.yCoordinate
                    )
                  : 100;


              /*
               * COLOR
               */

              const color =
                /^#[0-9A-Fa-f]{6}$/.test(
                  node?.colorHex || ""
                )
                  ? node.colorHex
                  : "#2563eb";


              return (

                <div
                  key={
                    node?.id ||
                    node?.nodeId
                  }
                  className="discovery-graph-node"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    borderColor: color,
                  }}
                >


                  <div
                    className="discovery-graph-node-dot"
                    style={{
                      backgroundColor: color,
                    }}
                  />


                  <div className="discovery-node-content">


                    <strong>

                      {
                        node?.label ||
                        node?.name ||
                        "Untitled Concept"
                      }

                    </strong>


                    <span>

                      {
                        node?.contentType ||
                        node?.type ||
                        "CONCEPT"
                      }

                    </span>


                  </div>


                </div>

              );

            }
          )}


        </div>


        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="discovery-graph-footer">


          <span>

            {nodes.length}{" "}

            {nodes.length === 1
              ? "Concept"
              : "Concepts"}

          </span>


          <span>

            {edges.length}{" "}

            {edges.length === 1
              ? "Relationship"
              : "Relationships"}

          </span>


        </div>


      </section>


    </div>

  );

};


export default DiscoveryGraphViewer;