import apiRequest from "./api";


/*
 * =========================================================
 * GET ALL GRAPHS
 * GET /api/graphs
 * =========================================================
 */

export const getGraphs = async () => {

  return await apiRequest(
    "/graphs",
    {
      method: "GET",
    }
  );
};


/*
 * =========================================================
 * SEARCH GRAPHS
 * GET /api/graphs/search?query=value
 * =========================================================
 */

export const searchGraphs = async (
  query
) => {

  const value =
    query?.trim() || "";

  return await apiRequest(
    `/graphs/search?query=${encodeURIComponent(
      value
    )}`,
    {
      method: "GET",
    }
  );
};


/*
 * =========================================================
 * GET PUBLIC GRAPHS
 * GET /api/graphs/public
 * =========================================================
 */

export const getPublicGraphs = async () => {

  return await apiRequest(
    "/graphs/public",
    {
      method: "GET",
    }
  );
};


/*
 * =========================================================
 * GET MY GRAPHS
 * GET /api/graphs/my
 * =========================================================
 */

export const getMyGraphs = async (
  ownerId,
  page = 0,
  size = 10,
  sort = "id,asc"
) => {

  if (
    ownerId === undefined ||
    ownerId === null ||
    ownerId === ""
  ) {
    throw new Error(
      "Owner ID is required."
    );
  }

  return await apiRequest(
    `/graphs/my?ownerId=${encodeURIComponent(
      ownerId
    )}&page=${page}&size=${size}&sort=${encodeURIComponent(
      sort
    )}`,
    {
      method: "GET",
    }
  );
};


/*
 * =========================================================
 * GET GRAPH BY ID
 * GET /api/graphs/{id}
 * =========================================================
 */

export const getGraphById = async (
  graphId
) => {

  if (
    graphId === undefined ||
    graphId === null ||
    graphId === ""
  ) {
    throw new Error(
      "Graph ID is required."
    );
  }

  return await apiRequest(
    `/graphs/${graphId}`,
    {
      method: "GET",
    }
  );
};


/*
 * =========================================================
 * RECORD GRAPH VIEW
 * POST /api/graphs/{id}/view?viewerId={viewerId}
 * =========================================================
 *
 * Used when a user explicitly opens a public
 * knowledge mesh from the View Analyst discovery page.
 */

export const recordGraphView = async (
  graphId,
  viewerId
) => {

  if (
    graphId === undefined ||
    graphId === null ||
    graphId === ""
  ) {
    throw new Error(
      "Graph ID is required."
    );
  }

  if (
    viewerId === undefined ||
    viewerId === null ||
    viewerId === ""
  ) {
    throw new Error(
      "Viewer ID is required."
    );
  }

  return await apiRequest(
    `/graphs/${graphId}/view?viewerId=${encodeURIComponent(
      viewerId
    )}`,
    {
      method: "POST",
    }
  );
};


/*
 * =========================================================
 * CREATE GRAPH
 * POST /api/graphs
 * =========================================================
 */

export const createGraph = async (
  graphData
) => {

  if (!graphData) {
    throw new Error(
      "Graph data is required."
    );
  }

  return await apiRequest(
    "/graphs",
    {
      method: "POST",

      body: JSON.stringify(
        graphData
      ),
    }
  );
};


/*
 * =========================================================
 * UPDATE GRAPH
 * PUT /api/graphs/{id}
 * =========================================================
 */

export const updateGraph = async (
  graphId,
  graphData
) => {

  if (
    graphId === undefined ||
    graphId === null ||
    graphId === ""
  ) {
    throw new Error(
      "Graph ID is required."
    );
  }

  if (!graphData) {
    throw new Error(
      "Graph data is required."
    );
  }

  return await apiRequest(
    `/graphs/${graphId}`,
    {
      method: "PUT",

      body: JSON.stringify(
        graphData
      ),
    }
  );
};


/*
 * =========================================================
 * DELETE GRAPH
 * DELETE /api/graphs/{id}
 * =========================================================
 */

export const deleteGraph = async (
  graphId
) => {

  if (
    graphId === undefined ||
    graphId === null ||
    graphId === ""
  ) {
    throw new Error(
      "Graph ID is required."
    );
  }

  return await apiRequest(
    `/graphs/${graphId}`,
    {
      method: "DELETE",
    }
  );
};


/*
 * =========================================================
 * CALCULATE COMPLEXITY
 * POST /api/graphs/{id}/calculate-complexity
 * =========================================================
 */

export const calculateComplexity = async (
  graphId
) => {

  if (
    graphId === undefined ||
    graphId === null ||
    graphId === ""
  ) {
    throw new Error(
      "Graph ID is required."
    );
  }

  return await apiRequest(
    `/graphs/${graphId}/calculate-complexity`,
    {
      method: "POST",
    }
  );
};


/*
 * =========================================================
 * GET GRAPH ANALYSIS
 * GET /api/graphs/{id}/analysis
 * =========================================================
 */

export const getGraphAnalysis = async (
  graphId
) => {

  if (
    graphId === undefined ||
    graphId === null ||
    graphId === ""
  ) {
    throw new Error(
      "Graph ID is required."
    );
  }

  return await apiRequest(
    `/graphs/${graphId}/analysis`,
    {
      method: "GET",
    }
  );
};


/*
 * =========================================================
 * GET USER ACTIVITY
 * GET /api/graphs/activity?ownerId={ownerId}
 * =========================================================
 */

export const getActivity = async (
  ownerId
) => {

  if (
    ownerId === undefined ||
    ownerId === null ||
    ownerId === ""
  ) {
    throw new Error(
      "Owner ID is required."
    );
  }

  return await apiRequest(
    `/graphs/activity?ownerId=${encodeURIComponent(
      ownerId
    )}`,
    {
      method: "GET",
    }
  );
};


/*
 * =========================================================
 * GET ALL ACTIVITY
 * GET /api/graphs/activity/all
 * =========================================================
 */

export const getAllActivity = async () => {

  return await apiRequest(
    "/graphs/activity/all",
    {
      method: "GET",
    }
  );
};


/*
 * =========================================================
 * DEFAULT SERVICE OBJECT
 * =========================================================
 */

const graphService = {

  getGraphs,

  searchGraphs,

  getPublicGraphs,

  getMyGraphs,

  getGraphById,

  recordGraphView,

  createGraph,

  updateGraph,

  deleteGraph,

  calculateComplexity,

  getGraphAnalysis,

  getActivity,

  getAllActivity,

};


export default graphService;