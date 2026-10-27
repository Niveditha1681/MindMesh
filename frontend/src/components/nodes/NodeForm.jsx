import React, {
  useEffect,
  useState,
} from "react";

import {
  useSelector,
} from "react-redux";

import {
  createNode,
  getNodesByGraph,
  updateNode,
  deleteNode,
} from "../../services/nodeService";


/*
 * =========================================================
 * ROLE NORMALIZATION
 * =========================================================
 */

const normalizeRole = (role) => {

  return String(role || "")
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

};


/*
 * =========================================================
 * NODE FORM
 * =========================================================
 */

const NodeForm = ({
  graphId,
  onNodeCreated,
}) => {

  /*
   * =========================================================
   * AUTHENTICATED USER
   * =========================================================
   */

  const currentUser =
    useSelector(
      (state) =>
        state?.auth?.user
    );


  const userRole =
    normalizeRole(
      currentUser?.role
    );


  /*
   * Knowledge Architect and Research Strategist
   * can edit/delete nodes.
   *
   * VIEW_ANALYST does not normally reach Workspace,
   * but keeping this protection here is useful.
   */

  const canManageNodes =
    userRole ===
      "KNOWLEDGE_ARCHITECT" ||
    userRole ===
      "RESEARCH_STRATEGIST" ||
    userRole ===
      "ADMIN";


  /*
   * =========================================================
   * MODE
   * =========================================================
   */

  const [
    mode,
    setMode,
  ] = useState("create");


  /*
   * =========================================================
   * EXISTING NODES
   * =========================================================
   */

  const [
    nodes,
    setNodes,
  ] = useState([]);


  const [
    nodesLoading,
    setNodesLoading,
  ] = useState(false);


  const [
    selectedNodeId,
    setSelectedNodeId,
  ] = useState("");


  /*
   * =========================================================
   * FORM STATE
   * =========================================================
   */

  const [
    label,
    setLabel,
  ] = useState("");


  const [
    contentType,
    setContentType,
  ] = useState("TEXT");


  const [
    rawContent,
    setRawContent,
  ] = useState("");


  const [
    xCoordinate,
    setXCoordinate,
  ] = useState("");


  const [
    yCoordinate,
    setYCoordinate,
  ] = useState("");


  const [
    colorHex,
    setColorHex,
  ] = useState("#2563eb");


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


    setNodesLoading(true);

    setError("");


    try {

      const response =
        await getNodesByGraph(
          graphId
        );


      const loadedNodes =
        Array.isArray(response)
          ? response
          : [];


      /*
       * Normalize coordinate property names.
       *
       * Backend responses may expose:
       *
       * xCoordinate
       * xcoordinate
       *
       * yCoordinate
       * ycoordinate
       */

      const normalizedNodes =
        loadedNodes.map(
          (node) => ({

            ...node,

            xCoordinate:
              node?.xCoordinate ??
              node?.xcoordinate ??
              40,

            yCoordinate:
              node?.yCoordinate ??
              node?.ycoordinate ??
              40,

          })
        );


      setNodes(
        normalizedNodes
      );


      /*
       * If currently selected node no longer exists,
       * clear the selection.
       */

      setSelectedNodeId(
        (previousId) => {

          if (!previousId) {
            return "";
          }


          const exists =
            normalizedNodes.some(
              (node) =>
                String(node?.id) ===
                String(previousId)
            );


          return exists
            ? previousId
            : "";

        }
      );


    } catch (err) {

      setError(
        err.message ||
        "Unable to load existing nodes."
      );

      setNodes([]);

    } finally {

      setNodesLoading(false);

    }

  };


  /*
   * =========================================================
   * INITIAL NODE LOAD
   * =========================================================
   */

  useEffect(() => {

    setMode("create");

    setSelectedNodeId("");

    setError("");

    setSuccess("");

    loadNodes();

  }, [
    graphId,
  ]);


  /*
   * =========================================================
   * RESET FORM
   * =========================================================
   */

  const resetForm = () => {

    setLabel("");

    setContentType("TEXT");

    setRawContent("");

    setXCoordinate("");

    setYCoordinate("");

    setColorHex("#2563eb");

  };


  /*
   * =========================================================
   * SELECT NODE FOR EDITING
   * =========================================================
   */

  const handleNodeSelection = (
    event
  ) => {

    const nodeId =
      event.target.value;


    setSelectedNodeId(
      nodeId
    );


    setError("");

    setSuccess("");


    if (!nodeId) {

      resetForm();

      return;

    }


    const node =
      nodes.find(
        (item) =>
          String(item?.id) ===
          String(nodeId)
      );


    if (!node) {

      resetForm();

      return;

    }


    /*
     * Load selected node into form.
     */

    setLabel(
      node?.label ||
      ""
    );


    setContentType(
      node?.contentType ||
      "TEXT"
    );


    setRawContent(
      node?.rawContent ||
      ""
    );


    setXCoordinate(
      node?.xCoordinate ??
      node?.xcoordinate ??
      ""
    );


    setYCoordinate(
      node?.yCoordinate ??
      node?.ycoordinate ??
      ""
    );


    setColorHex(
      /^#[0-9A-Fa-f]{6}$/.test(
        node?.colorHex ||
        ""
      )
        ? node.colorHex
        : "#2563eb"
    );

  };


  /*
   * =========================================================
   * VALIDATE FORM
   * =========================================================
   */

  const validateForm = () => {

    if (!graphId) {

      setError(
        "Please select a knowledge graph first."
      );

      return null;

    }


    if (!label.trim()) {

      setError(
        "Node label is required."
      );

      return null;

    }


    if (
      xCoordinate === "" ||
      yCoordinate === ""
    ) {

      setError(
        "X and Y coordinates are required."
      );

      return null;

    }


    const x =
      Number(
        xCoordinate
      );


    const y =
      Number(
        yCoordinate
      );


    if (
      !Number.isFinite(x)
    ) {

      setError(
        "X coordinate must be a valid number."
      );

      return null;

    }


    if (
      !Number.isFinite(y)
    ) {

      setError(
        "Y coordinate must be a valid number."
      );

      return null;

    }


    const validHex =
      /^#[0-9A-Fa-f]{6}$/;


    if (
      !validHex.test(
        colorHex
      )
    ) {

      setError(
        "Color must be a valid hexadecimal color."
      );

      return null;

    }


    return {

      label:
        label.trim(),

      contentType:
        contentType,

      rawContent:
        rawContent.trim(),

      xCoordinate:
        x,

      yCoordinate:
        y,

      colorHex:
        colorHex,

    };

  };


  /*
   * =========================================================
   * CREATE NODE
   * =========================================================
   */

  const handleCreate =
    async () => {

      const nodeData =
        validateForm();


      if (!nodeData) {
        return;
      }


      setLoading(true);

      setError("");

      setSuccess("");


      try {

        const createdNode =
          await createNode(
            graphId,
            nodeData
          );


        setSuccess(
          "Concept node created successfully."
        );


        resetForm();


        /*
         * Reload local node list so the new
         * node appears immediately in Manage Nodes.
         */

        await loadNodes();


        /*
         * Notify Workspace.
         *
         * App.js already uses this callback
         * to refresh GraphCanvas.
         */

        if (
          onNodeCreated
        ) {

          onNodeCreated(
            createdNode
          );

        }


      } catch (err) {

        setError(
          err.message ||
          "Unable to create concept node."
        );

      } finally {

        setLoading(false);

      }

    };


  /*
   * =========================================================
   * UPDATE NODE
   * =========================================================
   */

  const handleUpdate =
    async () => {

      if (!canManageNodes) {

        setError(
          "You do not have permission to edit nodes."
        );

        return;

      }


      if (!selectedNodeId) {

        setError(
          "Please select a node to edit."
        );

        return;

      }


      const nodeData =
        validateForm();


      if (!nodeData) {
        return;
      }


      setLoading(true);

      setError("");

      setSuccess("");


      try {

        await updateNode(
          selectedNodeId,
          nodeData
        );


        setSuccess(
          "Concept node updated successfully."
        );


        await loadNodes();


        /*
         * Notify Workspace so canvas,
         * relationships and analysis refresh.
         */

        if (
          onNodeCreated
        ) {

          onNodeCreated({
            id:
              selectedNodeId,
            ...nodeData,
          });

        }


      } catch (err) {

        setError(
          err.message ||
          "Unable to update concept node."
        );

      } finally {

        setLoading(false);

      }

    };


  /*
   * =========================================================
   * DELETE NODE
   * =========================================================
   */

  const handleDelete =
    async () => {

      if (!canManageNodes) {

        setError(
          "You do not have permission to delete nodes."
        );

        return;

      }


      if (!selectedNodeId) {

        setError(
          "Please select a node to delete."
        );

        return;

      }


      const selectedNode =
        nodes.find(
          (node) =>
            String(node?.id) ===
            String(selectedNodeId)
        );


      const nodeLabel =
        selectedNode?.label ||
        `Node ${selectedNodeId}`;


      const confirmed =
        window.confirm(
          `Delete "${nodeLabel}"?\n\nAny relationships connected to this node will also be removed.`
        );


      if (!confirmed) {

        return;

      }


      setLoading(true);

      setError("");

      setSuccess("");


      try {

        await deleteNode(
          selectedNodeId
        );


        setSuccess(
          "Concept node deleted successfully."
        );


        setSelectedNodeId(
          ""
        );


        resetForm();


        await loadNodes();


        /*
         * Notify Workspace.
         *
         * Backend already removes related edges
         * and recalculates complexity.
         */

        if (
          onNodeCreated
        ) {

          onNodeCreated({
            id:
              selectedNodeId,
            deleted:
              true,
          });

        }


      } catch (err) {

        setError(
          err.message ||
          "Unable to delete concept node."
        );

      } finally {

        setLoading(false);

      }

    };


  /*
   * =========================================================
   * SWITCH TO CREATE
   * =========================================================
   */

  const handleCreateMode =
    () => {

      setMode("create");

      setSelectedNodeId("");

      resetForm();

      setError("");

      setSuccess("");

    };


  /*
   * =========================================================
   * SWITCH TO MANAGE
   * =========================================================
   */

  const handleManageMode =
    () => {

      setMode("manage");

      setError("");

      setSuccess("");

      setSelectedNodeId("");

      resetForm();

      loadNodes();

    };


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <section className="node-form-section">


      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="node-form-header">

        <span className="section-label">
          GRAPH BUILDER
        </span>


        <h2>
          {mode === "create"
            ? "Add Concept Node"
            : "Manage Concept Nodes"}
        </h2>


        <p>

          {mode === "create"
            ? "Add a concept to your knowledge graph and define its position and content."
            : "Select an existing concept node to edit or delete it."}

        </p>

      </div>


      {/* ===================================================
          MODE SWITCH
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

          Create Node

        </button>


        {canManageNodes && (

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

            Manage Nodes

          </button>

        )}

      </div>


      {/* ===================================================
          MANAGE NODE SELECTOR
          =================================================== */}

      {mode === "manage" && (

        <div className="form-group">

          <label htmlFor="existing-node">

            Select Node

          </label>


          <select
            id="existing-node"
            value={
              selectedNodeId
            }
            onChange={
              handleNodeSelection
            }
            disabled={
              loading ||
              nodesLoading
            }
          >

            <option value="">

              {nodesLoading
                ? "Loading nodes..."
                : nodes.length === 0
                  ? "No nodes available"
                  : "Select a node"}

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

      )}


      {/* ===================================================
          FORM
          =================================================== */}

      <form
        className="node-form"
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
            LABEL
            ================================================= */}

        <div className="form-group">

          <label htmlFor="node-label">

            Node Label

          </label>


          <input
            id="node-label"
            name="label"
            type="text"
            placeholder="Enter concept label"
            value={
              label
            }
            onChange={(event) => {

              setLabel(
                event.target.value
              );

              setError("");

              setSuccess("");

            }}
            disabled={
              mode === "manage" &&
              !selectedNodeId
            }
          />

        </div>


        {/* =================================================
            CONTENT TYPE
            ================================================= */}

        <div className="form-group">

          <label htmlFor="node-content-type">

            Content Type

          </label>


          <select
            id="node-content-type"
            name="contentType"
            value={
              contentType
            }
            onChange={(event) => {

              setContentType(
                event.target.value
              );

              setError("");

              setSuccess("");

            }}
            disabled={
              mode === "manage" &&
              !selectedNodeId
            }
          >

            <option value="TEXT">
              TEXT
            </option>

            <option value="IMAGE">
              IMAGE
            </option>

            <option value="URL">
              URL
            </option>

          </select>

        </div>


        {/* =================================================
            RAW CONTENT
            ================================================= */}

        <div className="form-group">

          <label htmlFor="node-raw-content">

            Content

          </label>


          <textarea
            id="node-raw-content"
            name="rawContent"
            placeholder={
              contentType === "URL"
                ? "Enter URL"
                : contentType === "IMAGE"
                  ? "Enter image URL"
                  : "Enter node content"
            }
            value={
              rawContent
            }
            onChange={(event) => {

              setRawContent(
                event.target.value
              );

              setError("");

              setSuccess("");

            }}
            rows={4}
            disabled={
              mode === "manage" &&
              !selectedNodeId
            }
          />

        </div>


        {/* =================================================
            POSITION
            ================================================= */}

        <div className="node-coordinate-row">

          <div className="form-group">

            <label htmlFor="node-x">

              X Coordinate

            </label>


            <input
              id="node-x"
              name="xCoordinate"
              type="number"
              step="any"
              placeholder="0"
              value={
                xCoordinate
              }
              onChange={(event) => {

                setXCoordinate(
                  event.target.value
                );

                setError("");

                setSuccess("");

              }}
              disabled={
                mode === "manage" &&
                !selectedNodeId
              }
            />

          </div>


          <div className="form-group">

            <label htmlFor="node-y">

              Y Coordinate

            </label>


            <input
              id="node-y"
              name="yCoordinate"
              type="number"
              step="any"
              placeholder="0"
              value={
                yCoordinate
              }
              onChange={(event) => {

                setYCoordinate(
                  event.target.value
                );

                setError("");

                setSuccess("");

              }}
              disabled={
                mode === "manage" &&
                !selectedNodeId
              }
            />

          </div>

        </div>


        {/* =================================================
            COLOR
            ================================================= */}

        <div className="form-group">

          <label htmlFor="node-color">

            Node Color

          </label>


          <div className="node-color-control">

            <input
              id="node-color"
              name="colorHex"
              type="color"
              value={
                /^#[0-9A-Fa-f]{6}$/.test(
                  colorHex
                )
                  ? colorHex
                  : "#2563eb"
              }
              onChange={(event) => {

                setColorHex(
                  event.target.value
                );

                setError("");

                setSuccess("");

              }}
              disabled={
                mode === "manage" &&
                !selectedNodeId
              }
            />


            <input
              type="text"
              value={
                colorHex
              }
              maxLength={7}
              placeholder="#2563eb"
              onChange={(event) => {

                setColorHex(
                  event.target.value
                );

                setError("");

                setSuccess("");

              }}
              disabled={
                mode === "manage" &&
                !selectedNodeId
              }
            />

          </div>

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
            ACTIONS
            ================================================= */}

        {mode === "create" ? (

          <button
            type="submit"
            className="login-button"
            disabled={
              loading
            }
          >

            {loading
              ? "Creating Node..."
              : "Add Concept Node"}

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
                nodesLoading ||
                !selectedNodeId
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
                nodesLoading ||
                !selectedNodeId
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
                : "Delete Node"}

            </button>

          </div>

        )}


        {/* =================================================
            MANAGE MODE INFORMATION
            ================================================= */}

        {mode === "manage" &&
          !nodesLoading &&
          nodes.length === 0 && (

            <p className="form-help-text">

              No concept nodes exist in this graph yet.

            </p>

          )}


        {mode === "manage" &&
          !nodesLoading &&
          nodes.length > 0 &&
          !selectedNodeId && (

            <p className="form-help-text">

              Select a concept node above to edit
              or delete it.

            </p>

          )}

      </form>

    </section>

  );

};


export default NodeForm;