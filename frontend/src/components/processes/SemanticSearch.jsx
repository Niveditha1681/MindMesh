import React, { useState } from "react";

import {
  searchGraphs,
} from "../../services/graphService";


const SemanticSearch = () => {

  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState([]);

  const [searched, setSearched] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);


  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const handleSearch = async () => {

    const searchText =
      query.trim();


    /*
     * Empty search
     */

    if (!searchText) {

      setResults([]);

      setSearched(false);

      setError(null);

      return;

    }


    try {

      setLoading(true);

      setError(null);


      console.log(
        "Searching backend for:",
        searchText
      );


      /*
       * CALL BACKEND
       */

      const response =
        await searchGraphs(
          searchText
        );


      console.log(
        "Backend search response:",
        response
      );


      /*
       * HANDLE RESPONSE
       */

      const searchResults =
        Array.isArray(response)
          ? response
          : (
              response?.data ||
              response?.content ||
              []
            );


      setResults(
        Array.isArray(searchResults)
          ? searchResults
          : []
      );


      setSearched(true);

    } catch (error) {

      console.error(
        "Backend search error:",
        error
      );


      setError(
        error?.message ||
        "Failed to search knowledge meshes."
      );


      setResults([]);

      setSearched(true);

    } finally {

      setLoading(false);

    }

  };


  /*
   * =========================================================
   * ENTER KEY
   * =========================================================
   */

  const handleKeyDown = (
    event
  ) => {

    if (
      event.key === "Enter"
    ) {

      handleSearch();

    }

  };


  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (

    <div className="semantic-page">


      <div className="semantic-card">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="semantic-header">

          <h1>
            Deep Semantic Search
          </h1>

          <p>
            Find relevant concepts across the entire knowledge network.
          </p>

        </div>


        {/* =================================================
            SEARCH BAR
        ================================================= */}

        <div className="semantic-search-bar">

          <input
            type="text"
            placeholder="Search..."
            value={query}

            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }

            onKeyDown={
              handleKeyDown
            }
          />


          <button
            onClick={handleSearch}
            disabled={loading}
          >

            {loading
              ? "Searching..."
              : "Deep Search"}

          </button>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="semantic-error">

            {error}

          </div>

        )}


        {/* =================================================
            RESULTS
        ================================================= */}

        {searched && !loading && (

          <div className="semantic-results">


            <h2>

              Search Results ({results.length})

            </h2>


            {/* =============================================
                RESULTS FOUND
            ============================================= */}

            {results.length > 0 ? (

              <div className="results-list">


                {results.map((graph) => (

                  <div
                    className="semantic-result-item"
                    key={graph.id}
                  >


                    {/* =====================================
                        GRAPH HEADER
                    ===================================== */}

                    <div className="result-header">

                      <div>

                        <h3>

                          {graph.title ||
                            "Untitled Knowledge Mesh"}

                        </h3>


                        <p className="result-description">

                          {graph.description ||
                            "No description available."}

                        </p>

                      </div>


                      {graph.isPublic !== undefined && (

                        <span
                          className={
                            graph.isPublic
                              ? "public-badge"
                              : "private-badge"
                          }
                        >

                          {graph.isPublic
                            ? "Public"
                            : "Private"}

                        </span>

                      )}

                    </div>


                    {/* =====================================
                        GRAPH DETAILS
                    ===================================== */}

                    <div className="graph-details">


                      <div className="detail-item">

                        <span>
                          Owner
                        </span>

                        <strong>

                          {graph.owner?.username ||
                            "Unknown"}

                        </strong>

                      </div>


                      <div className="detail-item">

                        <span>
                          Complexity
                        </span>

                        <strong>

                          {graph.complexityScore ??
                            0}

                        </strong>

                      </div>


                      <div className="detail-item">

                        <span>
                          Nodes
                        </span>

                        <strong>

                          {graph.nodes?.length ||
                            0}

                        </strong>

                      </div>


                      <div className="detail-item">

                        <span>
                          Relationships
                        </span>

                        <strong>

                          {graph.edges?.length ||
                            0}

                        </strong>

                      </div>


                    </div>


                    {/* =====================================
                        NODES
                    ===================================== */}

                    {graph.nodes &&
                      graph.nodes.length > 0 && (

                      <div className="graph-section">

                        <h4>
                          Concepts
                        </h4>


                        <div className="concept-list">


                          {graph.nodes.map(
                            (node) => (

                              <div
                                className="concept-item"
                                key={node.id}
                              >

                                <div
                                  className="concept-color"
                                  style={{
                                    backgroundColor:
                                      node.colorHex ||
                                      "#2563eb"
                                  }}
                                />


                                <div>

                                  <strong>

                                    {node.label ||
                                      "Unnamed Concept"}

                                  </strong>


                                  {node.rawContent && (

                                    <p>

                                      {node.rawContent}

                                    </p>

                                  )}

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )}


                    {/* =====================================
                        RELATIONSHIPS
                    ===================================== */}

                    {graph.edges &&
                      graph.edges.length > 0 && (

                      <div className="graph-section">

                        <h4>
                          Relationships
                        </h4>


                        <div className="relationship-list">


                          {graph.edges.map(
                            (edge) => (

                              <div
                                className="relationship-item"
                                key={edge.id}
                              >

                                <strong>

                                  {edge.sourceNode?.label ||
                                    "Unknown"}

                                </strong>


                                <span className="relationship-type">

                                  {edge.relationshipType
                                    ?.replaceAll(
                                      "_",
                                      " "
                                    ) ||
                                    "RELATES TO"}

                                </span>


                                <strong>

                                  {edge.targetNode?.label ||
                                    "Unknown"}

                                </strong>


                                {edge.connectionStrength !==
                                  undefined && (

                                  <span className="strength">

                                    Strength:{" "}

                                    {
                                      edge.connectionStrength
                                    }%

                                  </span>

                                )}

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )}


                  </div>

                ))}

              </div>

            ) : (

              /* =============================================
                  NO RESULTS
              ============================================= */

              <div className="no-results">

                No matching knowledge meshes found.

              </div>

            )}


          </div>

        )}


      </div>

    </div>

  );

};


export default SemanticSearch;