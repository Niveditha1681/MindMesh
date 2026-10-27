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
  setSelectedGraph,
  setGraphLoading,
  setGraphError,
} from "../../store/slices/graphSlice";

import * as graphServiceModule from "../../services/graphService";
import SearchFilterBar from "../common/SearchFilterBar";

const graphService =
  graphServiceModule?.default ||
  graphServiceModule;


const GraphList = () => {
  const dispatch = useDispatch();

  /*
   * =========================================================
   * REDUX STATE
   * =========================================================
   */

  const graphsState =
    useSelector(
      (state) =>
        state?.graphs || {}
    );

  const authState =
    useSelector(
      (state) =>
        state?.auth || {}
    );


  /*
   * =========================================================
   * GRAPHS
   * =========================================================
   */

  const graphs =
    useMemo(
      () =>
        Array.isArray(
          graphsState?.graphs
        )
          ? graphsState.graphs
          : [],
      [
        graphsState?.graphs,
      ]
    );


  const loading =
    Boolean(
      graphsState?.loading
    );


  const error =
    graphsState?.error || "";


  /*
   * =========================================================
   * USER
   * =========================================================
   */

  const reduxUser =
    authState?.user ||
    null;


  /*
   * localStorage fallback
   */

  let storedUser = null;

  try {
    const savedUser =
      localStorage.getItem(
        "user"
      );

    if (savedUser) {
      storedUser =
        JSON.parse(
          savedUser
        );
    }
  } catch (storageError) {
    storedUser = null;
  }


  const user =
    reduxUser ||
    storedUser ||
    null;


  /*
   * =========================================================
   * ROLE
   * =========================================================
   */

  const rawRole =
    user?.role ??
    user?.userRole ??
    authState?.role ??
    authState?.userRole ??
    user?.roles?.[0] ??
    user?.authorities?.[0]?.authority ??
    user?.authorities?.[0] ??
    storedUser?.role ??
    "";


  const userRole =
    String(rawRole)
      .toUpperCase()
      .replace(
        /^ROLE_/,
        ""
      )
      .trim();


  /*
   * Admin and Knowledge Architect have
   * graph-management privileges.
   *
   * Research Strategist is also allowed to
   * create graphs by the backend.
   */

  const isPrivilegedUser =
    userRole === "ADMIN" ||
    userRole ===
      "KNOWLEDGE_ARCHITECT" ||
    userRole ===
      "RESEARCH_STRATEGIST";


  /*
   * =========================================================
   * LOCAL STATE
   * =========================================================
   */

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);


  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");


  const [
    visibilityFilter,
    setVisibilityFilter,
  ] = useState("ALL");


  /*
   * =========================================================
   * LOAD GRAPHS
   * =========================================================
   */

  const loadGraphs =
    useCallback(
      async () => {

        /*
         * Keep graph loading errors local to
         * GraphList. A failed background request
         * must not break the complete application.
         */

        dispatch(
          setGraphLoading(
            true
          )
        );

        dispatch(
          setGraphError(
            null
          )
        );


        try {

          /*
           * Get owner ID from every common
           * possible user structure.
           */

          const ownerId =
            user?.id ??
            user?.userId ??
            user?.ownerId ??
            storedUser?.id ??
            storedUser?.userId ??
            storedUser?.ownerId ??
            1;


          let data = [];


          /*
           * Always attempt getMyGraphs first.
           */

          if (
            typeof graphService?.getMyGraphs ===
            "function"
          ) {

            try {

              data =
                await graphService.getMyGraphs(
                  ownerId,
                  0,
                  100,
                  "id,asc"
                );

            } catch (personalError) {

              /*
               * If the personal endpoint fails,
               * safely fall back to the general
               * graph endpoint.
               */

              if (
                typeof graphService?.getGraphs ===
                "function"
              ) {

                try {

                  data =
                    await graphService.getGraphs();

                } catch (generalError) {

                  /*
                   * Do not throw the error outside
                   * this component.
                   *
                   * GraphList can display its own
                   * error state.
                   */

                  dispatch(
                    setGraphError(
                      generalError?.message ||
                      personalError?.message ||
                      "Unable to load graphs."
                    )
                  );

                  return;
                }

              } else {

                dispatch(
                  setGraphError(
                    personalError?.message ||
                    "Unable to load graphs."
                  )
                );

                return;
              }
            }

          } else if (
            typeof graphService?.getGraphs ===
            "function"
          ) {

            try {

              data =
                await graphService.getGraphs();

            } catch (generalError) {

              dispatch(
                setGraphError(
                  generalError?.message ||
                  "Unable to load graphs."
                )
              );

              return;
            }

          } else {

            dispatch(
              setGraphError(
                "Graph service is unavailable."
              )
            );

            return;
          }


          /*
           * Normalize response.
           */

          let graphList = [];


          if (
            Array.isArray(data)
          ) {

            graphList =
              data;

          } else if (
            Array.isArray(
              data?.content
            )
          ) {

            graphList =
              data.content;

          } else if (
            Array.isArray(
              data?.data
            )
          ) {

            graphList =
              data.data;
          }


          dispatch(
            setGraphs(
              graphList
            )
          );

          dispatch(
            setGraphError(
              null
            )
          );


        } catch (err) {

          /*
           * Last-resort protection.
           *
           * Never allow a graph loading exception
           * to escape and crash the entire React tree.
           */

          dispatch(
            setGraphError(
              err?.message ||
              "Unable to load graphs."
            )
          );

        } finally {

          dispatch(
            setGraphLoading(
              false
            )
          );

        }

      },
      [
        dispatch,
        user,
      ]
    );


  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(
    () => {

      /*
       * Do not let an asynchronous graph-loading
       * failure become an unhandled React error.
       */

      Promise.resolve(
        loadGraphs()
      ).catch(
        () => {
          /*
           * loadGraphs already handles errors.
           * This is only an additional safety guard.
           */
        }
      );

    },
    [
      loadGraphs,
    ]
  );


  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const handleSearch =
    useCallback(
      (value) => {

        setSearchQuery(
          value || ""
        );

      },
      []
    );


  /*
   * =========================================================
   * FILTER
   * =========================================================
   */

  const handleFilterChange =
    useCallback(
      (value) => {

        setVisibilityFilter(
          value || "ALL"
        );

      },
      []
    );


  /*
   * =========================================================
   * FILTERED GRAPHS
   * =========================================================
   */

  const filteredGraphs =
    useMemo(
      () => {

        const normalizedSearch =
          searchQuery
            .trim()
            .toLowerCase();


        return graphs.filter(
          (graph) => {

            const title =
              String(
                graph?.title ||
                ""
              ).toLowerCase();


            const description =
              String(
                graph?.description ||
                ""
              ).toLowerCase();


            const matchesSearch =
              !normalizedSearch ||
              title.includes(
                normalizedSearch
              ) ||
              description.includes(
                normalizedSearch
              );


            const isPublic =
              graph?.isPublic ===
              true;


            const matchesVisibility =
              visibilityFilter ===
                "ALL" ||

              (
                visibilityFilter ===
                  "PUBLIC" &&
                isPublic
              ) ||

              (
                visibilityFilter ===
                  "PRIVATE" &&
                !isPublic
              );


            return (
              matchesSearch &&
              matchesVisibility
            );

          }
        );

      },
      [
        graphs,
        searchQuery,
        visibilityFilter,
      ]
    );


  /*
   * =========================================================
   * SELECT GRAPH
   * =========================================================
   */

  const handleSelectGraph =
    useCallback(
      (graph) => {

        if (!graph) {
          return;
        }

        dispatch(
          setSelectedGraph(
            graph
          )
        );

      },
      [
        dispatch,
      ]
    );


  /*
   * =========================================================
   * DELETE GRAPH
   * =========================================================
   */

  const handleDelete =
    useCallback(
      async (
        graphId
      ) => {

        if (
          graphId ===
            undefined ||
          graphId === null
        ) {
          return;
        }


        const confirmed =
          window.confirm(
            "Are you sure you want to delete this graph?"
          );


        if (!confirmed) {
          return;
        }


        setDeletingId(
          graphId
        );


        dispatch(
          setGraphError(
            null
          )
        );


        try {

          if (
            typeof graphService?.deleteGraph !==
            "function"
          ) {
            throw new Error(
              "Graph delete service is unavailable."
            );
          }


          await graphService.deleteGraph(
            graphId
          );


          const selectedGraph =
            graphsState?.selectedGraph;


          const selectedGraphId =
            selectedGraph?.id ??
            selectedGraph?.graphId;


          if (
            selectedGraphId ===
            graphId
          ) {

            dispatch(
              setSelectedGraph(
                null
              )
            );

          }


          await loadGraphs();


        } catch (err) {

          dispatch(
            setGraphError(
              err?.message ||
              "Unable to delete graph."
            )
          );

        } finally {

          setDeletingId(
            null
          );

        }

      },
      [
        dispatch,
        graphsState?.selectedGraph,
        loadGraphs,
      ]
    );


  /*
   * =========================================================
   * FOCUS CREATE INPUT
   * =========================================================
   */

  const focusCreateInput =
    useCallback(
      () => {

        /*
         * GraphForm uses mesh-title.
         */

        const titleInput =
          document.getElementById(
            "graph-title"
          );


        if (titleInput) {

          titleInput.focus();


          if (
            typeof titleInput.scrollIntoView ===
            "function"
          ) {

            titleInput.scrollIntoView({
              behavior:
                "smooth",
              block:
                "center",
            });

          }

        }

      },
      []
    );


  /*
   * =========================================================
   * CREATE BUTTON
   * =========================================================
   */

  const createButton =
    isPrivilegedUser && (

      <button
        type="button"
        className="graph-action-button"
        onClick={
          focusCreateInput
        }
      >
        + Create New Mesh
      </button>

    );


  /*
   * =========================================================
   * HEADER
   * =========================================================
   */

  const renderHeader =
    ({
      showActions = true,
    } = {}) => (

      <div
        className="graph-list-header"
      >

        <div>

          <span className="section-label">
            KNOWLEDGE WORKSPACE
          </span>


          <h2>
            Mind Graphs
          </h2>


          <p>
            Explore and manage your
            knowledge graphs.
          </p>

        </div>


        {showActions && (

          <div
            className="graph-list-header-actions"
          >

            {createButton}


            <button
              type="button"
              className="graph-action-button"
              onClick={
                loadGraphs
              }
              disabled={
                loading
              }
            >
              Refresh
            </button>

          </div>

        )}

      </div>
    );


  /*
   * =========================================================
   * LOADING STATE
   * =========================================================
   */

  if (loading) {

    return (

      <section
        className="graph-list-section"
        aria-label="Knowledge graphs"
      >

        {renderHeader({
          showActions:
            false,
        })}


        <div
          className="graph-state-card"
          role="status"
          aria-live="polite"
        >

          <div
            className="graph-spinner"
            aria-hidden="true"
          />


          <p>
            Loading your graphs...
          </p>

        </div>

      </section>

    );
  }


  /*
   * =========================================================
   * ERROR STATE
   * =========================================================
   */

  if (error) {

    return (

      <section
        className="graph-list-section"
        aria-label="Knowledge graphs"
      >

        {renderHeader()}


        <div
          className="graph-error-card"
          role="alert"
        >

          <div
            className="graph-error-icon"
            aria-hidden="true"
          >
            !
          </div>


          <div>

            <h3>
              Unable to load graphs
            </h3>


            <p>
              {error}
            </p>

          </div>

        </div>


        <div
          className="graph-error-actions"
        >

          <button
            type="button"
            className="graph-action-button"
            onClick={
              loadGraphs
            }
          >
            Retry Action
          </button>

        </div>

      </section>

    );
  }


  /*
   * =========================================================
   * EMPTY STATE
   * =========================================================
   */

  if (
    graphs.length ===
    0
  ) {

    return (

      <section
        className="graph-list-section"
        aria-label="Knowledge graphs"
      >

        {renderHeader()}


        <div
          className="graph-empty-card"
        >

          <div
            className="graph-empty-icon"
            aria-hidden="true"
          >
            ◇
          </div>


          <h3>
            No knowledge graphs yet
          </h3>


          <p>
            You haven't built any
            interactive graphs yet.
            Build your first Mind Graph
            to begin connecting concepts
            and relationships.
          </p>


          <button
            type="button"
            className="graph-action-button"
            onClick={
              focusCreateInput
            }
          >
            Build First Mesh
          </button>

        </div>

      </section>

    );
  }


  /*
   * =========================================================
   * GRAPH LIST
   * =========================================================
   */

  return (

    <section
      className="graph-list-section"
      aria-label="Knowledge graphs"
    >

      {renderHeader()}


      <SearchFilterBar
        onSearch={
          handleSearch
        }
        onFilterChange={
          handleFilterChange
        }
        placeholder="Search knowledge graphs..."
      />


      <div
        className="graph-list-summary"
      >

        <span>
          Showing{" "}
          {filteredGraphs.length}{" "}
          of{" "}
          {graphs.length}{" "}
          graphs
        </span>


        {visibilityFilter !==
          "ALL" && (

          <span>
            Filter:{" "}
            {visibilityFilter}
          </span>

        )}

      </div>


      {/* =================================================
          NO SEARCH RESULTS
          ================================================= */}

      {filteredGraphs.length ===
      0 ? (

        <div
          className="graph-empty-card"
        >

          <div
            className="graph-empty-icon"
            aria-hidden="true"
          >
            ⌕
          </div>


          <h3>
            No matching graphs
          </h3>


          <p>
            Try a different search term
            or visibility filter.
          </p>


          <button
            type="button"
            className="graph-action-button"
            onClick={() => {

              setSearchQuery(
                ""
              );

              setVisibilityFilter(
                "ALL"
              );

            }}
          >
            Clear Filters
          </button>

        </div>

      ) : (

        <div
          className="graph-grid"
        >

          {filteredGraphs.map(
            (
              graph,
              index
            ) => {

              const graphId =
                graph?.id ??
                graph?.graphId ??
                `graph-${index}`;


              const graphTitle =
                graph?.title ||
                `Graph ${graphId}`;


              const description =
                graph?.description ||
                "Knowledge graph workspace";


              const isPublic =
                graph?.isPublic ===
                true;


              const selectedGraph =
                graphsState?.selectedGraph;


              const selectedGraphId =
                selectedGraph?.id ??
                selectedGraph?.graphId;


              const currentGraphId =
                graph?.id ??
                graph?.graphId;


              const isSelected =
                selectedGraphId !==
                  undefined &&
                selectedGraphId !==
                  null &&
                selectedGraphId ===
                  currentGraphId;


              return (

                <article
                  key={graphId}
                  className={
                    isSelected
                      ? "graph-card selected"
                      : "graph-card"
                  }
                  onClick={() =>
                    handleSelectGraph(
                      graph
                    )
                  }
                  tabIndex={0}
                  role="button"
                  aria-label={
                    `Select ${graphTitle}`
                  }
                  aria-pressed={
                    isSelected
                  }
                  onKeyDown={
                    (event) => {

                      if (
                        event.key ===
                          "Enter" ||
                        event.key ===
                          " "
                      ) {

                        event.preventDefault();


                        handleSelectGraph(
                          graph
                        );

                      }

                    }
                  }
                >

                  <div
                    className="graph-card-top"
                  >

                    <div
                      className="graph-card-icon"
                      aria-hidden="true"
                    >
                      ◇
                    </div>


                    <span
                      className={
                        isPublic
                          ? "graph-status public"
                          : "graph-status"
                      }
                    >
                      {isPublic
                        ? "Public"
                        : "Private"}
                    </span>

                  </div>


                  <h3>
                    {graphTitle}
                  </h3>


                  <p
                    className="graph-description"
                  >
                    {description}
                  </p>


                  <div
                    className="graph-card-footer"
                  >

                    <span>
                      ID:{" "}
                      {currentGraphId ??
                        "—"}
                    </span>


                    {(
                      userRole ===
                        "KNOWLEDGE_ARCHITECT" ||
                      userRole ===
                        "ADMIN"
                    ) && (

                      <button
                        type="button"
                        className="graph-delete-button"
                        disabled={
                          deletingId ===
                          currentGraphId
                        }
                        onClick={
                          (event) => {

                            event.stopPropagation();


                            handleDelete(
                              currentGraphId
                            );

                          }
                        }
                      >

                        {deletingId ===
                        currentGraphId
                          ? "Deleting..."
                          : "Delete"}

                      </button>

                    )}

                  </div>

                </article>

              );

            }
          )}

        </div>

      )}


      <div
        className="graph-list-footer"
      >

        <span>
          {filteredGraphs.length}{" "}
          {
            filteredGraphs.length ===
            1
              ? "graph"
              : "graphs"
          }
        </span>


        <span>
          {userRole ||
            "USER"}
        </span>

      </div>

    </section>

  );
};


export default GraphList;