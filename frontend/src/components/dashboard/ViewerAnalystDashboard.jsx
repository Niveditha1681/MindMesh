import React, {
  useEffect,
  useState,
} from "react";

import * as graphServiceModule
  from "../../services/graphService";

import {
  getNodesByGraph,
} from "../../services/nodeService";

import {
  getEdgesByGraph,
} from "../../services/edgeService";

import Discovery
  from "../processes/Discovery";


const ViewerAnalystDashboard = () => {

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
   * =====================================================
   * LOAD KNOWLEDGE DATA
   * =====================================================
   */

  useEffect(() => {

    const loadData = async () => {

      try {

        setLoading(true);

        setError("");


        const graphResponse =
          await graphServiceModule.getGraphs();


        const graphs =
          Array.isArray(graphResponse)
            ? graphResponse
            : (
              graphResponse?.data ||
              graphResponse?.content ||
              graphResponse?.graphs ||
              []
            );


        if (!Array.isArray(graphs)) {

          setNodes([]);

          setEdges([]);

          return;

        }


        const graphData =
          await Promise.all(

            graphs.map(
              async (graph) => {

                const graphId =
                  graph?.id ||
                  graph?.graphId;


                if (
                  graphId === undefined ||
                  graphId === null
                ) {

                  return {
                    nodes: [],
                    edges: [],
                  };

                }


                const [
                  nodeResponse,
                  edgeResponse,
                ] = await Promise.all([

                  getNodesByGraph(graphId),

                  getEdgesByGraph(graphId),

                ]);


                const graphNodes =
                  Array.isArray(nodeResponse)
                    ? nodeResponse
                    : (
                      nodeResponse?.data ||
                      nodeResponse?.content ||
                      nodeResponse?.nodes ||
                      []
                    );


                const graphEdges =
                  Array.isArray(edgeResponse)
                    ? edgeResponse
                    : (
                      edgeResponse?.data ||
                      edgeResponse?.content ||
                      edgeResponse?.edges ||
                      []
                    );


                return {

                  nodes:
                    Array.isArray(graphNodes)
                      ? graphNodes
                      : [],

                  edges:
                    Array.isArray(graphEdges)
                      ? graphEdges
                      : [],

                };

              }
            )

          );


        const allNodes =
          graphData.flatMap(
            (item) => item.nodes
          );


        const allEdges =
          graphData.flatMap(
            (item) => item.edges
          );


        setNodes(allNodes);

        setEdges(allEdges);


      } catch (loadError) {

        console.error(
          "Viewer Analyst dashboard error:",
          loadError
        );


        setError(
          loadError?.message ||
          "Unable to load knowledge discovery data."
        );


        setNodes([]);

        setEdges([]);


      } finally {

        setLoading(false);

      }

    };


    loadData();


  }, []);


  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {

    return (

      <div className="page-container">

        <div className="dashboard-page-header">

          <span className="section-label">
            VIEWER ANALYST
          </span>

          <h1>
            Knowledge Discovery
          </h1>

          <p>
            Explore your knowledge meshes and identify
            disconnected concepts and relationships.
          </p>

        </div>


        <div className="semantic-search-empty">

          <h2>
            Loading Discovery...
          </h2>

          <p>
            Analyzing available knowledge meshes.
          </p>

        </div>

      </div>

    );

  }


  /*
   * =====================================================
   * ERROR
   * =====================================================
   */

  if (error) {

    return (

      <div className="page-container">

        <div className="dashboard-page-header">

          <span className="section-label">
            VIEWER ANALYST
          </span>

          <h1>
            Knowledge Discovery
          </h1>

          <p>
            Explore your knowledge meshes and identify
            disconnected concepts and relationships.
          </p>

        </div>


        <div className="semantic-search-empty">

          <h2>
            Unable to Load Discovery
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>

    );

  }


  /*
   * =====================================================
   * DASHBOARD
   * =====================================================
   */

  return (

    <div className="page-container viewer-analyst-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="dashboard-page-header">

        <span className="section-label">
          VIEWER ANALYST
        </span>


        <h1>
          Knowledge Discovery
        </h1>


        <p>
          Explore your knowledge meshes and identify
          disconnected concepts and relationships.
        </p>

      </div>


      {/* =================================================
          DISCOVERY CONTENT
      ================================================= */}

      <div className="viewer-analyst-discovery">

        <Discovery
          nodes={nodes}
          edges={edges}
        />

      </div>


    </div>

  );

};


export default ViewerAnalystDashboard;  