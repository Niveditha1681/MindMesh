import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  login as loginUser,
  logout as logoutUser,
  getStoredUser,
  getAccessToken,
} from "../../services/authService";


/*
 * =========================================================
 * LOGIN THUNK
 * =========================================================
 *
 * Login.jsx
 *    ↓
 * loginThunk
 *    ↓
 * authService.login()
 *    ↓
 * api.js
 *    ↓
 * POST /api/auth/login
 */

export const loginThunk = createAsyncThunk(
  "auth/login",

  async (
    { username, password },
    { rejectWithValue }
  ) => {

    try {

      const data = await loginUser(
        username,
        password
      );


      /*
       * Backend response:
       *
       * {
       *   id,
       *   username,
       *   role,
       *   accessToken
       * }
       */

      if (!data) {

        return rejectWithValue(
          "Invalid username or password."
        );

      }


      /*
       * Store user information.
       */

      const user = {
        id: data.id,
        username: data.username,
        role: data.role,
      };


      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );


      /*
       * Store access token.
       */

      if (data.accessToken) {

        localStorage.setItem(
          "accessToken",
          data.accessToken
        );

      }


      return {
        ...data,
        user,
      };

    } catch (error) {

      return rejectWithValue(
        error?.message ||
        "Invalid username or password."
      );

    }

  }
);


/*
 * =========================================================
 * INITIAL STATE
 * =========================================================
 *
 * Restore previous login after browser refresh.
 */

const storedUser =
  getStoredUser();

const storedToken =
  getAccessToken();


const initialState = {

  user:
    storedUser || null,

  accessToken:
    storedToken || null,

  loading:
    false,

  error:
    null,

  isAuthenticated:
    Boolean(
      storedUser &&
      storedToken
    ),

};


/*
 * =========================================================
 * AUTH SLICE
 * =========================================================
 */

const authSlice = createSlice({

  name: "auth",

  initialState,


  reducers: {


    /*
     * =====================================================
     * LOGOUT
     * =====================================================
     */

    logout: (state) => {

      /*
       * Clear Redux authentication state.
       */

      state.user = null;

      state.accessToken = null;

      state.loading = false;

      state.error = null;

      state.isAuthenticated = false;


      /*
       * Clear browser authentication storage.
       *
       * authService.logout() removes:
       *
       * accessToken
       * user
       */

      logoutUser();

    },


    /*
     * =====================================================
     * CLEAR ERROR
     * =====================================================
     */

    clearError: (state) => {

      state.error = null;

    },

  },


  /*
   * =======================================================
   * ASYNC LOGIN STATES
   * =======================================================
   */

  extraReducers: (builder) => {


    /*
     * -----------------------------------------------------
     * LOGIN PENDING
     * -----------------------------------------------------
     */

    builder.addCase(
      loginThunk.pending,

      (state) => {

        state.loading = true;

        state.error = null;

      }
    );


    /*
     * -----------------------------------------------------
     * LOGIN SUCCESS
     * -----------------------------------------------------
     */

    builder.addCase(
      loginThunk.fulfilled,

      (state, action) => {

        state.loading = false;

        state.error = null;

        state.isAuthenticated = true;


        /*
         * Prefer the normalized user object.
         */

        state.user =
          action.payload?.user || {

            id:
              action.payload?.id,

            username:
              action.payload?.username,

            role:
              action.payload?.role,

          };


        /*
         * Keep the token synchronized
         * with localStorage.
         */

        state.accessToken =
          action.payload?.accessToken ||
          getAccessToken();

      }
    );


    /*
     * -----------------------------------------------------
     * LOGIN FAILURE
     * -----------------------------------------------------
     */

    builder.addCase(
      loginThunk.rejected,

      (state, action) => {

        state.loading = false;

        state.isAuthenticated = false;

        state.user = null;

        state.accessToken = null;

        state.error =
          action.payload ||
          "Invalid username or password.";

      }
    );

  },

});


/*
 * =========================================================
 * ACTIONS
 * =========================================================
 */

export const {
  logout,
  clearError,
} = authSlice.actions;


/*
 * =========================================================
 * REDUCER
 * =========================================================
 */

export default authSlice.reducer;