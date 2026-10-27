import React, { useState } from "react";
import "./Login.css";

import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { loginThunk } from "../store/slices/authSlice";

import GlobalMeshBackground
  from "./background/GlobalMeshBackground";

import mindmeshVisual
  from "../assets/mindmesh-brain.png";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /*
   * =========================================================
   * REDUX STATE
   * =========================================================
   */

  const loading = useSelector(
    (state) => state.auth?.loading || false
  );

  const reduxError = useSelector(
    (state) => state.auth?.error || ""
  );

  /*
   * =========================================================
   * FORM STATE
   * =========================================================
   */

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  /*
   * =========================================================
   * INPUT CHANGE
   * =========================================================
   */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  /*
   * =========================================================
   * LOGIN SUBMIT
   * =========================================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    try {
      await dispatch(
        loginThunk({
          username: formData.username.trim(),
          password: formData.password,
        })
      ).unwrap();

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err?.message ||
            "Invalid username or password.";

      setError(message);
    }
  };

  const displayError =
    error || reduxError || "";

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="login-page">

      {/* =====================================================
          GLOBAL ANIMATED MESH
          SAME BACKGROUND USED THROUGHOUT THE PROJECT
      ===================================================== */}

      <GlobalMeshBackground />


      {/* =====================================================
          BRAIN VISUAL
      ===================================================== */}

      <div
        className="brain-background"
        aria-hidden="true"
      >
        <div className="brain-glow" />

        <img
          src={mindmeshVisual}
          alt=""
          className="mindmesh-brain-image"
        />
      </div>


      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <div className="login-topnav">

        <span>
          Mesh Health
        </span>

        <span>
          Audit Log
        </span>

        <span>
          Docs
        </span>

      </div>


      {/* =====================================================
          LOGIN CARD
      ===================================================== */}

      <main className="login-card">

        {/* BRAND */}

        <div className="login-brand">

          <div
            className="brand-icon"
            aria-hidden="true"
          >
            M
          </div>

          <div>

            <div className="brand-name">
              MindMesh
            </div>

            <div className="brand-subtitle">
              Knowledge Intelligence Platform
            </div>

          </div>

        </div>


        {/* HEADING */}

        <div className="login-heading">

          <h1>
            Welcome
          </h1>

          <p>
            Sign in to continue mapping your
            knowledge mesh.
          </p>

        </div>


        {/* LOGIN FORM */}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          {/* USERNAME */}

          <div className="form-group">

            <label htmlFor="username">
              MindMesh Username
            </label>

            <div className="input-wrapper">

              <input
                id="username"
                name="username"
                type="text"
                placeholder="MindMesh Username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                disabled={loading}
                required
              />

              {formData.username && (
                <span
                  className="input-valid"
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}

            </div>

          </div>


          {/* PASSWORD */}

          <div className="form-group">

            <div className="password-label-row">

              <label htmlFor="password">
                Password
              </label>

              <button
                type="button"
                className="forgot-button"
              >
                Forgot?
              </button>

            </div>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={loading}
              required
            />

          </div>


          {/* ERROR */}

          {displayError && (
            <div
              className="error-message"
              role="alert"
            >
              {displayError}
            </div>
          )}


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>

        </form>


        {/* DIVIDER */}

        <div className="login-divider">
          <span>
            or continue with
          </span>
        </div>


        {/* REGISTER */}

        <div className="register-link">

          Don't have an account?{" "}

          <Link to="/register">
            Create Account
          </Link>

        </div>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="login-footer">
        MindMesh · AI-Driven Knowledge Graph Platform
      </div>

    </div>
  );
};

export default Login;