import React, {
  useEffect,
  useState,
  useMemo,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";


/*
 * =========================================================
 * GLOBAL STYLES
 * =========================================================
 */

import "./styles/WorkspaceTheme.css";
import "./App.css";


/*
 * =========================================================
 * GLOBAL BACKGROUND
 * =========================================================
 */

import GlobalMeshBackground
  from "./components/background/GlobalMeshBackground";


/*
 * =========================================================
 * SERVICES
 * =========================================================
 */

import * as graphServiceModule
  from "./services/graphService";

import {
  getNodesByGraph,
} from "./services/nodeService";

import {
  getEdgesByGraph,
} from "./services/edgeService";


/*
 * =========================================================
 * REDUX
 * =========================================================
 */

import {
  setSelectedGraph,
} from "./store/slices/graphSlice";


/*
 * =========================================================
 * AUTHENTICATION
 * =========================================================
 */

import Login
  from "./components/Login";

import Register
  from "./components/Register";


/*
 * =========================================================
 * LAYOUT
 * =========================================================
 */

import Navbar
  from "./components/layout/NavBar";

import ScrollToTop
  from "./components/layout/ScrollToTop";


/*
 * =========================================================
 * DASHBOARD
 * =========================================================
 */

import ViewerAnalystDashboard
  from "./components/dashboard/ViewerAnalystDashboard";

import ResearchStrategistDashboard
  from "./components/dashboard/ResearchStrategistDashboard";

import StatCards
  from "./components/dashboard/StatCards";

import RecentActivity
  from "./components/dashboard/RecentActivity";

import GovernanceDashboard
  from "./components/dashboard/Governancedashboard";


/*
 * =========================================================
 * SYSTEM HEALTH
 * =========================================================
 */

import SystemHealth
  from "./components/dashboard/SystemHealth";


/*
 * =========================================================
 * KNOWLEDGE DISCOVERY
 * =========================================================
 */

import KnowledgeDiscovery
  from "./components/processes/KnowledgeDiscovery";

import DiscoveryGraphViewer
  from "./components/processes/DiscoveryGraphViewer";


/*
 * =========================================================
 * WORKSPACE
 * =========================================================
 */

import GraphForm
  from "./components/graphs/GraphForm";

import GraphCanvas
  from "./components/canvas/GraphCanvas";

import NodeForm
  from "./components/nodes/NodeForm";

import EdgeForm
  from "./components/edges/EdgeForm";


/*
 * =========================================================
 * SEMANTIC SEARCH
 * =========================================================
 */

import SemanticSearch
  from "./components/processes/SemanticSearch";


/*
 * =========================================================
 * ROLE HELPERS
 * =========================================================
 */

const getUserRole = (user) => {

  return (
    user?.role
      ?.trim()
      ?.toUpperCase()
      ?.replace(/\s+/g, "_")
      ?.replace(/-/g, "_")
    || ""
  );

};


const isViewerAnalyst = (role) => {

  return (
    role === "VIEW_ANALYST" ||
    role === "VIEWER_ANALYST"
  );

};


/*
 * =========================================================
 * NORMALIZE API ARRAY RESPONSE
 * =========================================================
 */

const normalizeArrayResponse = (response) => {

  if (Array.isArray(response)) {
    return response;
  }

  return (
    response?.data ||
    response?.content ||
    response?.graphs ||
    response?.nodes ||
    response?.edges ||
    []
  );

};


/*
 * =========================================================
 * PROTECTED LAYOUT
 * =========================================================
 */

const ProtectedLayout = ({ children }) => {

  const isAuthenticated =
    useSelector(
      (state) =>
        state?.auth?.isAuthenticated
    );


  if (!isAuthenticated) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  return (

    <div className="app-shell">

      {/* GLOBAL ANIMATED BACKGROUND */}

      <GlobalMeshBackground />


      {/* APPLICATION CONTENT */}

      <div className="app-foreground">

        <Navbar />

        <main className="app-content">

          {children}

        </main>

      </div>

    </div>

  );

};


/*
 * =========================================================
 * KNOWLEDGE ARCHITECT DATA LOADER
 * =========================================================
 */

const useKnowledgeArchitectData = () => {

  const [graphs, setGraphs] =
    useState([]);

  const [nodes, setNodes] =
    useState([]);

  const [edges, setEdges] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  useEffect(() => {

    let isMounted = true;


    const loadData = async () => {

      try {

        setLoading(true);

        setError(null);


        const graphResponse =
          await graphServiceModule.getGraphs();


        const loadedGraphs =
          normalizeArrayResponse(
            graphResponse
          );


        const validGraphs =
          loadedGraphs.filter((graph) => {

            const graphId =
              graph?.id ??
              graph?.graphId;

            return (
              graphId !== undefined &&
              graphId !== null &&
              graphId !== ""
            );

          });


        const graphData =
          await Promise.all(

            validGraphs.map(
              async (graph) => {

                const graphId =
                  graph?.id ??
                  graph?.graphId;


                const [
                  nodeResponse,
                  edgeResponse,
                ] = await Promise.all([

                  getNodesByGraph(graphId),

                  getEdgesByGraph(graphId),

                ]);


                return {

                  nodes:
                    normalizeArrayResponse(
                      nodeResponse
                    ),

                  edges:
                    normalizeArrayResponse(
                      edgeResponse
                    ),

                };

              }
            )

          );


        const allNodes =
          graphData.flatMap(
            (data) =>
              Array.isArray(data?.nodes)
                ? data.nodes
                : []
          );


        const allEdges =
          graphData.flatMap(
            (data) =>
              Array.isArray(data?.edges)
                ? data.edges
                : []
          );


        if (isMounted) {

          setGraphs(validGraphs);

          setNodes(allNodes);

          setEdges(allEdges);

        }

      } catch (err) {

        console.error(
          "Knowledge Architect data loading error:",
          err
        );


        if (isMounted) {

          setError(
            err?.message ||
            "Failed to load knowledge architecture data."
          );

          setGraphs([]);

          setNodes([]);

          setEdges([]);

        }

      } finally {

        if (isMounted) {
          setLoading(false);
        }

      }

    };


    loadData();


    return () => {
      isMounted = false;
    };

  }, []);


  return {

    graphs,
    nodes,
    edges,
    loading,
    error,

  };

};


/*
 * =========================================================
 * DASHBOARD
 * =========================================================
 */

const Dashboard = () => {

  const user =
    useSelector(
      (state) =>
        state?.auth?.user
    );


  const role =
    getUserRole(user);


  if (role === "KNOWLEDGE_ARCHITECT") {
    return <KnowledgeArchitectDashboard />;
  }


  if (role === "RESEARCH_STRATEGIST") {
    return <ResearchStrategistDashboard />;
  }


  if (isViewerAnalyst(role)) {
    return <ViewerAnalystDashboard />;
  }


  return (

    <div className="page-container">

      <div className="dashboard-page-header">

        <span className="section-label">
          DASHBOARD
        </span>

        <h1>
          Knowledge Dashboard
        </h1>

        <p>
          Monitor your knowledge graphs and
          recent workspace activity.
        </p>

      </div>


      <StatCards />

      <RecentActivity />

    </div>

  );

};


/*
 * =========================================================
 * KNOWLEDGE ARCHITECT DASHBOARD
 * =========================================================
 */

const KnowledgeArchitectDashboard = () => {

  const {
    graphs,
    nodes,
    loading,
    error,
  } = useKnowledgeArchitectData();


  if (loading) {

    return (

      <div className="page-container">

        <div className="semantic-search-empty">

          <h2>
            Loading Governance Dashboard...
          </h2>

          <p>
            Loading knowledge architecture data.
          </p>

        </div>

      </div>

    );

  }


  if (error) {

    return (

      <div className="page-container">

        <div className="semantic-search-empty">

          <h2>
            Unable to Load Dashboard
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>

    );

  }


  const publicMeshes =
    graphs.filter(
      (graph) =>

        graph?.isPublic === true ||
        graph?.public === true ||
        String(graph?.visibility)
          .toUpperCase() === "PUBLIC"

    ).length;


  const governanceLogs =
    nodes
      .slice(0, 10)
      .map((node) => ({

        id: node?.id,

        timestamp:
          node?.createdAt ||
          node?.timestamp ||
          node?.updatedAt,

        type:
          node?.createdAt
            ? "CREATE"
            : "ACTIVITY",

        targetTitle:
          node?.name ||
          node?.title ||
          node?.label ||
          node?.id ||
          "Knowledge Node",

      }));


  return (

    <div className="page-container">

      <GovernanceDashboard
        totalMeshes={graphs.length}
        publicMeshes={publicMeshes}
        registeredArchitects={0}
        governanceLogs={governanceLogs}
      />

    </div>

  );

};


/*
 * =========================================================
 * SYSTEM HEALTH PAGE
 * =========================================================
 */

const SystemHealthPage = () => {

  const user =
    useSelector(
      (state) =>
        state?.auth?.user
    );


  const role =
    getUserRole(user);


  const {
    graphs,
    nodes,
    edges,
    loading,
    error,
  } = useKnowledgeArchitectData();


  if (role !== "KNOWLEDGE_ARCHITECT") {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );

  }


  return (

    <div className="page-container">

      {error && (

        <div className="semantic-search-empty">

          <h2>
            Diagnostic Data Warning
          </h2>

          <p>
            {error}
          </p>

        </div>

      )}


      <SystemHealth
        graphs={graphs}
        nodes={nodes}
        edges={edges}
        loading={loading}
      />

    </div>

  );

};


/*
 * =========================================================
 * GLOBAL METRICS PAGE
 * =========================================================
 */

const GlobalMetricsPage = () => {

  const user =
    useSelector(
      (state) =>
        state?.auth?.user
    );


  const role =
    getUserRole(user);


  const {
    graphs,
    nodes,
    edges,
    loading,
    error,
  } = useKnowledgeArchitectData();


  const metrics =
    useMemo(() => {

      const totalNetworks =
        graphs.length;

      const totalNodes =
        nodes.length;

      const totalEdges =
        edges.length;


      const averageComplexity =
        totalNetworks > 0
          ? (
              (totalNodes + totalEdges) /
              totalNetworks
            ).toFixed(1)
          : "0.0";


      const networkDensity =
        totalNetworks > 0
          ? (
              totalNodes /
              totalNetworks
            ).toFixed(2)
          : "0.00";


      const publicNetworks =
        graphs.filter(
          (graph) =>

            graph?.isPublic === true ||
            graph?.public === true ||
            graph?.visibility
              ?.toUpperCase() === "PUBLIC"

        ).length;


      const publicReach =
        totalNetworks > 0
          ? Math.round(
              (publicNetworks / totalNetworks) * 100
            )
          : 0;


      return {

        totalNetworks,
        totalNodes,
        totalEdges,
        averageComplexity,
        networkDensity,
        publicNetworks,
        publicReach,

      };

    }, [
      graphs,
      nodes,
      edges,
    ]);


  if (role !== "KNOWLEDGE_ARCHITECT") {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );

  }


  if (loading) {

    return (

      <div className="page-container">

        <div className="global-metrics-loading">

          <h2>
            Loading Global Analytics...
          </h2>

          <p>
            Calculating knowledge network metrics.
          </p>

        </div>

      </div>

    );

  }


  if (error) {

    return (

      <div className="page-container">

        <div className="global-metrics-loading">

          <h2>
            Unable to Load Analytics
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="page-container">

      <section className="global-analytics-panel">

        <div className="global-analytics-header">

          <h1>
            Global Network Analytics
          </h1>

          <p>
            Quantitative analysis of the MindMesh
            knowledge ecosystem.
          </p>

        </div>


        <div className="global-analytics-grid">

          <article className="analytics-metric-card total-networks">

            <span className="analytics-metric-label">
              TOTAL NETWORKS
            </span>

            <strong>
              {metrics.totalNetworks}
            </strong>

            <p>
              Individual knowledge maps
              across all networks.
            </p>

          </article>


          <article className="analytics-metric-card average-complexity">

            <span className="analytics-metric-label">
              AVERAGE COMPLEXITY
            </span>

            <strong>
              {metrics.averageComplexity}
            </strong>

            <p>
              Average knowledge elements
              across each network.
            </p>

          </article>


          <article className="analytics-metric-card network-density">

            <span className="analytics-metric-label">
              NETWORK DENSITY
            </span>

            <strong>
              {metrics.networkDensity}
            </strong>

            <p>
              Average concept density
              across knowledge networks.
            </p>

          </article>


          <article className="analytics-metric-card public-reach">

            <span className="analytics-metric-label">
              PUBLIC REACH
            </span>

            <strong>
              {metrics.publicReach}%
            </strong>

            <p>
              Percentage of networks shared
              with the public network.
            </p>

          </article>

        </div>


        <div className="analytics-summary">

          <h2>
            Analytics Summary
          </h2>

          <p>

            The MindMesh network currently contains{" "}

            <strong>
              {metrics.totalNetworks}
            </strong>

            {" "}knowledge network

            {metrics.totalNetworks === 1
              ? ""
              : "s"}

            {" "}and{" "}

            <strong>
              {metrics.totalNodes}
            </strong>

            {" "}individual concept node

            {metrics.totalNodes === 1
              ? ""
              : "s"}

            . The ecosystem currently maintains{" "}

            <strong>
              {metrics.totalEdges}
            </strong>

            {" "}semantic relationship

            {metrics.totalEdges === 1
              ? ""
              : "s"}

            .

          </p>

        </div>

      </section>

    </div>

  );

};


/*
 * =========================================================
 * WORKSPACE
 * =========================================================
 */

const Workspace = () => {

  const {
    graphId: routeGraphId,
  } = useParams();


  const dispatch =
    useDispatch();


  const user =
    useSelector(
      (state) =>
        state?.auth?.user
    );


  const selectedGraph =
    useSelector(
      (state) =>
        state?.graphs?.selectedGraph ||
        null
    );


  const [
    nodeRefreshKey,
    setNodeRefreshKey,
  ] = useState(0);


  const [
    edgeRefreshKey,
    setEdgeRefreshKey,
  ] = useState(0);


  const role =
    getUserRole(user);


  /*
   * =======================================================
   * SELECTED GRAPH ID
   * =======================================================
   */

  const selectedGraphId =
    routeGraphId ??
    selectedGraph?.id ??
    selectedGraph?.graphId ??
    null;


  /*
   * =======================================================
   * SYNC ROUTE GRAPH WITH REDUX
   * =======================================================
   */

  useEffect(() => {

    if (!routeGraphId) {
      return;
    }


    const currentGraphId =
      selectedGraph?.id ??
      selectedGraph?.graphId;


    if (
      String(currentGraphId) ===
      String(routeGraphId)
    ) {
      return;
    }


    dispatch(
      setSelectedGraph({

        id:
          routeGraphId,

        graphId:
          routeGraphId,

      })
    );

  }, [
    dispatch,
    routeGraphId,
    selectedGraph,
  ]);


  /*
   * =======================================================
   * GRAPH CREATED
   * =======================================================
   *
   * After the graph is successfully created:
   *
   * 1. Get the returned graph.
   * 2. Extract its ID.
   * 3. Store it in Redux as selectedGraph.
   * 4. Refresh node/edge data.
   *
   * This activates the graph workspace immediately.
   * =======================================================
   */

  const handleGraphCreated = (
    createdGraph
  ) => {

    if (!createdGraph) {

      console.error(
        "Graph creation returned no graph data."
      );

      return;
    }


    /*
     * Support several possible API response shapes.
     */

    const graph =
      createdGraph?.data ||
      createdGraph?.graph ||
      createdGraph;


    /*
     * Extract ID.
     */

    const graphId =
      graph?.id ??
      graph?.graphId;


    /*
     * Validate ID.
     */

    if (
      graphId === undefined ||
      graphId === null ||
      graphId === ""
    ) {

      console.error(
        "Created graph does not contain a valid ID:",
        createdGraph
      );

      return;
    }


    /*
     * Store selected graph.
     */

    dispatch(
      setSelectedGraph({

        ...graph,

        id:
          graphId,

        graphId:
          graphId,

      })
    );


    /*
     * Refresh node and edge data.
     */

    setNodeRefreshKey(
      (previousValue) =>
        previousValue + 1
    );

    setEdgeRefreshKey(
      (previousValue) =>
        previousValue + 1
    );

  };


  /*
   * =======================================================
   * NODE CREATED
   * =======================================================
   */

  const handleNodeCreated = () => {

    setNodeRefreshKey(
      (previousValue) =>
        previousValue + 1
    );

  };


  /*
   * =======================================================
   * EDGE CREATED
   * =======================================================
   */

  const handleEdgeCreated = () => {

    setEdgeRefreshKey(
      (previousValue) =>
        previousValue + 1
    );

  };


  /*
   * =======================================================
   * CANVAS REFRESH KEY
   * =======================================================
   */

  const canvasRefreshKey =
    nodeRefreshKey +
    edgeRefreshKey;


  /*
   * =======================================================
   * VIEW ANALYST ACCESS
   * =======================================================
   */

  if (
    isViewerAnalyst(role)
  ) {

    return (

      <Navigate
        to="/discovery"
        replace
      />

    );

  }


  /*
   * =======================================================
   * WORKSPACE UI
   * =======================================================
   */

  return (

    <div className="page-container workspace-page">


      {/* ===================================================
          PAGE HEADER
          =================================================== */}

      <div className="graphs-page-header">

        <span className="section-label">
          KNOWLEDGE WORKSPACE
        </span>

        <h1>
          My Knowledge Meshes
        </h1>

        <p>
          Create, explore and manage your
          knowledge meshes.
        </p>

      </div>


      {/* ===================================================
          CREATE GRAPH
          =================================================== */}

      {!routeGraphId && (

        <GraphForm
          onGraphCreated={
            handleGraphCreated
          }
        />

      )}


      {/* ===================================================
          SELECTED GRAPH WORKSPACE
          =================================================== */}

      {selectedGraphId && (

        <>


          {/* ===============================================
              NODE FORM
              =============================================== */}

          <NodeForm

            graphId={
              selectedGraphId
            }

            onNodeCreated={
              handleNodeCreated
            }

          />


          {/* ===============================================
              EDGE FORM
              =============================================== */}

          <EdgeForm

            graphId={
              selectedGraphId
            }
            nodeRefreshKey={nodeRefreshKey}
            onEdgeCreated={
              handleEdgeCreated
            }

          />


          {/* ===============================================
              GRAPH CANVAS
              =============================================== */}

          <GraphCanvas

            graphId={
              selectedGraphId
            }

            refreshKey={
              canvasRefreshKey
            }

          />

        </>

      )}


    </div>

  );

};


/*
 * =========================================================
 * SEMANTIC SEARCH
 * =========================================================
 */

const Search = () => {

  const user =
    useSelector(
      (state) =>
        state?.auth?.user
    );


  const [nodes, setNodes] =
    useState([]);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState(null);


  const role =
    getUserRole(user);


  useEffect(() => {

    if (isViewerAnalyst(role)) {
      return;
    }


    const loadAllNodes = async () => {

      try {

        setLoading(true);

        setError(null);


        const graphResponse =
          await graphServiceModule.getGraphs();


        const graphs =
          normalizeArrayResponse(
            graphResponse
          );


        const validGraphs =
          graphs.filter(
            (graph) =>
              graph?.id ||
              graph?.graphId
          );


        const nodeResponses =
          await Promise.all(

            validGraphs.map((graph) => {

              const graphId =
                graph?.id ||
                graph?.graphId;

              return getNodesByGraph(
                graphId
              );

            })

          );


        const allNodes =
          nodeResponses.flatMap(
            (response) =>
              normalizeArrayResponse(
                response
              )
          );


        setNodes(
          allNodes
        );

      } catch (err) {

        console.error(
          "Semantic search loading error:",
          err
        );


        setError(
          err?.message ||
          "Failed to load search data."
        );


        setNodes([]);

      } finally {

        setLoading(false);

      }

    };


    loadAllNodes();

  }, [role]);


  if (isViewerAnalyst(role)) {

    return (
      <Navigate
        to="/discovery"
        replace
      />
    );

  }


  if (loading) {

    return (

      <div className="page-container">

        <div className="semantic-search-empty">

          <h2>
            Loading Knowledge...
          </h2>

          <p>
            Loading available concepts.
          </p>

        </div>

      </div>

    );

  }


  if (error) {

    return (

      <div className="page-container">

        <div className="semantic-search-empty">

          <h2>
            Unable to Load Search
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="page-container">

      <SemanticSearch
        nodes={nodes}
        edges={[]}
      />

    </div>

  );

};


/*
 * =========================================================
 * ACTIVITY LOG
 * =========================================================
 */

const ActivityLogPage = () => {

  return (

    <div className="page-container">

      <div className="dashboard-page-header">

        <span className="section-label">
          ACTIVITY
        </span>

        <h1>
          Activity Log
        </h1>

        <p>
          Review recent activity in your
          knowledge workspace.
        </p>

      </div>


      <RecentActivity />

    </div>

  );

};


/*
 * =========================================================
 * MAIN APPLICATION
 * =========================================================
 */

function App() {

  return (

    <BrowserRouter>

      <ScrollToTop />

      <Routes>


        {/* LOGIN */}

        <Route
          path="/"
          element={<Login />}
        />


        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={

            <ProtectedLayout>

              <Dashboard />

            </ProtectedLayout>

          }
        />


        {/* SYSTEM HEALTH */}

        <Route
          path="/system-health"
          element={

            <ProtectedLayout>

              <SystemHealthPage />

            </ProtectedLayout>

          }
        />


        {/* GLOBAL METRICS */}

        <Route
          path="/global-metrics"
          element={

            <ProtectedLayout>

              <GlobalMetricsPage />

            </ProtectedLayout>

          }
        />


        {/* DISCOVERY */}

        <Route
          path="/discovery"
          element={

            <ProtectedLayout>

              <KnowledgeDiscovery />

            </ProtectedLayout>

          }
        />


        {/* DISCOVERY GRAPH */}

        <Route
          path="/discovery/graph/:graphId"
          element={

            <ProtectedLayout>

              <DiscoveryGraphViewer />

            </ProtectedLayout>

          }
        />


        {/* ACTIVITY LOG */}

        <Route
          path="/activity-log"
          element={

            <ProtectedLayout>

              <ActivityLogPage />

            </ProtectedLayout>

          }
        />


        {/* WORKSPACE */}

        <Route
          path="/workspace/:graphId?"
          element={

            <ProtectedLayout>

              <Workspace />

            </ProtectedLayout>

          }
        />


        {/* SEMANTIC SEARCH */}

        <Route
          path="/search"
          element={

            <ProtectedLayout>

              <Search />

            </ProtectedLayout>

          }
        />


        {/* UNKNOWN ROUTE */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />


      </Routes>

    </BrowserRouter>

  );

}


export default App;