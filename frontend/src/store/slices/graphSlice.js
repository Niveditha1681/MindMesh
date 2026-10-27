import { createSlice } from "@reduxjs/toolkit";


/*
 * =========================================================
 * INITIAL STATE
 * =========================================================
 */

const initialState = {
  graphs: [],
  selectedGraph: null,
  loading: false,
  error: null,
};


/*
 * =========================================================
 * GRAPH SLICE
 * =========================================================
 */

const graphSlice = createSlice({

  name: "graphs",

  initialState,


  reducers: {


    /*
     * =====================================================
     * SET ALL GRAPHS
     * =====================================================
     */

    setGraphs: (state, action) => {

      state.graphs =
        Array.isArray(action.payload)
          ? action.payload
          : [];

      /*
       * A successful graph load clears
       * the previous loading state.
       */

      state.loading = false;

      state.error = null;

    },


    /*
     * =====================================================
     * SELECT GRAPH
     * =====================================================
     */

    setSelectedGraph: (
      state,
      action
    ) => {

      state.selectedGraph =
        action.payload || null;

    },


    /*
     * =====================================================
     * ADD GRAPH
     * =====================================================
     */

    addGraph: (
      state,
      action
    ) => {

      if (!action.payload) {
        return;
      }


      state.graphs.push(
        action.payload
      );


      /*
       * Newly created graph becomes
       * the selected graph.
       *
       * This makes the UI immediately
       * ready for adding nodes/edges.
       */

      state.selectedGraph =
        action.payload;

      state.error = null;

    },


    /*
     * =====================================================
     * UPDATE GRAPH
     * =====================================================
     */

    updateGraph: (
      state,
      action
    ) => {

      const updatedGraph =
        action.payload;


      if (!updatedGraph) {
        return;
      }


      /*
       * Support a normal numeric/string id.
       */

      const updatedId =
        updatedGraph.id ??
        updatedGraph.graphId;


      if (
        updatedId === undefined ||
        updatedId === null
      ) {
        return;
      }


      const index =
        state.graphs.findIndex(
          (graph) => {

            const graphId =
              graph?.id ??
              graph?.graphId;

            return String(graphId) ===
              String(updatedId);

          }
        );


      /*
       * Update graph in collection.
       */

      if (index !== -1) {

        state.graphs[index] =
          updatedGraph;

      }


      /*
       * Keep selected graph synchronized.
       */

      if (
        state.selectedGraph
      ) {

        const selectedId =
          state.selectedGraph.id ??
          state.selectedGraph.graphId;


        if (
          selectedId !== undefined &&
          selectedId !== null &&
          String(selectedId) ===
            String(updatedId)
        ) {

          state.selectedGraph =
            updatedGraph;

        }

      }


      state.error = null;

    },


    /*
     * =====================================================
     * REMOVE GRAPH
     * =====================================================
     */

    removeGraph: (
      state,
      action
    ) => {

      const graphId =
        action.payload;


      if (
        graphId === undefined ||
        graphId === null
      ) {
        return;
      }


      state.graphs =
        state.graphs.filter(
          (graph) => {

            const currentId =
              graph?.id ??
              graph?.graphId;

            return String(currentId) !==
              String(graphId);

          }
        );


      /*
       * Clear selected graph when
       * the selected graph is deleted.
       */

      if (
        state.selectedGraph
      ) {

        const selectedId =
          state.selectedGraph.id ??
          state.selectedGraph.graphId;


        if (
          selectedId !== undefined &&
          selectedId !== null &&
          String(selectedId) ===
            String(graphId)
        ) {

          state.selectedGraph =
            null;

        }

      }

    },


    /*
     * =====================================================
     * LOADING
     * =====================================================
     */

    setGraphLoading: (
      state,
      action
    ) => {

      state.loading =
        Boolean(action.payload);

    },


    /*
     * =====================================================
     * ERROR
     * =====================================================
     */

    setGraphError: (
      state,
      action
    ) => {

      state.error =
        action.payload || null;

      /*
       * An error means the current
       * request is no longer loading.
       */

      state.loading = false;

    },


    /*
     * =====================================================
     * CLEAR ERROR
     * =====================================================
     */

    clearGraphError: (
      state
    ) => {

      state.error = null;

    },


    /*
     * =====================================================
     * CLEAR ALL GRAPHS
     * =====================================================
     */

    clearGraphs: (
      state
    ) => {

      state.graphs = [];

      state.selectedGraph = null;

      state.loading = false;

      state.error = null;

    },

  },

});


/*
 * =========================================================
 * ACTIONS
 * =========================================================
 */

export const {
  setGraphs,
  setSelectedGraph,
  addGraph,
  updateGraph,
  removeGraph,
  setGraphLoading,
  setGraphError,
  clearGraphError,
  clearGraphs,
} = graphSlice.actions;


/*
 * =========================================================
 * REDUCER
 * =========================================================
 */

export default graphSlice.reducer;