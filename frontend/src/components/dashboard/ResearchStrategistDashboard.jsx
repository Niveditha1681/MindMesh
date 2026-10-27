import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  setGraphs,
} from "../../store/slices/graphSlice";

import * as graphServiceModule
  from "../../services/graphService";

import {
  getNodesByGraph,
} from "../../services/nodeService";

import "./ResearchStrategistDashboard.css";


const graphService =
  graphServiceModule?.default ||
  graphServiceModule;


/*
 * =========================================================
 * RESEARCH STRATEGIST DASHBOARD
 * =========================================================
 */

const ResearchStrategistDashboard = () => {

  const dispatch =
    useDispatch();


  /*
   * =======================================================
   * AUTH STATE
   * =======================================================
   */

  const authState =
    useSelector(
      (state) =>
        state?.auth || {}
    );


  /*
   * =======================================================
   * USER
   * =======================================================
   */

  let storedUser = null;

  try {

    const savedUser =
      localStorage.getItem("user");

    if (savedUser) {

      storedUser =
        JSON.parse(savedUser);

    }

  } catch (error) {

    storedUser = null;

  }


  const user =
    authState?.user ||
    storedUser ||
    null;


  /*
   * =======================================================
   * MAIN STATE
   * =======================================================
   */

  const [
    graphs,
    setLocalGraphs,
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


  const [
    deletingId,
    setDeletingId,
  ] = useState(null);


  /*
   * =======================================================
   * EDIT MODAL STATE
   * =======================================================
   */

  const [
    showEditModal,
    setShowEditModal,
  ] = useState(false);


  const [
    selectedGraph,
    setLocalSelectedGraph,
  ] = useState(null);


  const [
    title,
    setTitle,
  ] = useState("");


  const [
    description,
    setDescription,
  ] = useState("");


  const [
    isPublic,
    setIsPublic,
  ] = useState(true);


  const [
    formLoading,
    setFormLoading,
  ] = useState(false);


  const [
    formError,
    setFormError,
  ] = useState("");


  /*
   * =======================================================
   * CANVAS INSIGHT MODAL STATE
   * =======================================================
   */

  const [
    showCanvasModal,
    setShowCanvasModal,
  ] = useState(false);


  const [
    canvasGraph,
    setCanvasGraph,
  ] = useState(null);


  const [
    canvasNodes,
    setCanvasNodes,
  ] = useState([]);


  const [
    canvasLoading,
    setCanvasLoading,
  ] = useState(false);


  const [
    canvasError,
    setCanvasError,
  ] = useState("");


  /*
   * =======================================================
   * PAGINATION
   * =======================================================
   */

  const graphsPerPage = 3;


  /*
   * =======================================================
   * OWNER ID
   * =======================================================
   */

  const ownerId =
    user?.id ??
    user?.userId ??
    user?.ownerId ??
    storedUser?.id ??
    storedUser?.userId ??
    storedUser?.ownerId;


  /*
   * =======================================================
   * LOAD GRAPHS
   * =======================================================
   */

  const loadGraphs =
    useCallback(
      async () => {

        setLoading(true);

        setError("");


        try {

          let response;


          if (
            typeof graphService?.getMyGraphs ===
            "function"
          ) {

            response =
              await graphService.getMyGraphs(
                ownerId,
                0,
                100,
                "id,asc"
              );

          } else if (
            typeof graphService?.getGraphs ===
            "function"
          ) {

            response =
              await graphService.getGraphs();

          } else {

            throw new Error(
              "Graph service is unavailable."
            );

          }


          /*
           * -----------------------------------------------
           * NORMALIZE RESPONSE
           * -----------------------------------------------
           */

          let graphList = [];


          if (
            Array.isArray(response)
          ) {

            graphList =
              response;

          } else if (
            Array.isArray(
              response?.content
            )
          ) {

            graphList =
              response.content;

          } else if (
            Array.isArray(
              response?.data
            )
          ) {

            graphList =
              response.data;

          } else if (
            Array.isArray(
              response?.graphs
            )
          ) {

            graphList =
              response.graphs;

          }


          setLocalGraphs(
            graphList
          );


          dispatch(
            setGraphs(
              graphList
            )
          );


        } catch (requestError) {

          console.error(
            "Unable to load knowledge meshes:",
            requestError
          );


          setError(
            requestError?.message ||
            "Unable to load knowledge meshes."
          );


          setLocalGraphs([]);

        } finally {

          setLoading(false);

        }

      },
      [
        dispatch,
        ownerId,
      ]
    );


  /*
   * =======================================================
   * INITIAL LOAD
   * =======================================================
   */

  useEffect(
    () => {

      loadGraphs();

    },
    [
      loadGraphs,
    ]
  );


  /*
   * =======================================================
   * TOTAL PAGES
   * =======================================================
   */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        graphs.length /
        graphsPerPage
      )
    );


  /*
   * =======================================================
   * KEEP CURRENT PAGE VALID
   * =======================================================
   */

  useEffect(
    () => {

      if (
        currentPage >
        totalPages
      ) {

        setCurrentPage(
          totalPages
        );

      }

    },
    [
      currentPage,
      totalPages,
    ]
  );


  /*
   * =======================================================
   * PAGINATED GRAPHS
   * =======================================================
   */

  const paginatedGraphs =
    useMemo(
      () => {

        const startIndex =
          (currentPage - 1) *
          graphsPerPage;


        return graphs.slice(
          startIndex,
          startIndex +
          graphsPerPage
        );

      },
      [
        graphs,
        currentPage,
      ]
    );


  /*
   * =======================================================
   * COMPLEXITY
   * =======================================================
   */

  const getComplexity =
    (graph) => {

      const value =
        graph?.complexity ??
        graph?.complexityScore ??
        graph?.score ??
        0;


      const number =
        Number(value);


      if (
        Number.isNaN(number)
      ) {

        return "0.0";

      }


      return number.toFixed(1);

    };


  /*
   * =======================================================
   * VISIBILITY
   * =======================================================
   */

  const getVisibility =
    (graph) => {

      if (
        graph?.isPublic === true
      ) {

        return "Public";

      }


      const visibility =
        graph?.visibility ||
        graph?.accessType ||
        "";


      if (
        String(visibility)
          .toUpperCase()
          .includes("PUBLIC")
      ) {

        return "Public";

      }


      return "Private";

    };


  /*
   * =======================================================
   * OPEN CANVAS INSIGHT
   * =======================================================
   */

  const handleOpenCanvas =
    async (graph) => {

      const graphId =
        graph?.id ??
        graph?.graphId;


      if (
        graphId === undefined ||
        graphId === null
      ) {

        return;

      }


      setCanvasGraph(
        graph
      );


      setCanvasNodes([]);


      setCanvasError("");


      setShowCanvasModal(
        true
      );


      setCanvasLoading(
        true
      );


      try {

        const response =
          await getNodesByGraph(
            graphId
          );


        const nodeList =
          Array.isArray(response)
            ? response
            : (
                Array.isArray(
                  response?.data
                )
                  ? response.data
                  : []
              );


        setCanvasNodes(
          nodeList
        );


      } catch (requestError) {

        console.error(
          "Unable to load canvas information:",
          requestError
        );


        setCanvasError(
          requestError?.message ||
          "Unable to load canvas information."
        );


        setCanvasNodes([]);


      } finally {

        setCanvasLoading(
          false
        );

      }

    };


  /*
   * =======================================================
   * CLOSE CANVAS MODAL
   * =======================================================
   *
   * IMPORTANT:
   *
   * The modal can now always be closed.
   * We do NOT block closing while data is loading.
   * =======================================================
   */

  const closeCanvasModal = () => {

  setShowCanvasModal(false);

  setCanvasGraph(null);

  setCanvasNodes([]);

  setCanvasError("");

  setCanvasLoading(false);

};


  /*
   * =======================================================
   * CONCEPTUAL FRAMEWORK
   * =======================================================
   */

  const conceptualFramework =
    useMemo(
      () => {

        const concepts = [];

        const addedValues =
          new Set();


        canvasNodes.forEach(
          (node) => {

            const values = [

              node?.contentType,

              node?.label,

            ];


            values.forEach(
              (value) => {

                if (!value) {
                  return;
                }


                const text =
                  String(value).trim();


                if (!text) {
                  return;
                }


                const key =
                  text.toLowerCase();


                if (
                  addedValues.has(key)
                ) {

                  return;

                }


                addedValues.add(
                  key
                );


                concepts.push(
                  text
                );

              }
            );

          }
        );


        return concepts;

      },
      [
        canvasNodes,
      ]
    );


  /*
   * =======================================================
   * EDIT INFO
   * =======================================================
   */

  const handleEditInfo =
    (graph) => {

      setLocalSelectedGraph(
        graph
      );


      setTitle(
        graph?.title ||
        graph?.name ||
        ""
      );


      setDescription(
        graph?.description ||
        ""
      );


      setIsPublic(
        graph?.isPublic === true
      );


      setFormError("");


      setShowEditModal(
        true
      );

    };


  /*
   * =======================================================
   * CLOSE EDIT MODAL
   * =======================================================
   */

  const closeEditModal =
    () => {

      if (
        formLoading
      ) {

        return;

      }


      setShowEditModal(
        false
      );


      setLocalSelectedGraph(
        null
      );


      setFormError("");

    };


  /*
   * =======================================================
   * UPDATE MESH
   * =======================================================
   */

  const handleUpdate =
    async (event) => {

      event.preventDefault();


      if (
        !title.trim()
      ) {

        setFormError(
          "Mesh title is required."
        );

        return;

      }


      const graphId =
        selectedGraph?.id ??
        selectedGraph?.graphId;


      if (
        graphId === undefined ||
        graphId === null
      ) {

        setFormError(
          "Invalid knowledge mesh."
        );

        return;

      }


      setFormLoading(
        true
      );


      setFormError("");


      try {

        const graphData = {

          title:
            title.trim(),

          description:
            description.trim(),

          isPublic:
            Boolean(
              isPublic
            ),

        };


        const updateGraph =
          graphService?.updateGraph ||
          graphServiceModule?.updateGraph;


        if (
          typeof updateGraph !==
          "function"
        ) {

          throw new Error(
            "Update service is unavailable."
          );

        }


        await updateGraph(
          graphId,
          graphData
        );


        setShowEditModal(
          false
        );


        setLocalSelectedGraph(
          null
        );


        await loadGraphs();


      } catch (requestError) {

        setFormError(
          requestError?.message ||
          "Unable to update knowledge mesh."
        );

      } finally {

        setFormLoading(
          false
        );

      }

    };


  /*
   * =======================================================
   * DELETE MESH
   * =======================================================
   */

  const handleDelete =
    async (graph) => {

      const graphId =
        graph?.id ??
        graph?.graphId;


      if (
        graphId === undefined ||
        graphId === null
      ) {

        return;

      }


      const confirmed =
        window.confirm(
          `Delete "${
            graph?.title ||
            "this mesh"
          }"?`
        );


      if (!confirmed) {

        return;

      }


      setDeletingId(
        graphId
      );


      try {

        const deleteGraph =
          graphService?.deleteGraph ||
          graphServiceModule?.deleteGraph;


        if (
          typeof deleteGraph !==
          "function"
        ) {

          throw new Error(
            "Delete service is unavailable."
          );

        }


        await deleteGraph(
          graphId
        );


        await loadGraphs();


      } catch (requestError) {

        alert(
          requestError?.message ||
          "Unable to delete knowledge mesh."
        );

      } finally {

        setDeletingId(
          null
        );

      }

    };


  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (

    <main className="research-dashboard">


      <div className="research-dashboard-content">


        {/* =================================================
            HEADER
            ================================================= */}

        <div className="research-dashboard-header">

          <h1>
            My Knowledge Meshes
          </h1>

        </div>


        {/* =================================================
            LOADING
            ================================================= */}

        {loading ? (

          <div className="mesh-loading">

            Loading knowledge meshes...

          </div>

        ) : error ? (

          <div className="mesh-error">

            <h3>
              Unable to load meshes
            </h3>


            <p>
              {error}
            </p>


            <button
              type="button"
              onClick={
                loadGraphs
              }
            >
              Retry
            </button>

          </div>

        ) : graphs.length === 0 ? (

          <div className="mesh-empty">

            <div className="mesh-empty-icon">
              ◇
            </div>


            <h2>
              No Knowledge Meshes Yet
            </h2>


            <p>
              You don't have any knowledge meshes
              yet. Create and manage meshes from
              the Knowledge Workspace.
            </p>

          </div>

        ) : (

          <section className="mesh-table-container">

            <div className="mesh-table-wrapper">

              <table className="mesh-table">

                <thead>

                  <tr>

                    <th>
                      Title
                    </th>

                    <th>
                      Complexity
                    </th>

                    <th>
                      Visibility
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {paginatedGraphs.map(
                    (
                      graph,
                      index
                    ) => {

                      const graphId =
                        graph?.id ??
                        graph?.graphId ??
                        index;


                      const graphTitle =
                        graph?.title ||
                        graph?.name ||
                        `Mesh ${graphId}`;


                      const visibility =
                        getVisibility(
                          graph
                        );


                      return (

                        <tr
                          key={graphId}
                        >

                          <td className="mesh-title-cell">

                            {graphTitle}

                          </td>


                          <td>

                            {getComplexity(
                              graph
                            )}

                          </td>


                          <td>

                            <span
                              className={
                                visibility === "Public"
                                  ? "visibility-public"
                                  : "visibility-private"
                              }
                            >

                              {visibility}

                            </span>

                          </td>


                          <td>

                            <div className="mesh-actions">

                              <button
                                type="button"
                                className="open-canvas-btn"
                                onClick={() =>
                                  handleOpenCanvas(
                                    graph
                                  )
                                }
                              >

                                Open Canvas

                              </button>


                              <button
                                type="button"
                                className="edit-info-btn"
                                onClick={() =>
                                  handleEditInfo(
                                    graph
                                  )
                                }
                              >

                                Edit Info

                              </button>


                              <button
                                type="button"
                                className="delete-mesh-btn"
                                disabled={
                                  deletingId ===
                                  graphId
                                }
                                onClick={() =>
                                  handleDelete(
                                    graph
                                  )
                                }
                              >

                                {deletingId ===
                                graphId
                                  ? "Deleting..."
                                  : "Delete"}

                              </button>

                            </div>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>


            {/* =================================================
                PAGINATION
                ================================================= */}

            <div className="mesh-pagination">

              <button
                type="button"
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


              <span>

                Page{" "}
                {currentPage}{" "}
                of{" "}
                {totalPages}

              </span>


              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
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

          </section>

        )}


        {/* =================================================
            CANVAS INSIGHT MODAL
            ================================================= */}

        {showCanvasModal && (

          <div
            className="canvas-insight-overlay"
            onClick={
              closeCanvasModal
            }
          >

            <div
              className="canvas-insight-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >


              {/* =================================================
                  HEADER
                  ================================================= */}

              <div className="canvas-insight-header">

                <h2>
                  Mesh Insight: View
                </h2>


              <button
  type="button"
  className="canvas-insight-close"
  onClick={closeCanvasModal}
  aria-label="Close insight"
>
  ×
</button>

              </div>


              {/* =================================================
                  DESCRIPTION
                  ================================================= */}

              <div className="canvas-insight-description">

                <span>
                  DESCRIPTION
                </span>


                <p>

                  {canvasGraph?.description?.trim()
                    ? canvasGraph.description
                    : "No description available for this knowledge mesh."}

                </p>

              </div>


              {/* =================================================
                  LOADING / ERROR / CONTENT
                  ================================================= */}

              {canvasLoading ? (

                <div className="canvas-insight-loading">

                  Loading canvas insight...

                </div>

              ) : canvasError ? (

                <div className="canvas-insight-error">

                  {canvasError}

                </div>

              ) : (

                <>

                  {/* =============================================
                      STATS
                      ============================================= */}

                  <div className="canvas-insight-stats">

                    <div className="canvas-insight-stat">

                      <span>
                        Complexity Score
                      </span>


                      <strong>
                        {getComplexity(
                          canvasGraph
                        )}
                      </strong>

                    </div>


                    <div className="canvas-insight-stat">

                      <span>
                        Node Count
                      </span>


                      <strong>
                        {canvasNodes.length}
                      </strong>

                    </div>

                  </div>


                  <div className="canvas-insight-divider" />


                  {/* =============================================
                      CONCEPTUAL FRAMEWORK
                      ============================================= */}

                  <div className="canvas-insight-framework">

                    <h3>
                      Conceptual Framework
                    </h3>


                    {conceptualFramework.length > 0 ? (

                      <div className="canvas-insight-tags">

                        {conceptualFramework.map(
                          (
                            concept,
                            index
                          ) => (

                            <span
                              key={`${concept}-${index}`}
                              className="canvas-insight-tag"
                            >

                              <span className="canvas-insight-tag-dot" />

                              {concept}

                            </span>

                          )
                        )}

                      </div>

                    ) : (

                      <p className="canvas-insight-no-concepts">

                        No conceptual framework is
                        available yet.

                      </p>

                    )}

                  </div>

                </>

              )}


              {/* =================================================
                  CLOSE BUTTON
                  ================================================= */}

              <button
  type="button"
  className="canvas-insight-close-btn"
  onClick={closeCanvasModal}
>
  Close Canvas
</button>


            </div>

          </div>

        )}


        {/* =================================================
            EDIT MODAL
            ================================================= */}

        {showEditModal && (

          <div
            className="mesh-modal-overlay"
            onClick={
              closeEditModal
            }
          >

            <div
              className="mesh-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="mesh-modal-header">

                <h2>
                  Edit Mesh Information
                </h2>


                <button
                  type="button"
                  onClick={
                    closeEditModal
                  }
                  aria-label="Close edit dialog"
                >

                  ×

                </button>

              </div>


              <form
                onSubmit={
                  handleUpdate
                }
              >

                <label>
                  Title
                </label>


                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                />


                <label>
                  Description
                </label>


                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                />


                <label className="public-checkbox">

                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(event) =>
                      setIsPublic(
                        event.target.checked
                      )
                    }
                  />

                  Make this mesh public

                </label>


                {formError && (

                  <div className="form-error">

                    {formError}

                  </div>

                )}


                <div className="mesh-modal-actions">

                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={
                      closeEditModal
                    }
                  >

                    Cancel

                  </button>


                  <button
                    type="submit"
                    className="modal-save-btn"
                    disabled={
                      formLoading
                    }
                  >

                    {formLoading
                      ? "Saving..."
                      : "Save Changes"}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </div>

    </main>

  );

};


export default ResearchStrategistDashboard;