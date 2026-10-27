import React, { useMemo, useState } from "react";


/*
 * =========================================================
 * EXPORT HUB
 * =========================================================
 *
 * Handles exporting knowledge-platform metrics.
 *
 * The SRS specifies:
 *
 * ExportHub.jsx
 * Handles exporting metrics.
 *
 * No backend export endpoint is specified, so this
 * component performs the export on the frontend.
 */


const ExportHub = ({
  metrics = {},
  graph = null,
  data = null,
}) => {

  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  /*
   * =========================================================
   * BUILD EXPORT DATA
   * =========================================================
   */

  const exportData = useMemo(() => {

    const sourceData =
      data ||
      metrics ||
      {};


    /*
     * If a graph object is supplied, include
     * its basic information as well.
     */

    if (graph) {

      return {
        graphId: graph?.id ?? null,
        graphTitle:
          graph?.title ||
          "Knowledge Graph",
        graphDescription:
          graph?.description || "",
        isPublic:
          graph?.isPublic ?? false,
        complexityScore:
          graph?.complexityScore ?? null,
        metrics: sourceData,
      };

    }


    return sourceData;

  }, [
    data,
    metrics,
    graph,
  ]);


  /*
   * =========================================================
   * DOWNLOAD FILE
   * =========================================================
   */

  const downloadFile = (
    content,
    fileName,
    mimeType
  ) => {

    const blob = new Blob(
      [content],
      {
        type: mimeType,
      }
    );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;
    link.download = fileName;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);

  };


  /*
   * =========================================================
   * EXPORT JSON
   * =========================================================
   */

  const handleExportJSON = () => {

    setMessage("");
    setError("");
    setExporting(true);


    try {

      const json =
        JSON.stringify(
          exportData,
          null,
          2
        );


      downloadFile(
        json,
        "mindmesh-metrics.json",
        "application/json"
      );


      setMessage(
        "Metrics exported successfully as JSON."
      );

    } catch (err) {

      setError(
        err?.message ||
        "Unable to export metrics."
      );

    } finally {

      setExporting(false);

    }

  };


  /*
   * =========================================================
   * EXPORT CSV
   * =========================================================
   */

  const handleExportCSV = () => {

    setMessage("");
    setError("");
    setExporting(true);


    try {

      const source =
        exportData?.metrics &&
        typeof exportData.metrics === "object"
          ? exportData.metrics
          : exportData;


      const rows = [
        ["Metric", "Value"],
      ];


      Object.entries(
        source || {}
      ).forEach(
        ([key, value]) => {

          let safeValue = value;


          if (
            typeof value === "object" &&
            value !== null
          ) {
            safeValue =
              JSON.stringify(value);
          }


          rows.push([
            key,
            String(
              safeValue ?? ""
            ),
          ]);

        }
      );


      const csv =
        rows
          .map((row) =>
            row
              .map((value) => {

                const text =
                  String(value)
                    .replace(
                      /"/g,
                      '""'
                    );

                return `"${text}"`;

              })
              .join(",")
          )
          .join("\n");


      downloadFile(
        csv,
        "mindmesh-metrics.csv",
        "text/csv;charset=utf-8"
      );


      setMessage(
        "Metrics exported successfully as CSV."
      );

    } catch (err) {

      setError(
        err?.message ||
        "Unable to export metrics."
      );

    } finally {

      setExporting(false);

    }

  };


  /*
   * =========================================================
   * NO DATA CHECK
   * =========================================================
   */

  const hasData =
    exportData &&
    typeof exportData === "object" &&
    Object.keys(exportData).length > 0;


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <section className="export-hub">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="export-hub-header">

        <div>

          <span className="section-label">
            EXPORT HUB
          </span>

          <h2>
            Export Metrics
          </h2>

          <p>
            Export knowledge graph metrics
            for reporting and analysis.
          </p>

        </div>

      </div>


      {/* =================================================
          EXPORT CARD
          ================================================= */}

      <div className="export-hub-card">

        <div className="export-hub-icon">
          ↓
        </div>


        <div className="export-hub-content">

          <h3>
            Download Metrics
          </h3>

          <p>
            Choose a format to export the
            currently available metrics.
          </p>


          {/* Data status */}

          <div className="export-hub-status">

            <span>
              Available data
            </span>

            <strong>
              {hasData
                ? "Ready"
                : "No metrics available"}
            </strong>

          </div>


          {/* Messages */}

          {message && (
            <div
              className="success-message"
              role="status"
            >
              {message}
            </div>
          )}


          {error && (
            <div
              className="error-message"
              role="alert"
            >
              {error}
            </div>
          )}


          {/* =================================================
              ACTIONS
              ================================================= */}

          <div className="export-hub-actions">

            <button
              type="button"
              className="graph-action-button"
              onClick={handleExportJSON}
              disabled={
                exporting ||
                !hasData
              }
            >
              {exporting
                ? "Exporting..."
                : "Export JSON"}
            </button>


            <button
              type="button"
              className="graph-action-button"
              onClick={handleExportCSV}
              disabled={
                exporting ||
                !hasData
              }
            >
              {exporting
                ? "Exporting..."
                : "Export CSV"}
            </button>

          </div>

        </div>

      </div>

    </section>
  );
};


export default ExportHub;