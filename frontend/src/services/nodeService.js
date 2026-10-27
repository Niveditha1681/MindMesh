import apiRequest from "./api";

/*
 * =========================================================
 * NODE SERVICE
 * =========================================================
 *
 * Handles all frontend communication with:
 *
 * /api/nodes
 *
 * Backend Controller:
 * NodeController
 */


/*
 * =========================================================
 * GET NODES BY GRAPH
 * =========================================================
 *
 * GET /api/nodes/graph/{graphId}
 *
 * Returns all ConceptNode objects belonging
 * to the selected knowledge graph.
 */
export const getNodesByGraph = async (graphId) => {

  if (!graphId) {
    throw new Error("Graph ID is required.");
  }

  return await apiRequest(
    `/nodes/graph/${graphId}`,
    {
      method: "GET",
    }
  );
};


/*
 * =========================================================
 * CREATE NODE
 * =========================================================
 *
 * POST /api/nodes/{graphId}
 *
 * The backend finds the graph using graphId
 * and automatically associates the node with it.
 */
export const createNode = async (
  graphId,
  nodeData
) => {

  if (!graphId) {
    throw new Error("Graph ID is required.");
  }

  if (!nodeData) {
    throw new Error("Node data is required.");
  }

  return await apiRequest(
    `/nodes/${graphId}`,
    {
      method: "POST",

      body: JSON.stringify(nodeData),
    }
  );
};


/*
 * =========================================================
 * UPDATE NODE
 * =========================================================
 *
 * PUT /api/nodes/{nodeId}
 *
 * Updates an existing ConceptNode.
 *
 * Example:
 * {
 *   label: "Updated Node",
 *   contentType: "TEXT",
 *   rawContent: "Updated content",
 *   xCoordinate: 250,
 *   yCoordinate: 180,
 *   colorHex: "#4F46E5"
 * }
 */
export const updateNode = async (
  nodeId,
  nodeData
) => {

  if (!nodeId) {
    throw new Error("Node ID is required.");
  }

  if (!nodeData) {
    throw new Error("Node data is required.");
  }

  return await apiRequest(
    `/nodes/${nodeId}`,
    {
      method: "PUT",

      body: JSON.stringify(nodeData),
    }
  );
};


/*
 * =========================================================
 * DELETE NODE
 * =========================================================
 *
 * DELETE /api/nodes/{nodeId}
 *
 * Deletes an existing ConceptNode.
 *
 * Backend is responsible for removing
 * related semantic edges before deleting
 * the node.
 */
export const deleteNode = async (
  nodeId
) => {

  if (!nodeId) {
    throw new Error("Node ID is required.");
  }

  return await apiRequest(
    `/nodes/${nodeId}`,
    {
      method: "DELETE",
    }
  );
};


/*
 * =========================================================
 * UPDATE NODE POSITION
 * =========================================================
 *
 * PUT /api/nodes/{nodeId}/position
 *
 * Used when a user drags a node around
 * the graph canvas.
 *
 * Only X and Y coordinates are sent.
 *
 * Example:
 * {
 *   xCoordinate: 350,
 *   yCoordinate: 220
 * }
 */
export const updateNodePosition = async (
  nodeId,
  xCoordinate,
  yCoordinate
) => {

  if (!nodeId) {
    throw new Error("Node ID is required.");
  }

  if (
    xCoordinate === undefined ||
    xCoordinate === null
  ) {
    throw new Error("X coordinate is required.");
  }

  if (
    yCoordinate === undefined ||
    yCoordinate === null
  ) {
    throw new Error("Y coordinate is required.");
  }

  return await apiRequest(
    `/nodes/${nodeId}/position`,
    {
      method: "PUT",

      body: JSON.stringify({
        xCoordinate,
        yCoordinate,
      }),
    }
  );
};


/*
 * =========================================================
 * VALIDATE NODE LAYOUT
 * =========================================================
 *
 * POST /api/nodes/validate-layout/{graphId}
 *
 * Triggers backend layout validation.
 */
export const validateNodeLayout = async (
  graphId
) => {

  if (!graphId) {
    throw new Error("Graph ID is required.");
  }

  return await apiRequest(
    `/nodes/validate-layout/${graphId}`,
    {
      method: "POST",
    }
  );
};


/*
 * =========================================================
 * DEFAULT SERVICE OBJECT
 * =========================================================
 */

const nodeService = {
  getNodesByGraph,
  createNode,
  updateNode,
  deleteNode,
  updateNodePosition,
  validateNodeLayout,
};


export default nodeService;