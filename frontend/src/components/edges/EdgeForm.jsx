import React, {
  useEffect,
  useState,
} from "react";

import {
  getNodesByGraph,
} from "../../services/nodeService";

import {
  getEdgesByGraph,
  createEdge,
  updateEdge,
  deleteEdge,
} from "../../services/edgeService";


/*
 * =========================================================
 * EDGE FORM
 * =========================================================
 */

const EdgeForm = ({
  graphId,
  onEdgeCreated,
  nodeRefreshKey = 0,
}) => {

  /*
   * =========================================================
   * MODE
   * =========================================================
   *
   * create  -> create a new relationship
   * manage  -> edit/delete an existing relationship
   */

  const [
    mode,
    setMode,
  ] = useState("create");


  /*
   * =========================================================
   * NODES
   * =========================================================
   */

  const [
    nodes,
    setNodes,
  ] = useState([]);


  const [
    loadingNodes,
    setLoadingNodes,
  ] = useState(false);


  /*
   * =========================================================
   * EDGES
   * =========================================================
   */

  const [
    edges,
    setEdges,
  ] = useState([]);


  const [
    loadingEdges,
    setLoadingEdges,
  ] = useState(false);


  /*
   * =========================================================
   * FORM STATE
   * =========================================================
   */

  const [
    sourceNodeId,
    setSourceNodeId,
  ] = useState("");


  const [
    targetNodeId,
    setTargetNodeId,
  ] = useState("");


  const [
    relationshipType,
    setRelationshipType,
  ] = useState("RELATES_TO");


  const [
    connectionStrength,
    setConnectionStrength,
  ] = useState(1);


  /*
   * =========================================================
   * SELECTED EDGE
   * =========================================================
   */

  const [
    selectedEdgeId,
    setSelectedEdgeId,
  ] = useState("");


  /*
   * =========================================================
   * ACTION STATE
   * =========================================================
   */

  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  /*
   * =========================================================
   * LOAD NODES
   * =========================================================
   */

  const loadNodes = async () => {

    if (!graphId) {

      setNodes([]);

      return;
    }


    setLoadingNodes(true);

    setError("");


    try {

      const response =
        await getNodesByGraph(
          graphId
        );


      const graphNodes =
        Array.isArray(response)
          ? response
          : [];


      setNodes(
        graphNodes
      );

    } catch (err) {

      setError(
        err.message ||
        "Unable to load graph nodes."
      );

      setNodes([]);

    } finally {

      setLoadingNodes(false);

    }

  };


  /*
   * =========================================================
   * LOAD EDGES
   * =========================================================
   */

  const loadEdges = async () => {

    if (!graphId) {

      setEdges([]);

      return;
    }


    setLoadingEdges(true);


    try {

      const response =
        await getEdgesByGraph(
          graphId
        );


      const graphEdges =
        Array.isArray(response)
          ? response
          : [];


      setEdges(
        graphEdges
      );


    } catch (err) {

      setError(
        err.message ||
        "Unable to load relationships."
      );

      setEdges([]);

    } finally {

      setLoadingEdges(false);

    }

  };


  /*
   * =========================================================
   * LOAD DATA
   * =========================================================
   *
   * Runs when:
   *
   * - graph changes
   * - nodeRefreshKey changes
   *
   * nodeRefreshKey allows relationships to stay
   * synchronized after a node is created/deleted.
   */

  useEffect(() => {

    setMode("create");

    setSourceNodeId("");

    setTargetNodeId("");

    setSelectedEdgeId("");

    setRelationshipType(
      "RELATES_TO"
    );

    setConnectionStrength(1);

    setError("");

    setSuccess("");


    loadNodes();

    loadEdges();

  }, [
    graphId,
    nodeRefreshKey,
  ]);


  /*
   * =========================================================
   * RESET FORM
   * =========================================================
   */

  const resetForm = () => {

    setSourceNodeId("");

    setTargetNodeId("");

    setRelationshipType(
      "RELATES_TO"
    );

    setConnectionStrength(1);

  };


  /*
   * =========================================================
   * GET NODE LABEL
   * =========================================================
   */

  const getNodeLabel = (
    nodeId
  ) => {

    const node =
      nodes.find(
        (item) =>
          String(item?.id) ===
          String(nodeId)
      );


    return (
      node?.label ||
      `Node ${nodeId}`
    );

  };


  /*
   * =========================================================
   * VALIDATE CREATE / UPDATE
   * =========================================================
   */

  const validateRelationship = () => {

    if (!graphId) {

      setError(
        "Please select a knowledge graph first."
      );

      return null;
    }


    if (nodes.length < 2) {

      setError(
        "At least two concept nodes are required to create a relationship."
      );

      return null;
    }


    if (!sourceNodeId) {

      setError(
        "Please select a source node."
      );

      return null;
    }


    if (!targetNodeId) {

      setError(
        "Please select a target node."
      );

      return null;
    }


    if (
      String(sourceNodeId) ===
      String(targetNodeId)
    ) {

      setError(
        "Source and target nodes must be different."
      );

      return null;
    }


    if (!relationshipType) {

      setError(
        "Please select a relationship type."
      );

      return null;
    }


    const strength =
      Number(
        connectionStrength
      );


    if (
      !Number.isFinite(
        strength
      ) ||
      strength < 1 ||
      strength > 100
    ) {

      setError(
        "Connection strength must be between 1 and 100."
      );

      return null;
    }


    return {

      sourceNode: {
        id:
          Number(
            sourceNodeId
          ),
      },

      targetNode: {
        id:
          Number(
            targetNodeId
          ),
      },

      relationshipType,

      connectionStrength:
        strength,

    };

  };


  /*
   * =========================================================
   * CREATE RELATIONSHIP
   * =========================================================
   */

  const handleCreate =
    async () => {

      const edgeData =
        validateRelationship();


      if (!edgeData) {

        return;
      }


      setLoading(true);

      setError("");

      setSuccess("");


      try {

        const createdEdge =
          await createEdge(
            edgeData
          );


        setSuccess(
          "Relationship created successfully."
        );


        resetForm();


        await loadEdges();


        if (onEdgeCreated) {

          onEdgeCreated(
            createdEdge
          );

        }

      } catch (err) {

        setError(
          err.message ||
          "Unable to create relationship."
        );

      } finally {

        setLoading(false);

      }

    };


  /*
   * =========================================================
   * SELECT RELATIONSHIP
   * =========================================================
   */

  const handleEdgeSelection = (
    event
  ) => {

    const edgeId =
      event.target.value;


    setSelectedEdgeId(
      edgeId
    );

    setError("");

    setSuccess("");


    if (!edgeId) {

      resetForm();

      return;
    }


    const edge =
      edges.find(
        (item) =>
          String(item?.id) ===
          String(edgeId)
      );


    if (!edge) {

      resetForm();

      return;
    }


    /*
     * Read source and target IDs.
     */

    const sourceId =
      edge?.sourceNode?.id ??
      edge?.sourceNodeId;


    const targetId =
      edge?.targetNode?.id ??
      edge?.targetNodeId;


    setSourceNodeId(
      sourceId !== undefined &&
      sourceId !== null
        ? String(sourceId)
        : ""
    );


    setTargetNodeId(
      targetId !== undefined &&
      targetId !== null
        ? String(targetId)
        : ""
    );


    setRelationshipType(
      edge?.relationshipType ||
      "RELATES_TO"
    );


    setConnectionStrength(
      edge?.connectionStrength ??
      1
    );

  };


  /*
   * =========================================================
   * UPDATE RELATIONSHIP
   * =========================================================
   */

  const handleUpdate =
    async () => {

      if (!selectedEdgeId) {

        setError(
          "Please select a relationship to edit."
        );

        return;
      }


      const edgeData =
        validateRelationship();


      if (!edgeData) {

        return;
      }


      setLoading(true);

      setError("");

      setSuccess("");


      try {

        const updatedEdge =
          await updateEdge(
            selectedEdgeId,
            edgeData
          );


        setSuccess(
          "Relationship updated successfully."
        );


        await loadEdges();


        if (onEdgeCreated) {

          onEdgeCreated(
            updatedEdge
          );

        }

      } catch (err) {

        setError(
          err.message ||
          "Unable to update relationship."
        );

      } finally {

        setLoading(false);

      }

    };


  /*
   * =========================================================
   * DELETE RELATIONSHIP
   * =========================================================
   */

  const handleDelete =
    async () => {

      if (!selectedEdgeId) {

        setError(
          "Please select a relationship to delete."
        );

        return;
      }


      const selectedEdge =
        edges.find(
          (edge) =>
            String(edge?.id) ===
            String(selectedEdgeId)
        );


      const sourceId =
        selectedEdge?.sourceNode?.id ??
        selectedEdge?.sourceNodeId;


      const targetId =
        selectedEdge?.targetNode?.id ??
        selectedEdge?.targetNodeId;


      const sourceLabel =
        getNodeLabel(
          sourceId
        );


      const targetLabel =
        getNodeLabel(
          targetId
        );


      const confirmed =
        window.confirm(
          `Delete relationship "${sourceLabel} → ${targetLabel}"?`
        );


      if (!confirmed) {

        return;
      }


      setLoading(true);

      setError("");

      setSuccess("");


      try {

        await deleteEdge(
          selectedEdgeId
        );


        setSuccess(
          "Relationship deleted successfully."
        );


        setSelectedEdgeId(
          ""
        );


        resetForm();


        await loadEdges();


        if (onEdgeCreated) {

          onEdgeCreated({
            id:
              selectedEdgeId,
            deleted:
              true,
          });

        }

      } catch (err) {

        setError(
          err.message ||
          "Unable to delete relationship."
        );

      } finally {

        setLoading(false);

      }

    };


  /*
   * =========================================================
   * CREATE MODE
   * =========================================================
   */

  const handleCreateMode =
    () => {

      setMode(
        "create"
      );

      setSelectedEdgeId("");

      resetForm();

      setError("");

      setSuccess("");

    };


  /*
   * =========================================================
   * MANAGE MODE
   * =========================================================
   */

  const handleManageMode =
    () => {

      setMode(
        "manage"
      );

      setSelectedEdgeId("");

      resetForm();

      setError("");

      setSuccess("");

      loadNodes();

      loadEdges();

    };


  /*
   * =========================================================
   * NO GRAPH
   * =========================================================
   */

  if (!graphId) {

    return (

      <section className="edge-form-section">

        <div className="edge-form-header">

          <span className="section-label">

            SEMANTIC RELATIONSHIPS

          </span>


          <h2>
            Connect Concepts
          </h2>


          <p>

            Select a knowledge graph before
            creating a relationship.

          </p>

        </div>


        <div className="edge-empty-state">

          <div className="edge-empty-icon">
            ↔
          </div>


          <h3>
            No graph selected
          </h3>


          <p>

            Select a Mind Graph to connect
            its concept nodes.

          </p>

        </div>

      </section>

    );

  }


  /*
   * =========================================================
   * MAIN
   * =========================================================
   */

  return (

    <section className="edge-form-section">


      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="edge-form-header">

        <div>

          <span className="section-label">

            SEMANTIC RELATIONSHIPS

          </span>


          <h2>

            {mode === "create"
              ? "Connect Concepts"
              : "Manage Relationships"}

          </h2>


          <p>

            {mode === "create"
              ? "Create a semantic relationship between two concept nodes."
              : "Select an existing relationship to edit or delete it."}

          </p>

        </div>

      </div>


      {/* ===================================================
          MODE BUTTONS
          =================================================== */}

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >

        <button
          type="button"
          className="graph-action-button"
          onClick={
            handleCreateMode
          }
          disabled={
            loading
          }
        >

          Create Relationship

        </button>


        <button
          type="button"
          className="graph-action-button"
          onClick={
            handleManageMode
          }
          disabled={
            loading
          }
        >

          Manage Relationships

        </button>

      </div>


      {/* ===================================================
          MANAGE SELECTOR
          =================================================== */}

      {mode === "manage" && (

        <div className="form-group">

          <label htmlFor="existing-edge">

            Select Relationship

          </label>


          <select
            id="existing-edge"
            value={
              selectedEdgeId
            }
            onChange={
              handleEdgeSelection
            }
            disabled={
              loading ||
              loadingEdges
            }
          >

            <option value="">

              {loadingEdges
                ? "Loading relationships..."
                : edges.length === 0
                  ? "No relationships available"
                  : "Select relationship"}

            </option>


            {edges.map(
              (edge) => {

                const sourceId =
                  edge?.sourceNode?.id ??
                  edge?.sourceNodeId;


                const targetId =
                  edge?.targetNode?.id ??
                  edge?.targetNodeId;


                return (

                  <option
                    key={
                      edge?.id
                    }
                    value={
                      edge?.id
                    }
                  >

                    {getNodeLabel(
                      sourceId
                    )}

                    {" → "}

                    {getNodeLabel(
                      targetId
                    )}

                    {" • "}

                    {edge?.relationshipType ||
                      "RELATION"}

                  </option>

                );

              }
            )}

          </select>

        </div>

      )}


      {/* ===================================================
          FORM
          =================================================== */}

      <form
        className="edge-form"
        onSubmit={(event) => {

          event.preventDefault();


          if (
            mode === "create"
          ) {

            handleCreate();

          } else {

            handleUpdate();

          }

        }}
      >


        {/* =================================================
            SOURCE NODE
            ================================================= */}

        <div className="form-group">

          <label htmlFor="edge-source-node">

            Source Node

          </label>


          <select
            id="edge-source-node"
            value={
              sourceNodeId
            }
            onChange={(event) => {

              setSourceNodeId(
                event.target.value
              );

              setError("");

              setSuccess("");

            }}
            disabled={

              loading ||
              loadingNodes ||
              nodes.length < 2

            }
          >

            <option value="">

              {loadingNodes
                ? "Loading nodes..."
                : nodes.length < 2
                  ? "At least 2 nodes required"
                  : "Select source node"}

            </option>


            {nodes.map(
              (node) => (

                <option
                  key={
                    node?.id
                  }
                  value={
                    node?.id
                  }
                >

                  {node?.label ||
                    `Node ${node?.id}`}

                </option>

              )
            )}

          </select>

        </div>


        {/* =================================================
            TARGET NODE
            ================================================= */}

        <div className="form-group">

          <label htmlFor="edge-target-node">

            Target Node

          </label>


          <select
            id="edge-target-node"
            value={
              targetNodeId
            }
            onChange={(event) => {

              setTargetNodeId(
                event.target.value
              );

              setError("");

              setSuccess("");

            }}
            disabled={

              loading ||
              loadingNodes ||
              nodes.length < 2

            }
          >

            <option value="">

              {loadingNodes
                ? "Loading nodes..."
                : nodes.length < 2
                  ? "At least 2 nodes required"
                  : "Select target node"}

            </option>


            {nodes.map(
              (node) => (

                <option
                  key={
                    node?.id
                  }
                  value={
                    node?.id
                  }
                >

                  {node?.label ||
                    `Node ${node?.id}`}

                </option>

              )
            )}

          </select>

        </div>


        {/* =================================================
            RELATIONSHIP TYPE
            ================================================= */}

        <div className="form-group">

          <label htmlFor="relationship-type">

            Relationship Type

          </label>


          <select
            id="relationship-type"
            value={
              relationshipType
            }
            onChange={(event) => {

              setRelationshipType(
                event.target.value
              );

              setError("");

              setSuccess("");

            }}
            disabled={
              loading
            }
          >

            <option value="RELATES_TO">
              RELATES_TO
            </option>

            <option value="DEPENDS_ON">
              DEPENDS_ON
            </option>

            <option value="CONTRADICTS">
              CONTRADICTS
            </option>

            <option value="SUPPORTS">
              SUPPORTS
            </option>

          </select>

        </div>


        {/* =================================================
            CONNECTION STRENGTH
            ================================================= */}

        <div className="form-group">

          <label htmlFor="connection-strength">

            Connection Strength

          </label>


          <input
            id="connection-strength"
            type="number"
            min="1"
            max="100"
            step="1"
            value={
              connectionStrength
            }
            onChange={(event) => {

              setConnectionStrength(
                event.target.value
              );

              setError("");

              setSuccess("");

            }}
            disabled={
              loading
            }
          />

        </div>


        {/* =================================================
            ERROR
            ================================================= */}

        {error && (

          <div
            className="error-message"
            role="alert"
          >

            {error}

          </div>

        )}


        {/* =================================================
            SUCCESS
            ================================================= */}

        {success && (

          <div
            className="success-message"
            role="status"
          >

            {success}

          </div>

        )}


        {/* =================================================
            ACTION BUTTONS
            ================================================= */}

        {mode === "create" ? (

          <button
            type="submit"
            className="login-button"
            disabled={

              loading ||
              loadingNodes ||
              nodes.length < 2

            }
          >

            {loading
              ? "Creating Relationship..."
              : "Create Relationship"}

          </button>

        ) : (

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >

            <button
              type="submit"
              className="login-button"
              disabled={

                loading ||
                loadingNodes ||
                loadingEdges ||
                !selectedEdgeId ||
                nodes.length < 2

              }
            >

              {loading
                ? "Saving Changes..."
                : "Save Changes"}

            </button>


            <button
              type="button"
              className="login-button"
              disabled={

                loading ||
                loadingEdges ||
                !selectedEdgeId

              }
              onClick={
                handleDelete
              }
              style={{
                background:
                  "#dc2626",
              }}
            >

              {loading
                ? "Processing..."
                : "Delete Relationship"}

            </button>

          </div>

        )}


        {/* =================================================
            HELP TEXT
            ================================================= */}

        {mode === "create" &&
          !loadingNodes &&
          nodes.length < 2 && (

            <p className="form-help-text">

              At least two concept nodes are
              required to create a relationship.

            </p>

          )}


        {mode === "create" &&
          !loadingNodes &&
          nodes.length >= 2 && (

            <p className="form-help-text">

              {nodes.length} concept nodes
              available for connection.

            </p>

          )}


        {mode === "manage" &&
          !loadingEdges &&
          edges.length === 0 && (

            <p className="form-help-text">

              No relationships exist in this graph yet.

            </p>

          )}


        {mode === "manage" &&
          !loadingEdges &&
          edges.length > 0 &&
          !selectedEdgeId && (

            <p className="form-help-text">

              Select a relationship above to edit
              or delete it.

            </p>

          )}

      </form>

    </section>

  );

};


export default EdgeForm;