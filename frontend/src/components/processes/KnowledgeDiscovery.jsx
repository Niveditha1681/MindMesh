import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSelector,
} from "react-redux";

import {
  getNodesByGraph,
} from "../../services/nodeService";

import {
  getEdgesByGraph,
} from "../../services/edgeService";

import * as graphServiceModule
  from "../../services/graphService";

import "./KnowledgeDiscovery.css";


const KnowledgeDiscovery = () => {

  /* =========================================================
     AUTHENTICATED USER
  ========================================================= */

  const user = useSelector(
    (state) => state?.auth?.user
  );
  

  /* =========================================================
     STATE
  ========================================================= */

  const [
    graphs,
    setGraphs,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  /* =========================================================
     INSIGHT MODAL STATE
  ========================================================= */

  const [
    selectedGraph,
    setSelectedGraph,
  ] = useState(null);


  const [
    insightNodes,
    setInsightNodes,
  ] = useState([]);


  const [
    insightEdges,
    setInsightEdges,
  ] = useState([]);


  const [
    insightLoading,
    setInsightLoading,
  ] = useState(false);


  const [
    insightError,
    setInsightError,
  ] = useState("");


  const graphsPerPage = 3;


  /* =========================================================
     LOAD GRAPHS
  ========================================================= */

  useEffect(() => {

    const loadGraphs = async () => {

      try {

        setLoading(true);

        setError("");


        const response =
          await graphServiceModule.getGraphs();


        const graphList =
          Array.isArray(response)
            ? response
            : (
              response?.data ||
              response?.content ||
              response?.graphs ||
              []
            );


        const publicGraphs =
          graphList.filter(
            (graph) => {

              const visibility =
                (
                  graph?.visibility ||
                  graph?.accessType ||
                  graph?.privacy ||
                  ""
                )
                  .toString()
                  .trim()
                  .toUpperCase();


              return visibility !== "PRIVATE";

            }
          );


        setGraphs(publicGraphs);


      } catch (err) {

        console.error(
          "Knowledge discovery loading error:",
          err
        );


        setError(
          err?.message ||
          "Unable to load knowledge meshes."
        );


        setGraphs([]);


      } finally {

        setLoading(false);

      }

    };


    loadGraphs();

  }, []);


  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        graphs.length /
        graphsPerPage
      )
    );


  const paginatedGraphs =
    useMemo(() => {

      const startIndex =
        (currentPage - 1) *
        graphsPerPage;


      return graphs.slice(
        startIndex,
        startIndex + graphsPerPage
      );


    }, [
      graphs,
      currentPage,
    ]);


  /* =========================================================
     TRENDING TOPICS
  ========================================================= */

  const trendingTopics =
    useMemo(() => {

      const topics =
        new Set();


      graphs.forEach(
        (graph) => {

          const graphTopics =
            graph?.topics ||
            graph?.tags ||
            graph?.keywords ||
            [];


          if (
            Array.isArray(graphTopics)
          ) {

            graphTopics.forEach(
              (topic) => {

                const topicName =
                  typeof topic === "string"
                    ? topic
                    : (
                      topic?.name ||
                      topic?.label ||
                      ""
                    );


                if (topicName) {

                  topics.add(topicName);

                }

              }
            );

          }

        }
      );


      return Array.from(topics)
        .filter(Boolean)
        .slice(0, 6);


    }, [graphs]);


  /* =========================================================
     OPEN INSIGHT MODAL
  ========================================================= */

  const handleViewCanvas = async (
    graph
  ) => {

    const graphId =
      graph?.id ||
      graph?.graphId;


    if (
      graphId === undefined ||
      graphId === null
    ) {

      return;

    }


    /* =========================================================
       VIEWER ID
    ========================================================= */

    const viewerId =
      user?.id ??
      user?.userId ??
      user?.ownerId ??
      null;


    /* =========================================================
       AUTOMATIC ACTIVITY HISTORY
    =========================================================
    
    When the user clicks View Canvas:

    POST /api/graphs/{graphId}/view?viewerId={viewerId}

    The backend automatically stores:

    VIEW | graph title | viewerId | timestamp

    Failure to record the history must NOT prevent
    the user from opening the mesh.
    ========================================================= */

    if (
      viewerId !== null &&
      typeof graphServiceModule.recordGraphView ===
        "function"
    ) {

      try {

        await graphServiceModule.recordGraphView(
          graphId,
          viewerId
        );

      } catch (viewError) {

        console.warn(
          "Unable to record graph view activity:",
          viewError
        );

      }

    }


    /* =========================================================
       OPEN MODAL
    ========================================================= */

    setSelectedGraph(graph);

    setInsightNodes([]);

    setInsightEdges([]);

    setInsightError("");

    setInsightLoading(true);


    /* =========================================================
       LOAD GRAPH STRUCTURE
    ========================================================= */

    try {

      const [
        nodeResponse,
        edgeResponse,
      ] = await Promise.all([

        getNodesByGraph(graphId),

        getEdgesByGraph(graphId),

      ]);


      const nodes =
        Array.isArray(nodeResponse)
          ? nodeResponse
          : (
            nodeResponse?.data ||
            nodeResponse?.content ||
            nodeResponse?.nodes ||
            []
          );


      const edges =
        Array.isArray(edgeResponse)
          ? edgeResponse
          : (
            edgeResponse?.data ||
            edgeResponse?.content ||
            edgeResponse?.edges ||
            []
          );


      setInsightNodes(
        Array.isArray(nodes)
          ? nodes
          : []
      );


      setInsightEdges(
        Array.isArray(edges)
          ? edges
          : []
      );


    } catch (err) {

      console.error(
        "Unable to load mesh insight:",
        err
      );


      setInsightError(
        err?.message ||
        "Unable to load mesh structure."
      );


      setInsightNodes([]);

      setInsightEdges([]);


    } finally {

      setInsightLoading(false);

    }

  };


  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeInsight = () => {

    setSelectedGraph(null);

    setInsightNodes([]);

    setInsightEdges([]);

    setInsightError("");

    setInsightLoading(false);

  };


  /* =========================================================
     COMPLEXITY
  ========================================================= */

  const complexityScore =
    insightNodes.length > 0
      ? (
        insightEdges.length /
        insightNodes.length
      ).toFixed(1)
      : "0.0";


  /* =========================================================
     PAGE HEADER
  ========================================================= */

  const renderPageHeader = () => (

    <div className="discovery-page-header">

      <span className="section-label">
        DISCOVERY
      </span>

      <h1>
        Knowledge Discovery
      </h1>

      <p>
        Explore public knowledge meshes and find
        inspiration for your own work.
      </p>

    </div>

  );


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <div className="discovery-page">

        {renderPageHeader()}

        <div className="discovery-loading">
          Loading knowledge meshes...
        </div>

      </div>

    );

  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {

    return (

      <div className="discovery-page">

        {renderPageHeader()}

        <div className="discovery-empty">

          <h3>
            Unable to load knowledge meshes
          </h3>

          <p>
            {error}
          </p>

        </div>

      </div>

    );

  }


  /* =========================================================
     MAIN
  ========================================================= */

  return (

    <div className="discovery-page">


      {renderPageHeader()}


      {/* =====================================================
          KNOWLEDGE MESHES
      ===================================================== */}

      {paginatedGraphs.length > 0 ? (

        <>

          <div className="discovery-grid">


            {paginatedGraphs.map(
              (graph, index) => {


                const graphId =
                  graph?.id ||
                  graph?.graphId ||
                  index;


                const title =
                  graph?.name ||
                  graph?.title ||
                  "Untitled Knowledge Mesh";


                const description =
                  graph?.description ||
                  graph?.summary ||
                  "Explore concepts and relationships in this knowledge mesh.";


                return (

                  <div
                    className="discovery-card"
                    key={graphId}
                  >


                    <div className="mesh-badge">
                      PUBLIC MESH
                    </div>


                    <h2 className="mesh-title">
                      {title}
                    </h2>


                    <p className="mesh-description">
                      {description}
                    </p>


                    <button
                      type="button"
                      className="view-canvas-btn"
                      onClick={() =>
                        handleViewCanvas(graph)
                      }
                    >

                      View Canvas

                    </button>


                  </div>

                );

              }
            )}


          </div>


          {/* =================================================
              PAGINATION
          ================================================= */}

          <div className="discovery-pagination">

            <button
              type="button"
              className="pagination-btn"
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                )
              }
            >
              Previous
            </button>


            <span className="page-info">

              Page {currentPage} of {totalPages}

            </span>


            <button
              type="button"
              className="pagination-btn"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                )
              }
            >
              Next
            </button>

          </div>

        </>

      ) : (

        <div className="discovery-empty">

          <h3>
            No public meshes available
          </h3>

          <p>
            Public knowledge meshes will appear here.
          </p>

        </div>

      )}


      {/* =====================================================
          TRENDING TOPICS
      ===================================================== */}

      <div className="trending-section">

        <span className="section-label">
          DISCOVERY TOPICS
        </span>


        <h2>
          Trending Topics
        </h2>


        <div className="trending-topics">

          {trendingTopics.length > 0 ? (

            trendingTopics.map(
              (topic, index) => (

                <span
                  key={`${topic}-${index}`}
                  className="topic-pill"
                >
                  {topic}
                </span>

              )
            )

          ) : (

            <>

              <span className="topic-pill">
                Knowledge Graphs
              </span>

              <span className="topic-pill">
                Artificial Intelligence
              </span>

              <span className="topic-pill">
                Data Analysis
              </span>

              <span className="topic-pill">
                Machine Learning
              </span>

              <span className="topic-pill">
                Research
              </span>

            </>

          )}

        </div>

      </div>


      {/* =====================================================
          MESH INSIGHT MODAL
      ===================================================== */}

      {selectedGraph && (

        <div
          className="mesh-insight-overlay"
          onClick={closeInsight}
        >


          <div
            className="mesh-insight-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            {/* HEADER */}

            <div className="mesh-insight-header">


              <h2>
                Mesh Insight: View
              </h2>


              <button
                type="button"
                className="mesh-close-btn"
                onClick={closeInsight}
                aria-label="Close"
              >
                ×
              </button>


            </div>


            {/* DESCRIPTION */}

            <div className="mesh-insight-description">

              <span>
                DESCRIPTION
              </span>


              <p>

                {selectedGraph?.description ||
                  selectedGraph?.summary ||
                  "No description available for this knowledge mesh."}

              </p>

            </div>


            {/* METRICS */}

            <div className="mesh-insight-metrics">


              <div className="insight-metric">

                <span>
                  Complexity Score
                </span>

                <strong>
                  {complexityScore}
                </strong>

              </div>


              <div className="insight-metric">

                <span>
                  Node Count
                </span>

                <strong>
                  {insightNodes.length}
                </strong>

              </div>


            </div>


            <div className="mesh-insight-divider" />


            {/* CONCEPTUAL FRAMEWORK */}

            <div className="conceptual-framework">


              <h3>
                Conceptual Framework
              </h3>


              {insightLoading ? (

                <p className="framework-text">
                  Loading knowledge structure...
                </p>

              ) : insightError ? (

                <p className="framework-text">
                  {insightError}
                </p>

              ) : insightNodes.length === 0 ? (

                <p className="framework-text">

                  This mesh is currently in a high-level
                  state with no specific child nodes defined yet.

                </p>

              ) : (

                <div className="framework-nodes">

                  {insightNodes.map(
                    (node, index) => (

                      <div
                        className="framework-node"
                        key={
                          node?.id ||
                          node?.nodeId ||
                          index
                        }
                      >

                        <span className="framework-node-dot" />

                        <span>

                          {node?.label ||
                            node?.name ||
                            node?.title ||
                            "Unnamed Concept"}

                        </span>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* CLOSE BUTTON */}

            <button
              type="button"
              className="close-insight-btn"
              onClick={closeInsight}
            >

              Close Insight

            </button>


          </div>


        </div>

      )}


    </div>

  );

};


export default KnowledgeDiscovery;