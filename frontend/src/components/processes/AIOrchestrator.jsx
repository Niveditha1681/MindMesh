import React, { useState } from "react";


/*
 * =========================================================
 * AI ORCHESTRATOR
 * =========================================================
 *
 * Purpose:
 * Manages automated semantic link generation.
 *
 * The component intentionally does not assume a backend
 * endpoint because the SRS does not define one.
 *
 * Parent components can provide:
 *
 * onGenerate(graphId)
 *
 * and handle the actual backend/AI operation.
 */


const AIOrchestrator = ({
  graphId = null,
  onGenerate = null,
  disabled = false,
}) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  /*
   * =========================================================
   * GENERATE SEMANTIC LINKS
   * =========================================================
   */

  const handleGenerate = async () => {

    setError("");
    setSuccess("");


    /*
     * A graph is required for semantic link generation.
     */

    if (!graphId) {
      setError(
        "Please select a knowledge graph first."
      );
      return;
    }


    /*
     * If the parent has not supplied the actual
     * generation operation, don't invent an API call.
     */

    if (!onGenerate) {
      setError(
        "Semantic link generation is not configured yet."
      );
      return;
    }


    setLoading(true);


    try {

      await onGenerate(graphId);

      setSuccess(
        "Semantic links generated successfully."
      );

    } catch (err) {

      setError(
        err?.message ||
        "Unable to generate semantic links."
      );

    } finally {

      setLoading(false);

    }
  };


  /*
   * =========================================================
   * CLEAR MESSAGES
   * =========================================================
   */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <section className="ai-orchestrator">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="ai-orchestrator-header">

        <div>

          <span className="section-label">
            AI ORCHESTRATOR
          </span>

          <h2>
            Semantic Link Generation
          </h2>

          <p>
            Automatically identify meaningful
            semantic relationships between
            concepts in your knowledge graph.
          </p>

        </div>

      </div>


      {/* =================================================
          CONTROL CARD
          ================================================= */}

      <div className="ai-orchestrator-card">

        <div className="ai-orchestrator-icon">
          ✦
        </div>


        <div className="ai-orchestrator-content">

          <h3>
            Generate Semantic Links
          </h3>

          <p>
            Let the AI orchestrator analyze
            connected concepts and suggest
            meaningful relationships.
          </p>


          {/* Graph status */}

          <div className="ai-orchestrator-status">

            <span className="ai-orchestrator-status-label">
              Selected Graph
            </span>

            <span className="ai-orchestrator-status-value">
              {graphId
                ? `Graph ${graphId}`
                : "No graph selected"}
            </span>

          </div>


          {/* Error */}

          {error && (
            <div
              className="error-message"
              role="alert"
            >
              {error}
            </div>
          )}


          {/* Success */}

          {success && (
            <div
              className="success-message"
              role="status"
            >
              {success}
            </div>
          )}


          {/* Action */}

          <button
            type="button"
            className="graph-action-button ai-orchestrator-button"
            disabled={
              disabled ||
              loading
            }
            onClick={() => {

              clearMessages();

              handleGenerate();

            }}
          >
            {loading
              ? "Generating Links..."
              : "Generate Semantic Links"}
          </button>

        </div>

      </div>

    </section>
  );
};


export default AIOrchestrator;