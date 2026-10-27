import React from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  logout,
} from "../../store/slices/authSlice";


const Navbar = () => {

  /* =========================================================
     HOOKS
     ========================================================= */

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();


  /* =========================================================
     USER
     ========================================================= */

  const user = useSelector(
    (state) => state?.auth?.user
  );


  /* =========================================================
     ROLE
     ========================================================= */

  const role =
    user?.role
      ?.trim()
      ?.toUpperCase()
      ?.replace(/\s+/g, "_")
      ?.replace(/-/g, "_") || "";


  /* =========================================================
     LOGOUT
     ========================================================= */

  const handleLogout = () => {

    dispatch(logout());

    navigate(
      "/",
      {
        replace: true,
      }
    );

  };


  /* =========================================================
     ACTIVE NAVIGATION
     ========================================================= */

  const isActive = (path) => {

    if (path === "/workspace") {

      return location.pathname.startsWith(
        "/workspace"
      );

    }

    return location.pathname === path;

  };


  /* =========================================================
     NAVIGATION
     ========================================================= */

  const goTo = (path) => {

    navigate(path);

  };


  /* =========================================================
     UI
     ========================================================= */

  return (

    <nav className="navbar">


      {/* =====================================================
          BRAND
          ===================================================== */}

      <div
        className="navbar-brand"
        onClick={() => goTo("/dashboard")}
        role="button"
        tabIndex={0}
      >

        <div className="navbar-logo">
          M
        </div>

        <span>
          MindMesh
        </span>

      </div>


      {/* =====================================================
          MAIN NAVIGATION
          ===================================================== */}

      <div className="navbar-links">


        {/* =================================================
            KNOWLEDGE ARCHITECT
            ================================================= */}

        {role === "KNOWLEDGE_ARCHITECT" && (

          <>


            {/* DASHBOARD */}

            <button
              type="button"
              className={
                isActive("/dashboard")
                  ? "navbar-link active"
                  : "navbar-link"
              }
              onClick={() =>
                goTo("/dashboard")
              }
            >
              Dashboard
            </button>


            {/* SYSTEM HEALTH */}

            <button
              type="button"
              className={
                isActive("/system-health")
                  ? "navbar-link active"
                  : "navbar-link"
              }
              onClick={() =>
                goTo("/system-health")
              }
            >
              System Health
            </button>


            {/* GLOBAL METRICS */}

            <button
              type="button"
              className={
                isActive("/global-metrics")
                  ? "navbar-link active"
                  : "navbar-link"
              }
              onClick={() =>
                goTo("/global-metrics")
              }
            >
              Global Metrics
            </button>


          </>

        )}


        {/* =================================================
            RESEARCH STRATEGIST
            ================================================= */}

        {role === "RESEARCH_STRATEGIST" && (

          <>


            {/* DASHBOARD */}

            <button
              type="button"
              className={
                isActive("/dashboard")
                  ? "navbar-link active"
                  : "navbar-link"
              }
              onClick={() =>
                goTo("/dashboard")
              }
            >
              Dashboard
            </button>


            {/* WORKSPACE */}

            <button
              type="button"
              className={
                isActive("/workspace")
                  ? "navbar-link active"
                  : "navbar-link"
              }
              onClick={() =>
                goTo("/workspace")
              }
            >
              Workspace
            </button>


            {/* SEMANTIC SEARCH */}

            <button
              type="button"
              className={
                isActive("/search")
                  ? "navbar-link active"
                  : "navbar-link"
              }
              onClick={() =>
                goTo("/search")
              }
            >
              Semantic Search
            </button>


          </>

        )}


        {/* =================================================
            VIEWER ANALYST
            ================================================= */}

        {(role === "VIEW_ANALYST" ||
          role === "VIEWER_ANALYST") && (

          <>


            {/* DASHBOARD */}

            <button
              type="button"
              className={
                isActive("/dashboard")
                  ? "navbar-link active"
                  : "navbar-link"
              }
              onClick={() =>
                goTo("/dashboard")
              }
            >
              Dashboard
            </button>


            {/* DISCOVERY */}

            <button
              type="button"
              className={
                isActive("/discovery")
                  ? "navbar-link active"
                  : "navbar-link"
              }
              onClick={() =>
                goTo("/discovery")
              }
            >
              Discovery
            </button>


            {/* ACTIVITY LOG */}

            <button
              type="button"
              className={
                isActive("/activity-log")
                  ? "navbar-link active"
                  : "navbar-link"
              }
              onClick={() =>
                goTo("/activity-log")
              }
            >
              Activity Log
            </button>


          </>

        )}


        {/* =================================================
            FALLBACK
            ================================================= */}

        {!role && (

          <button
            type="button"
            className={
              isActive("/dashboard")
                ? "navbar-link active"
                : "navbar-link"
            }
            onClick={() =>
              goTo("/dashboard")
            }
          >
            Dashboard
          </button>

        )}


      </div>


      {/* =====================================================
          USER SECTION
          ===================================================== */}

      <div className="navbar-user">


        {/* USER ROLE */}

        <span className="navbar-role">

          {user?.role
            ?.replace(/_/g, " ")
            ?.replace(
              /\b\w/g,
              (char) =>
                char.toUpperCase()
            )}

        </span>


        {/* USERNAME */}

        <span className="navbar-username">

          {user?.username ||
            user?.name ||
            "User"}

        </span>


        {/* DIVIDER */}

        <span className="navbar-divider">
          |
        </span>


        {/* LOGOUT */}

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>


      </div>


    </nav>

  );

};


export default Navbar;