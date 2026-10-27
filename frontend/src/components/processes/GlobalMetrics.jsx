import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import apiRequest from "../../services/api";

import "./GlobalMetrics.css";


/*
 * =========================================================
 * GLOBAL METRICS
 * =========================================================
 *
 * Platform-wide knowledge graph statistics.
 *
 * The page background is provided globally by
 * GlobalMeshBackground.
 *
 * This component MUST NOT create its own background.
 * =========================================================
 */

const GlobalMetrics = () => {

  const [stats, setStats] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
   * =========================================================
   * LOAD GLOBAL STATISTICS
   * =========================================================
   */

  const loadStats = async () => {

    setLoading(true);
    setError("");


    try {

      const response =
        await apiRequest(
          "/insights/stats",
          {
            method: "GET",
          }
        );


      setStats(
        response || {}
      );

    } catch (err) {

      setError(
        err?.message ||
        "Unable to load global metrics."
      );

    } finally {

      setLoading(false);

    }

  };


  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {

    loadStats();

  }, []);


  /*
   * =========================================================
   * NORMALIZE VALUE
   * =========================================================
   */

  const getValue = (
    object,
    possibleKeys,
    fallback = 0
  ) => {

    if (!object) {
      return fallback;
    }


    for (const key of possibleKeys) {

      if (
        object[key] !== undefined &&
        object[key] !== null
      ) {

        return object[key];

      }

    }


    return fallback;

  };


  /*
   * =========================================================
   * METRIC VALUES
   * =========================================================
   */

  const metricValues =
    useMemo(() => {

      return {

        graphs:
          getValue(
            stats,
            [
              "totalGraphs",
              "graphCount",
              "graphs",
              "numberOfGraphs",
            ]
          ),

        nodes:
          getValue(
            stats,
            [
              "totalNodes",
              "nodeCount",
              "nodes",
              "numberOfNodes",
            ]
          ),

        edges:
          getValue(
            stats,
            [
              "totalEdges",
              "edgeCount",
              "edges",
              "numberOfEdges",
            ]
          ),

        users:
          getValue(
            stats,
            [
              "totalUsers",
              "userCount",
              "users",
              "numberOfUsers",
            ]
          ),

        complexity:
          getValue(
            stats,
            [
              "averageComplexity",
              "complexity",
              "averageComplexityScore",
            ]
          ),

        density:
          getValue(
            stats,
            [
              "networkDensity",
              "density",
              "averageDensity",
            ]
          ),

      };

    }, [
      stats,
    ]);


  /*
   * =========================================================
   * BAR VALUES
   * =========================================================
   */

  const graphValue =
    Number(
      metricValues.graphs
    ) || 0;


  const nodeValue =
    Number(
      metricValues.nodes
    ) || 0;


  const edgeValue =
    Number(
      metricValues.edges
    ) || 0;


  const maxValue =
    Math.max(
      graphValue,
      nodeValue,
      edgeValue,
      1
    );


  /*
   * =========================================================
   * FORMAT VALUE
   * =========================================================
   */

  const formatMetric =
    (value) => {

      if (
        typeof value === "number"
      ) {

        return value;

      }


      const number =
        Number(value);


      if (
        !Number.isNaN(number)
      ) {

        return number;

      }


      return value ?? 0;

    };


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <section className="global-metrics">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="global-metrics-header">

        <div className="global-metrics-header-copy">

          <span className="section-label">
            GLOBAL METRICS
          </span>

          <h2>
            Platform Statistics
          </h2>

          <p>
            Monitor the overall knowledge graph
            ecosystem and network activity.
          </p>

        </div>


        <button
          type="button"
          className="global-metrics-refresh-button"
          onClick={loadStats}
          disabled={loading}
        >

          <span className="refresh-icon">
            ↻
          </span>

          {loading
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </div>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (

        <div
          className="global-metrics-error"
          role="alert"
        >

          <strong>
            Unable to load metrics
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading && (

        <div className="global-metrics-grid">

          <div className="global-metric-card loading-card">
            <div className="loading-line loading-small" />
            <div className="loading-line loading-large" />
            <div className="loading-line loading-medium" />
          </div>

          <div className="global-metric-card loading-card">
            <div className="loading-line loading-small" />
            <div className="loading-line loading-large" />
            <div className="loading-line loading-medium" />
          </div>

          <div className="global-metric-card loading-card">
            <div className="loading-line loading-small" />
            <div className="loading-line loading-large" />
            <div className="loading-line loading-medium" />
          </div>

          <div className="global-metric-card loading-card">
            <div className="loading-line loading-small" />
            <div className="loading-line loading-large" />
            <div className="loading-line loading-medium" />
          </div>

        </div>

      )}


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      {!loading && (

        <>

          {/* ===================================================
              METRIC CARDS
              =================================================== */}

          <div className="global-metrics-grid">

            {/* GRAPH COUNT */}

            <article className="global-metric-card metric-blue">

              <div className="metric-card-top">

                <div className="metric-icon">
                  ◈
                </div>

                <span className="metric-label">
                  KNOWLEDGE GRAPHS
                </span>

              </div>


              <div className="metric-value">
                {formatMetric(
                  metricValues.graphs
                )}
              </div>


              <div className="metric-description">
                Total graphs across the platform.
              </div>

            </article>


            {/* NODE COUNT */}

            <article className="global-metric-card metric-violet">

              <div className="metric-card-top">

                <div className="metric-icon">
                  ●
                </div>

                <span className="metric-label">
                  CONCEPT NODES
                </span>

              </div>


              <div className="metric-value">
                {formatMetric(
                  metricValues.nodes
                )}
              </div>


              <div className="metric-description">
                Connected knowledge concepts.
              </div>

            </article>


            {/* EDGE COUNT */}

            <article className="global-metric-card metric-gold">

              <div className="metric-card-top">

                <div className="metric-icon">
                  ⟷
                </div>

                <span className="metric-label">
                  SEMANTIC EDGES
                </span>

              </div>


              <div className="metric-value">
                {formatMetric(
                  metricValues.edges
                )}
              </div>


              <div className="metric-description">
                Relationships between concepts.
              </div>

            </article>


            {/* USERS */}

            <article className="global-metric-card metric-green">

              <div className="metric-card-top">

                <div className="metric-icon">
                  ◉
                </div>

                <span className="metric-label">
                  USERS
                </span>

              </div>


              <div className="metric-value">
                {formatMetric(
                  metricValues.users
                )}
              </div>


              <div className="metric-description">
                Registered platform accounts.
              </div>

            </article>

          </div>


          {/* ===================================================
              NETWORK ANALYSIS
              =================================================== */}

          <section className="network-metrics-panel">

            <div className="network-metrics-header">

              <div>

                <span className="section-label">
                  NETWORK ANALYSIS
                </span>

                <h3>
                  Knowledge Network
                </h3>

                <p>
                  Structural overview of the current
                  knowledge ecosystem.
                </p>

              </div>

            </div>


            {/* =================================================
                METRIC BARS
                ================================================= */}

            <div className="metric-bars">

              {/* GRAPHS */}

              <div className="metric-bar-row">

                <div className="metric-bar-label">

                  <span>
                    Graphs
                  </span>

                  <strong>
                    {formatMetric(
                      metricValues.graphs
                    )}
                  </strong>

                </div>


                <div className="metric-bar-track">

                  <div
                    className="metric-bar-fill metric-bar-blue"
                    style={{
                      width:
                        `${Math.min(
                          100,
                          (
                            graphValue /
                            maxValue
                          ) *
                          100
                        )}%`,
                    }}
                  />

                </div>

              </div>


              {/* NODES */}

              <div className="metric-bar-row">

                <div className="metric-bar-label">

                  <span>
                    Nodes
                  </span>

                  <strong>
                    {formatMetric(
                      metricValues.nodes
                    )}
                  </strong>

                </div>


                <div className="metric-bar-track">

                  <div
                    className="metric-bar-fill metric-bar-violet"
                    style={{
                      width:
                        `${Math.min(
                          100,
                          (
                            nodeValue /
                            maxValue
                          ) *
                          100
                        )}%`,
                    }}
                  />

                </div>

              </div>


              {/* EDGES */}

              <div className="metric-bar-row">

                <div className="metric-bar-label">

                  <span>
                    Edges
                  </span>

                  <strong>
                    {formatMetric(
                      metricValues.edges
                    )}
                  </strong>

                </div>


                <div className="metric-bar-track">

                  <div
                    className="metric-bar-fill metric-bar-gold"
                    style={{
                      width:
                        `${Math.min(
                          100,
                          (
                            edgeValue /
                            maxValue
                          ) *
                          100
                        )}%`,
                    }}
                  />

                </div>

              </div>

            </div>


            {/* =================================================
                NETWORK SCORES
                ================================================= */}

            <div className="network-score-grid">

              <article className="network-score-card">

                <span>
                  AVERAGE COMPLEXITY
                </span>

                <strong>
                  {formatMetric(
                    metricValues.complexity
                  )}
                </strong>

                <small>
                  Average knowledge elements
                  per network.
                </small>

              </article>


              <article className="network-score-card">

                <span>
                  NETWORK DENSITY
                </span>

                <strong>
                  {formatMetric(
                    metricValues.density
                  )}
                </strong>

                <small>
                  Average concept density
                  across networks.
                </small>

              </article>

            </div>

          </section>

        </>

      )}

    </section>

  );

};


export default GlobalMetrics;