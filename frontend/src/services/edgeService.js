import apiRequest from "./api";

/*
 * =========================================================
 * EDGE SERVICE
 * =========================================================
 *
 * Handles all frontend communication with:
 *
 * /api/edges
 *
 * Backend endpoints:
 *
 * GET    /api/edges/graph/{graphId}
 * POST   /api/edges/
 * PUT    /api/edges/{edgeId}
 * DELETE /api/edges/{edgeId}
 */


/*
 * =========================================================
 * GET EDGES BY GRAPH
 * =========================================================
 *
 * GET /api/edges/graph/{graphId}
 *
 * Returns all relationships belonging
 * to the selected knowledge graph.
 */
export const getEdgesByGraph = async (graphId) => {

  if (!graphId) {
    throw new Error("Graph ID is required.");
  }

  return await apiRequest(
    `/edges/graph/${graphId}`,
    {
      method: "GET",
    }
  );
};


/*
 * =========================================================
 * CREATE EDGE
 * =========================================================
 *
 * POST /api/edges/
 *
 * Creates a relationship between two nodes.
 */
export const createEdge = async (edgeData) => {

  if (!edgeData) {
    throw new Error("Edge data is required.");
  }

  return await apiRequest(
    "/edges/",
    {
      method: "POST",

      body: JSON.stringify(edgeData),
    }
  );
};


/*
 * =========================================================
 * UPDATE EDGE
 * =========================================================
 *
 * PUT /api/edges/{edgeId}
 *
 * Updates an existing relationship.
 *
 * Example:
 * {
 *   sourceNode: { id: 1 },
 *   targetNode: { id: 2 },
 *   relationshipType: "SUPPORTS",
 *   connectionStrength: 80
 * }
 */
export const updateEdge = async (
  edgeId,
  edgeData
) => {

  if (!edgeId) {
    throw new Error("Edge ID is required.");
  }

  if (!edgeData) {
    throw new Error("Edge data is required.");
  }

  return await apiRequest(
    `/edges/${edgeId}`,
    {
      method: "PUT",

      body: JSON.stringify(edgeData),
    }
  );
};


/*
 * =========================================================
 * DELETE EDGE
 * =========================================================
 *
 * DELETE /api/edges/{edgeId}
 *
 * Deletes an existing relationship.
 */
export const deleteEdge = async (
  edgeId
) => {

  if (!edgeId) {
    throw new Error("Edge ID is required.");
  }

  return await apiRequest(
    `/edges/${edgeId}`,
    {
      method: "DELETE",
    }
  );
};


/*
 * =========================================================
 * DEFAULT SERVICE OBJECT
 * =========================================================
 */

const edgeService = {
  getEdgesByGraph,
  createEdge,
  updateEdge,
  deleteEdge,
};


export default edgeService;