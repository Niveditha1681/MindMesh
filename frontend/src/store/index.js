import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import graphReducer from "./slices/graphSlice";


/*
 * =========================================================
 * REDUX STORE
 * =========================================================
 *
 * Application state:
 *
 * auth
 *   ├── user
 *   ├── accessToken
 *   ├── loading
 *   ├── error
 *   └── isAuthenticated
 *
 * graphs
 *   ├── graphs
 *   ├── selectedGraph
 *   ├── loading
 *   └── error
 */

const store = configureStore({

  reducer: {

    /*
     * Authentication state
     */
    auth: authReducer,


    /*
     * Knowledge graph state
     *
     * IMPORTANT:
     * The key is "graphs", so components must access:
     *
     * state.graphs
     *
     * NOT:
     *
     * state.graph
     */
    graphs: graphReducer,

  },

});


export default store;