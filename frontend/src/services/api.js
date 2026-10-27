/*
 * =========================================================
 * API CONFIGURATION
 * =========================================================
 */

const API_BASE_URL =
  "http://localhost:8080/api";


/*
 * =========================================================
 * COMMON API REQUEST
 * =========================================================
 *
 * All frontend services communicate with the Spring Boot
 * backend through this function.
 *
 * Example:
 *
 * apiRequest("/graphs")
 *
 * becomes:
 *
 * GET http://localhost:8080/api/graphs
 */


const apiRequest = async (
  endpoint,
  options = {}
) => {

  /*
   * -------------------------------------------------------
   * ACCESS TOKEN
   * -------------------------------------------------------
   */

  const token =
    localStorage.getItem(
      "accessToken"
    );


  /*
   * -------------------------------------------------------
   * REQUEST HEADERS
   * -------------------------------------------------------
   */

  const headers = {
    "Content-Type":
      "application/json",

    ...(options.headers || {}),
  };


  /*
   * Add JWT only when available.
   */

  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  /*
   * -------------------------------------------------------
   * REQUEST
   * -------------------------------------------------------
   */

  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );


  /*
   * -------------------------------------------------------
   * RESPONSE DATA
   * -------------------------------------------------------
   *
   * The backend may return:
   *
   * - JSON
   * - text
   * - empty body
   * - 204 No Content
   */

  let data = null;


  const contentType =
    response.headers.get(
      "content-type"
    );


  /*
   * 204 = no content.
   */

  if (
    response.status === 204
  ) {

    data = null;

  }


  /*
   * JSON response.
   */

  else if (
    contentType &&
    contentType
      .toLowerCase()
      .includes("application/json")
  ) {

    const text =
      await response.text();


    if (text) {

      try {

        data =
          JSON.parse(text);

      } catch (parseError) {

        /*
         * If a server incorrectly labels
         * a response as JSON, preserve the
         * raw response rather than crashing
         * with an unclear JSON error.
         */

        data = text;

      }

    } else {

      data = null;

    }

  }


  /*
   * Plain text response.
   */

  else {

    const text =
      await response.text();

    data =
      text || "";

  }


  /*
   * -------------------------------------------------------
   * HTTP ERROR
   * -------------------------------------------------------
   */

  if (!response.ok) {

    let message =
      `Request failed with status ${response.status}.`;


    /*
     * Backend returned plain text.
     */

    if (
      typeof data ===
      "string"
    ) {

      message =
        data.trim() ||
        message;

    }


    /*
     * Backend returned an object.
     */

    else if (
      data &&
      typeof data ===
        "object"
    ) {

      message =
        data.message ||
        data.error ||
        data.detail ||
        data.title ||
        message;

    }


    throw new Error(
      message
    );

  }


  /*
   * -------------------------------------------------------
   * SUCCESS
   * -------------------------------------------------------
   */

  return data;

};


/*
 * =========================================================
 * GET
 * =========================================================
 */

export const get = (
  endpoint
) => {

  return apiRequest(
    endpoint,
    {
      method: "GET",
    }
  );

};


/*
 * =========================================================
 * POST
 * =========================================================
 */

export const post = (
  endpoint,
  data
) => {

  const options = {
    method: "POST",
  };


  if (
    data !== undefined &&
    data !== null
  ) {

    options.body =
      JSON.stringify(data);

  }


  return apiRequest(
    endpoint,
    options
  );

};


/*
 * =========================================================
 * PUT
 * =========================================================
 */

export const put = (
  endpoint,
  data
) => {

  const options = {
    method: "PUT",
  };


  if (
    data !== undefined &&
    data !== null
  ) {

    options.body =
      JSON.stringify(data);

  }


  return apiRequest(
    endpoint,
    options
  );

};


/*
 * =========================================================
 * DELETE
 * =========================================================
 */

export const del = (
  endpoint
) => {

  return apiRequest(
    endpoint,
    {
      method: "DELETE",
    }
  );

};


/*
 * =========================================================
 * API BASE URL
 * =========================================================
 */

export {
  API_BASE_URL,
};


/*
 * =========================================================
 * DEFAULT EXPORT
 * =========================================================
 */

export default apiRequest;