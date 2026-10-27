import React, { useState } from "react";


/*
 * =========================================================
 * SEARCH + FILTER BAR
 * =========================================================
 *
 * Provides:
 *
 * 1. Knowledge graph search
 * 2. Public/private filtering
 * 3. Clear search functionality
 *
 * The component is intentionally independent from Redux
 * so it can also be rendered and tested independently.
 */


const SearchFilterBar = ({
  onSearch,
  onFilterChange,
  placeholder = "Search knowledge graphs...",
}) => {

  const [
    searchValue,
    setSearchValue,
  ] = useState("");


  const [
    filter,
    setFilter,
  ] = useState("ALL");


  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const handleSearch = (event) => {

    const value =
      event?.target?.value || "";


    setSearchValue(
      value
    );


    if (
      typeof onSearch ===
      "function"
    ) {

      onSearch(
        value
      );

    }

  };


  /*
   * =========================================================
   * FILTER
   * =========================================================
   */

  const handleFilterChange = (
    event
  ) => {

    const value =
      event?.target?.value ||
      "ALL";


    setFilter(
      value
    );


    if (
      typeof onFilterChange ===
      "function"
    ) {

      onFilterChange(
        value
      );

    }

  };


  /*
   * =========================================================
   * CLEAR SEARCH
   * =========================================================
   */

  const handleClear = () => {

    setSearchValue("");


    if (
      typeof onSearch ===
      "function"
    ) {

      onSearch(
        ""
      );

    }

  };


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div
      className="search-filter-bar"
      aria-label="Graph search and filters"
    >

      {/* ===================================================
          SEARCH
          =================================================== */}

      <div className="search-input-wrapper">

        <span
          className="search-icon"
          aria-hidden="true"
        >
          ⌕
        </span>


        <input
          type="search"
          name="graphSearch"
          value={searchValue}
          placeholder={placeholder}
          aria-label="Search knowledge graphs"
          onChange={handleSearch}
        />


        {searchValue.length > 0 && (

          <button
            type="button"
            className="search-clear-button"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>

        )}

      </div>


      {/* ===================================================
          FILTER
          =================================================== */}

      <div className="filter-wrapper">

        <label
          htmlFor="graph-filter"
          className="filter-label"
        >
          Filter
        </label>


        <select
          id="graph-filter"
          name="graphFilter"
          value={filter}
          onChange={handleFilterChange}
          aria-label="Filter graphs"
        >

          <option value="ALL">
            All
          </option>

          <option value="PUBLIC">
            Public
          </option>

          <option value="PRIVATE">
            Private
          </option>

        </select>

      </div>

    </div>
  );
};


export default SearchFilterBar;