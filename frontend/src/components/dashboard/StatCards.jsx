import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getGraphs,
} from "../../services/graphService";


/*
 * =========================================================
 * STAT CARDS
 * =========================================================
 *
 * Dashboard overview for MindMesh.
 *
 * Displays:
 *
 * - Total Graphs
 * - Public Graphs
 * - Private Graphs
 * - Average Complexity
 *
 * The component keeps API handling defensive so that
 * different valid backend response shapes do not break
 * the dashboard UI.
 */


const StatCards = () => {

  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [stats, setStats] = useState({
    totalGraphs: 0,
    publicGraphs: 0,
    privateGraphs: 0,
    averageComplexity: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /*
   * =========================================================
   * LOAD STATISTICS
   * =========================================================
   */

  const loadStats = useCallback(
    async () => {

      setLoading(true);

      setError("");


      try {

        /*
         * Backend:
         *
         * GET /api/graphs
         */

        const data =
          await getGraphs();


        /*
         * -----------------------------------------------------
         * NORMALIZE GRAPH RESPONSE
         * -----------------------------------------------------
         *
         * Support:
         *
         * [
         *   {...},
         *   {...}
         * ]
         *
         * OR
         *
         * {
         *   content: [...]
         * }
         *
         * OR
         *
         * {
         *   data: [...]
         * }
         */

        let graphs = [];


        if (
          Array.isArray(data)
        ) {

          graphs =
            data;

        } else if (
          Array.isArray(
            data?.content
          )
        ) {

          graphs =
            data.content;

        } else if (
          Array.isArray(
            data?.data
          )
        ) {

          graphs =
            data.data;

        }


        /*
         * -----------------------------------------------------
         * TOTAL
         * -----------------------------------------------------
         */

        const totalGraphs =
          graphs.length;


        /*
         * -----------------------------------------------------
         * PUBLIC
         * -----------------------------------------------------
         */

        const publicGraphs =
          graphs.filter(
            (graph) =>
              graph?.isPublic === true
          ).length;


        /*
         * -----------------------------------------------------
         * PRIVATE
         * -----------------------------------------------------
         */

        const privateGraphs =
          totalGraphs -
          publicGraphs;


        /*
         * -----------------------------------------------------
         * COMPLEXITY
         * -----------------------------------------------------
         *
         * Only valid numeric complexity
         * values are included in the average.
         */

        const complexityValues =
          graphs
            .map(
              (graph) =>
                graph?.complexityScore
            )
            .filter(
              (value) =>
                typeof value === "number" &&
                Number.isFinite(value)
            );


        const averageComplexity =
          complexityValues.length > 0
            ? complexityValues.reduce(
                (
                  sum,
                  value
                ) =>
                  sum + value,
                0
              ) /
              complexityValues.length
            : 0;


        /*
         * -----------------------------------------------------
         * UPDATE STATE
         * -----------------------------------------------------
         */

        setStats({
          totalGraphs,
          publicGraphs,
          privateGraphs,
          averageComplexity,
        });


      } catch (err) {

        setError(
          err?.message ||
          "Unable to load dashboard statistics."
        );

      } finally {

        setLoading(false);

      }

    },
    []
  );


  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {

    loadStats();

  }, [
    loadStats,
  ]);


  /*
   * =========================================================
   * CARD DATA
   * =========================================================
   */

  const cards = useMemo(
    () => [
      {
        title:
          "Total Graphs",

        value:
          stats.totalGraphs,

        description:
          "Knowledge graphs",

        icon:
          "◇",
      },

      {
        title:
          "Public Graphs",

        value:
          stats.publicGraphs,

        description:
          "Available publicly",

        icon:
          "◉",
      },

      {
        title:
          "Private Graphs",

        value:
          stats.privateGraphs,

        description:
          "Private workspaces",

        icon:
          "◆",
      },

      {
        title:
          "Avg. Complexity",

        value:
          Number(
            stats.averageComplexity
          ).toFixed(2),

        description:
          "Graph complexity score",

        icon:
          "⌁",
      },
    ],
    [
      stats,
    ]
  );


  /*
   * =========================================================
   * LOADING UI
   * =========================================================
   */

  if (loading) {

    return (
      <section
        className="dashboard-stats"
        aria-label="Knowledge workspace statistics"
      >

        <div className="dashboard-section-heading">

          <div>

            <span className="section-label">
              PLATFORM OVERVIEW
            </span>

            <h2>
              Knowledge Workspace
            </h2>

            <p>
              A quick overview of your knowledge
              graph environment.
            </p>

          </div>

        </div>


        <div className="stat-card-grid">

          {[1, 2, 3, 4].map(
            (item) => (

              <article
                className="stat-card"
                key={item}
                aria-label="Loading statistic"
              >

                <div className="stat-card-top">

                  <div
                    className="stat-card-icon"
                    aria-hidden="true"
                  >
                    ◇
                  </div>

                </div>

                <div className="stat-card-loading">
                  Loading...
                </div>

              </article>

            )
          )}

        </div>

      </section>
    );
  }


  /*
   * =========================================================
   * ERROR UI
   * =========================================================
   */

  if (error) {

    return (
      <section
        className="dashboard-stats"
        aria-label="Knowledge workspace statistics"
      >

        <div className="dashboard-section-heading">

          <div>

            <span className="section-label">
              PLATFORM OVERVIEW
            </span>

            <h2>
              Knowledge Workspace
            </h2>

            <p>
              A quick overview of your knowledge
              graph environment.
            </p>

          </div>


          <button
            type="button"
            className="dashboard-refresh-button"
            onClick={loadStats}
          >
            Refresh
          </button>

        </div>


        <div
          className="dashboard-error"
          role="alert"
        >

          <strong>
            Unable to load dashboard statistics
          </strong>

          <p>
            {error}
          </p>


          <button
            type="button"
            onClick={loadStats}
            className="dashboard-retry-button"
          >
            Retry
          </button>

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
    <section
      className="dashboard-stats"
      aria-label="Knowledge workspace statistics"
    >

      {/* =====================================================
          SECTION HEADER
          ===================================================== */}

      <div className="dashboard-section-heading">

        <div>

          <span className="section-label">
            PLATFORM OVERVIEW
          </span>

          <h2>
            Knowledge Workspace
          </h2>

          <p>
            A quick overview of your knowledge
            graph environment.
          </p>

        </div>


        <button
          type="button"
          className="dashboard-refresh-button"
          onClick={loadStats}
          disabled={loading}
        >
          Refresh
        </button>

      </div>


      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <div className="stat-card-grid">

        {cards.map(
          (card) => (

            <article
              className="stat-card"
              key={card.title}
            >

              {/* =============================================
                  ICON
                  ============================================= */}

              <div className="stat-card-top">

                <div
                  className="stat-card-icon"
                  aria-hidden="true"
                >
                  {card.icon}
                </div>

              </div>


              {/* =============================================
                  VALUE
                  ============================================= */}

              <div
                className="stat-card-value"
                aria-label={
                  `${card.title}: ${card.value}`
                }
              >
                {card.value}
              </div>


              {/* =============================================
                  TITLE
                  ============================================= */}

              <h3>
                {card.title}
              </h3>


              {/* =============================================
                  DESCRIPTION
                  ============================================= */}

              <p>
                {card.description}
              </p>

            </article>

          )
        )}

      </div>

    </section>
  );
};


export default StatCards;