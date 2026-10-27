import React, {
  useContext,
  useState,
} from "react";
import "./GraphForm.css";
import {
  ReactReduxContext,
} from "react-redux";

import * as graphServiceModule
  from "../../services/graphService";


/*
 * =========================================================
 * GRAPH SERVICE
 * =========================================================
 */

const graphService =
  graphServiceModule?.default ||
  graphServiceModule;


/*
 * =========================================================
 * GRAPH FORM
 * =========================================================
 */

const GraphForm = ({
  onGraphCreated,
}) => {

  /*
   * =======================================================
   * OPTIONAL REDUX CONTEXT
   * =======================================================
   */

  const reduxContext =
    useContext(ReactReduxContext);

  const reduxStore =
    reduxContext?.store || null;

  const reduxState =
    typeof reduxStore?.getState === "function"
      ? reduxStore.getState()
      : null;

  const reduxUser =
    reduxState?.auth?.user || null;


  /*
   * =======================================================
   * USER
   * =======================================================
   */

  let user = reduxUser;


  /*
   * Fallback to localStorage.
   */

  if (!user) {

    try {

      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {

        user =
          JSON.parse(storedUser);

      }

    } catch (storageError) {

      user = null;

    }

  }


  /*
   * =======================================================
   * FORM STATE
   * =======================================================
   */

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
  ] = useState(false);


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
   * =======================================================
   * SUBMIT HANDLER
   * =======================================================
   */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    /*
     * Clear previous messages.
     */

    setError("");
    setSuccess("");


    /*
     * Validate title.
     */

    if (!title.trim()) {

      setError(
        "Graph title is required."
      );

      return;

    }


    /*
     * =====================================================
     * BUILD GRAPH DATA
     * =====================================================
     */

    const graphData = {

      title:
        title.trim(),

      description:
        description.trim(),

      isPublic:
        Boolean(isPublic),

    };


    /*
     * =====================================================
     * ADD OWNER
     * =====================================================
     */

    const ownerId =

      user?.id ??

      user?.userId ??

      user?.ownerId;


    if (

      ownerId !== undefined &&

      ownerId !== null

    ) {

      graphData.owner = {

        id:
          ownerId,

      };

    }


    /*
     * =====================================================
     * START LOADING
     * =====================================================
     */

    setLoading(true);


    try {

      /*
       * ===================================================
       * GET CREATE GRAPH FUNCTION
       * ===================================================
       */

      const createGraph =

        graphService?.createGraph ||

        graphServiceModule?.createGraph;


      /*
       * Validate service.
       */

      if (

        typeof createGraph !==
        "function"

      ) {

        throw new Error(
          "createGraph service is unavailable."
        );

      }


      /*
       * ===================================================
       * CREATE GRAPH
       * ===================================================
       */

      const createdGraph =

        await createGraph(
          graphData
        );


      /*
       * ===================================================
       * SUCCESS
       * ===================================================
       */

      setSuccess(
        "KnowledgeGraph created successfully."
      );

      setError("");


      /*
       * Reset form.
       */

      setTitle("");

      setDescription("");

      setIsPublic(false);


      /*
       * ===================================================
       * CALLBACK
       * ===================================================
       */

      if (

        typeof onGraphCreated ===
        "function"

      ) {

        try {

          onGraphCreated(
            createdGraph
          );

        } catch (callbackError) {

          /*
           * Graph creation was successful.
           * Ignore optional callback errors.
           */

        }

      }


    } catch (requestError) {

      console.error(
        "Graph creation error:",
        requestError
      );


      /*
       * ===================================================
       * ERROR
       * ===================================================
       */

      setError(
        "Unable to save KnowledgeGraph."
      );

      setSuccess("");


    } finally {

      /*
       * Always stop loading.
       */

      setLoading(false);

    }

  };


  /*
   * =======================================================
   * UI
   * =======================================================
   */

  return (

    <section
      className="graph-form-section"
      aria-label="Create Knowledge Graph"
    >


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="graph-form-header">

        <span className="section-label">

          KNOWLEDGE WORKSPACE

        </span>


        <h2>

          Create Knowledge Graph

        </h2>


        <p>

          Define the core information for your
          new knowledge graph.

        </p>

      </div>


      {/* ===================================================
          FORM
      =================================================== */}

      <form
        onSubmit={handleSubmit}
        className="graph-form"
      >


        {/* =================================================
            TITLE
        ================================================= */}

        <div className="form-group">

          <label
            htmlFor="graph-title"
          >

            Mesh Title

          </label>


          <input
            id="graph-title"
            name="title"
            type="text"
            placeholder="Enter KnowledgeGraph title"
            value={title}
            onChange={(event) => {

              setTitle(
                event.target.value
              );

              setError("");
              setSuccess("");

            }}
            required
          />

        </div>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <div className="form-group">

          <label
            htmlFor="graph-description"
          >

            Description

          </label>


          <textarea
            id="graph-description"
            name="description"
            placeholder="Describe your knowledge graph"
            value={description}
            onChange={(event) => {

              setDescription(
                event.target.value
              );

              setError("");
              setSuccess("");

            }}
          />

        </div>


        {/* =================================================
            PUBLIC OPTION
        ================================================= */}

        <div className="form-group public-option">

          <label
            htmlFor="graph-public"
            className="checkbox-label"
          >

            <input
              id="graph-public"
              name="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={(event) => {

                setIsPublic(
                  event.target.checked
                );

                setError("");
                setSuccess("");

              }}
            />


            <span>

              Make this graph public

            </span>

          </label>


          <p className="public-description">

            Public graphs can be viewed through
            the platform's public graph functionality.

          </p>

        </div>


        {/* =================================================
            ERROR MESSAGE
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
            SUCCESS MESSAGE
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
            SUBMIT BUTTON
        ================================================= */}

        <button
          type="submit"
          className="graph-submit-button"
          disabled={loading}
        >

          {loading
            ? "Creating Graph..."
            : "Create Graph"}

        </button>


      </form>


    </section>

  );

};


export default GraphForm;