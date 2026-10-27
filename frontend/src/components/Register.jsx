import React, {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "./Register.css";

import apiRequest
  from "../services/api";

import GlobalMeshBackground
  from "./background/GlobalMeshBackground";


const Register = () => {

  const navigate =
    useNavigate();


  /* =========================================================
     FORM STATE
  ========================================================= */

  const [
    formData,
    setFormData,
  ] = useState({

    username: "",
    email: "",
    password: "",
    role: "KNOWLEDGE_ARCHITECT",

  });


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  /* =========================================================
     HANDLE INPUT CHANGE
  ========================================================= */

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;


    setFormData(
      (previous) => ({

        ...previous,

        [name]: value,

      })
    );


    setError("");
    setSuccess("");

  };


  /* =========================================================
     HANDLE REGISTRATION
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    setError("");
    setSuccess("");


    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (
      !formData.username.trim()
    ) {

      setError(
        "Username is required."
      );

      return;

    }


    if (
      !formData.email.trim()
    ) {

      setError(
        "Email is required."
      );

      return;

    }


    if (
      !formData.password
    ) {

      setError(
        "Password is required."
      );

      return;

    }


    if (
      !formData.role
    ) {

      setError(
        "Please select a domain role."
      );

      return;

    }


    setLoading(true);


    /* -------------------------------------------------------
       API REQUEST
    ------------------------------------------------------- */

    try {

      await apiRequest(
        "/auth/register",
        {

          method: "POST",

          body: JSON.stringify({

            username:
              formData.username.trim(),

            email:
              formData.email.trim(),

            password:
              formData.password,

            role:
              formData.role,

          }),

        }
      );


      setSuccess(
        "Registration successful. You can now sign in."
      );


      setFormData({

        username: "",
        email: "",
        password: "",
        role: "KNOWLEDGE_ARCHITECT",

      });


      setTimeout(
        () => {

          navigate("/");

        },
        1200
      );


    } catch (err) {

      setError(
        err?.message ||
        "Unable to register. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="register-page">

      {/* =====================================================
         GLOBAL ANIMATED MESH
         This is the SAME background used throughout
         the MindMesh application.
      ===================================================== */}

      <GlobalMeshBackground />


      {/* =====================================================
         REGISTER CONTENT
      ===================================================== */}

      <div className="register-content">

        {/* ===================================================
           REGISTER CARD
        =================================================== */}

        <main className="register-card">

          {/* =================================================
             BRAND
          ================================================= */}

          <div className="register-brand">

            <div
              className="register-brand-icon"
              aria-hidden="true"
            >
              M
            </div>


            <div>

              <div className="register-brand-name">
                MindMesh
              </div>


              <div className="register-brand-subtitle">
                Knowledge Intelligence Platform
              </div>

            </div>

          </div>


          {/* =================================================
             HEADING
          ================================================= */}

          <div className="register-heading">

            <h1>
              Create Account
            </h1>


            <p>
              Join MindMesh and start mapping your
              knowledge mesh.
            </p>

          </div>


          {/* =================================================
             REGISTRATION FORM
          ================================================= */}

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            {/* ===============================================
               USERNAME
            =============================================== */}

            <div className="register-form-group">

              <label
                htmlFor="register-username"
              >
                Username
              </label>


              <input
                id="register-username"
                name="username"
                type="text"
                placeholder="MindMesh Username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                disabled={loading}
                required
              />

            </div>


            {/* ===============================================
               EMAIL
            =============================================== */}

            <div className="register-form-group">

              <label
                htmlFor="register-email"
              >
                Email
              </label>


              <input
                id="register-email"
                name="email"
                type="email"
                placeholder="you@organization.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
                required
              />

            </div>


            {/* ===============================================
               PASSWORD
            =============================================== */}

            <div className="register-form-group">

              <label
                htmlFor="register-password"
              >
                Password
              </label>


              <input
                id="register-password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
                required
              />

            </div>


            {/* ===============================================
               DOMAIN ROLE
            =============================================== */}

            <div className="register-form-group">

              <label
                htmlFor="role"
              >
                Domain Role
              </label>


              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                required
              >

                <option value="KNOWLEDGE_ARCHITECT">
                  KNOWLEDGE_ARCHITECT
                </option>


                <option value="RESEARCH_STRATEGIST">
                  RESEARCH_STRATEGIST
                </option>


                <option value="VIEW_ANALYST">
                  VIEW_ANALYST
                </option>

              </select>

            </div>


            {/* ===============================================
               ERROR MESSAGE
            =============================================== */}

            {error && (

              <div
                className="register-error-message"
                role="alert"
              >
                {error}
              </div>

            )}


            {/* ===============================================
               SUCCESS MESSAGE
            =============================================== */}

            {success && (

              <div
                className="register-success-message"
                role="status"
              >
                {success}
              </div>

            )}


            {/* ===============================================
               CREATE ACCOUNT BUTTON
            =============================================== */}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >

              {loading
                ? "Creating Account..."
                : "Create Account"}

            </button>

          </form>


          {/* =================================================
             LOGIN LINK
          ================================================= */}

          <div className="register-login-link">

            Already have an account?{" "}

            <Link to="/">
              Sign In
            </Link>

          </div>

        </main>

      </div>


      {/* =====================================================
         FOOTER
      ===================================================== */}

      <div className="register-footer">

        MindMesh · AI-Driven Knowledge Graph Platform

      </div>

    </div>

  );

};


export default Register;