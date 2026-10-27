import apiRequest from "./api";

/*
 * =========================================================
 * LOGIN
 * =========================================================
 *
 * POST /api/auth/login
 *
 * Expected backend response:
 *
 * {
 *   id,
 *   username,
 *   role,
 *   accessToken
 * }
 */

export const login = async (
  username,
  password
) => {

  /*
   * Validate username.
   */

  if (!username?.trim()) {
    throw new Error(
      "Username is required."
    );
  }

  /*
   * Validate password.
   */

  if (!password) {
    throw new Error(
      "Password is required."
    );
  }

  /*
   * Send login request.
   */

  return await apiRequest(
    "/auth/login",
    {
      method: "POST",

      body: JSON.stringify({
        username: username.trim(),
        password,
      }),
    }
  );
};


/*
 * =========================================================
 * REGISTER
 * =========================================================
 *
 * POST /api/auth/register
 */

export const register = async (
  username,
  email,
  password,
  role
) => {

  /*
   * Validate username.
   */

  if (!username?.trim()) {
    throw new Error(
      "Username is required."
    );
  }

  /*
   * Validate email.
   */

  if (!email?.trim()) {
    throw new Error(
      "Email is required."
    );
  }

  /*
   * Validate password.
   */

  if (!password) {
    throw new Error(
      "Password is required."
    );
  }

  /*
   * Validate role.
   */

  if (!role) {
    throw new Error(
      "Role is required."
    );
  }

  /*
   * Send registration request.
   */

  return await apiRequest(
    "/auth/register",
    {
      method: "POST",

      body: JSON.stringify({
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      }),
    }
  );
};


/*
 * =========================================================
 * LOGOUT
 * =========================================================
 *
 * Remove authentication information
 * from browser storage.
 */

export const logout = () => {

  /*
   * Remove the current JWT token.
   */

  localStorage.removeItem(
    "accessToken"
  );

  /*
   * Remove the older token key as well.
   * This prevents stale authentication
   * data from remaining in localStorage.
   */

  localStorage.removeItem(
    "token"
  );

  /*
   * Remove stored user information.
   */

  localStorage.removeItem(
    "user"
  );
};


/*
 * =========================================================
 * GET STORED USER
 * =========================================================
 */

export const getStoredUser = () => {

  const storedUser =
    localStorage.getItem(
      "user"
    );

  /*
   * No stored user.
   */

  if (!storedUser) {
    return null;
  }

  /*
   * Parse stored user safely.
   */

  try {

    return JSON.parse(
      storedUser
    );

  } catch (error) {

    /*
     * Remove corrupted data.
     */

    localStorage.removeItem(
      "user"
    );

    return null;
  }
};


/*
 * =========================================================
 * GET STORED ACCESS TOKEN
 * =========================================================
 */

export const getAccessToken = () => {

  return localStorage.getItem(
    "accessToken"
  );
};


/*
 * =========================================================
 * CHECK AUTHENTICATION
 * =========================================================
 */

export const isAuthenticated = () => {

  const token =
    getAccessToken();

  const user =
    getStoredUser();

  return Boolean(
    token &&
    user
  );
};


/*
 * =========================================================
 * DEFAULT SERVICE OBJECT
 * =========================================================
 */

const authService = {

  login,

  register,

  logout,

  getStoredUser,

  getAccessToken,

  isAuthenticated,

};

export default authService;