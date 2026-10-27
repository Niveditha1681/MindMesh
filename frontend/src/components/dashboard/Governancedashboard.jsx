import React, {
  useEffect,
  useState,
} from "react";

import {
  getGraphs,
  getPublicGraphs,
  getAllActivity,
} from "../../services/graphService";


/*
 * =========================================================
 * GOVERNANCE DASHBOARD
 * =========================================================
 *
 * Knowledge Architect Dashboard
 *
 * Platform Governance & Orchestration
 */


const GovernanceDashboard = () => {


  /*
   * =======================================================
   * STATE
   * =======================================================
   */

  const [totalMeshes, setTotalMeshes] =
    useState(0);

  const [publicMeshes, setPublicMeshes] =
    useState(0);

  const [registeredArchitects, setRegisteredArchitects] =
    useState(0);

  const [governanceLogs, setGovernanceLogs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
   * =======================================================
   * NORMALIZE BACKEND RESPONSE
   * =======================================================
   *
   * Supports:
   *
   * []
   *
   * or
   *
   * {
   *   content: []
   * }
   */


  const normalizeArray = (data) => {

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.content)) {
      return data.content;
    }

    return [];

  };


  /*
   * =======================================================
   * LOAD DASHBOARD DATA
   * =======================================================
   */


  const loadDashboardData = async () => {

    setLoading(true);
    setError("");


    try {


      /*
       * Load all backend data simultaneously.
       */


      const [

        graphsResponse,
        publicGraphsResponse,
        activityResponse,

      ] = await Promise.all([

        getGraphs(),

        getPublicGraphs(),

        getAllActivity(),

      ]);


      /*
       * Normalize responses.
       */


      const graphs =
        normalizeArray(graphsResponse);

      const publicGraphs =
        normalizeArray(publicGraphsResponse);

      const activities =
        normalizeArray(activityResponse);


      /*
       * TOTAL KNOWLEDGE MESHES
       */


      setTotalMeshes(
        graphs.length
      );


      /*
       * PUBLIC INTELLIGENCE
       */


      setPublicMeshes(
        publicGraphs.length
      );


      /*
       * REGISTERED ARCHITECTS
       *
       * Count unique owners from graphs.
       */


      const architectIds =
        new Set();


      graphs.forEach(
        (graph) => {


          const ownerId =

            graph?.ownerId ||

            graph?.owner?.id ||

            graph?.createdById ||

            graph?.userId;


          if (
            ownerId !== undefined &&
            ownerId !== null
          ) {

            architectIds.add(
              ownerId
            );

          }


        }
      );


      /*
       * If graph owner information exists,
       * use the number of unique owners.
       */


      setRegisteredArchitects(
        architectIds.size
      );


      /*
       * GOVERNANCE ACTIVITY LOGS
       */


      setGovernanceLogs(
        activities
      );


    } catch (err) {


      console.error(
        "Unable to load governance dashboard:",
        err
      );


      setError(

        err?.message ||

        "Unable to load governance dashboard data."

      );


      /*
       * Reset safely.
       */


      setTotalMeshes(0);

      setPublicMeshes(0);

      setRegisteredArchitects(0);

      setGovernanceLogs([]);


    } finally {


      setLoading(false);


    }

  };


  /*
   * =======================================================
   * INITIAL LOAD
   * =======================================================
   */


  useEffect(() => {

    loadDashboardData();

  }, []);


  /*
   * =======================================================
   * FORMAT TIMESTAMP
   * =======================================================
   */


  const formatTimestamp = (
    timestamp
  ) => {


    if (!timestamp) {
      return "—";
    }


    const date =
      new Date(timestamp);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(timestamp);

    }


    return date.toLocaleString();


  };


  /*
   * =======================================================
   * GET ACTION
   * =======================================================
   */


  const getAction = (
    log
  ) => {


    return (

      log?.type ||

      log?.activityType ||

      log?.action ||

      "ACTIVITY"

    );


  };


  /*
   * =======================================================
   * GET TARGET
   * =======================================================
   */


  const getTarget = (
    log
  ) => {


    return (

      log?.targetTitle ||

      log?.target ||

      log?.graphTitle ||

      log?.description ||

      "—"

    );


  };


  /*
   * =======================================================
   * LOADING
   * =======================================================
   */


  if (loading) {

    return (

      <div className="governance-dashboard">

        <div className="governance-loading-state">

          Loading governance dashboard...

        </div>

      </div>

    );

  }


  /*
   * =======================================================
   * UI
   * =======================================================
   */


  return (

    <div className="governance-dashboard">


      {/* ===============================================
          PAGE HEADER
          =============================================== */}

      <div className="governance-header">


        <span className="governance-label">

          KNOWLEDGE ARCHITECT

        </span>


        <h1>

          Platform Governance &amp; Orchestration

        </h1>


        <p>

          Master control center for MindMesh knowledge
          architecture and global intelligence flow.

        </p>


      </div>



      {/* ===============================================
          ERROR
          =============================================== */}

      {error && (

        <div className="governance-error">

          {error}

        </div>

      )}



      {/* ===============================================
          STATISTICS
          =============================================== */}

      <div className="governance-stats">


        {/* TOTAL KNOWLEDGE MESHES */}

        <div className="governance-stat-card total-card">


          <span className="stat-title">

            TOTAL KNOWLEDGE MESHES

          </span>


          <h2>

            {totalMeshes}

          </h2>


          <p>

            Active knowledge structures

          </p>


        </div>



        {/* PUBLIC INTELLIGENCE */}

        <div className="governance-stat-card public-card">


          <span className="stat-title">

            PUBLIC INTELLIGENCE

          </span>


          <h2>

            {publicMeshes}

          </h2>


          <p>

            Knowledge meshes publicly available

          </p>


        </div>



        {/* REGISTERED ARCHITECTS */}

        <div className="governance-stat-card architect-card">


          <span className="stat-title">

            REGISTERED ARCHITECTS

          </span>


          <h2>

            {registeredArchitects}

          </h2>


          <p>

            Active architects in the ecosystem

          </p>


        </div>


      </div>



      {/* ===============================================
          GOVERNANCE LOGS
          =============================================== */}

      <section className="governance-logs-section">


        <div className="governance-section-header">


          <h2>

            Real-Time Governance Logs

          </h2>


        </div>



        {/* =============================================
            TABLE
            ============================================= */}

        <div className="governance-table-wrapper">


          <table className="governance-table">


            <thead>

              <tr>

                <th>
                  Event Timestamp
                </th>

                <th>
                  Action Node
                </th>

                <th>
                  Target Intelligence
                </th>

                <th>
                  Governance Status
                </th>

              </tr>

            </thead>



            <tbody>


              {governanceLogs.length === 0 ? (


                <tr>

                  <td
                    colSpan="4"
                    className="governance-empty-state"
                  >

                    No governance activity available.

                  </td>

                </tr>


              ) : (


                governanceLogs.map(
                  (log, index) => {


                    const timestamp =

                      log?.timestamp ||

                      log?.createdAt ||

                      log?.time;


                    const action =
                      getAction(log);


                    const target =
                      getTarget(log);


                    return (

                      <tr
                        key={

                          log?.id ||

                          `${action}-${index}`

                        }
                      >


                        {/* TIMESTAMP */}

                        <td>

                          {formatTimestamp(
                            timestamp
                          )}

                        </td>



                        {/* ACTION */}

                        <td>

                          <span className="governance-action">

                            {String(
                              action
                            ).toUpperCase()}

                          </span>

                        </td>



                        {/* TARGET */}

                        <td>

                          {target}

                        </td>



                        {/* STATUS */}

                        <td>

                          <span className="governance-status">

                            VERIFIED

                          </span>

                        </td>


                      </tr>

                    );


                  }
                )


              )}


            </tbody>


          </table>


        </div>


      </section>


    </div>

  );

};


export default GovernanceDashboard;