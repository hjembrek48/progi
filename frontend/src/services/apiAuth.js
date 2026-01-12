import axios from "axios";
import {
  setAccessToken,
  getAccessToken,
  deleteTokenFromVariable,
} from "./auth.js";

// helper za dohvat cookieja
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const apiAuth = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/`,
  withCredentials: true,
});

// REQUEST interceptor
apiAuth.interceptors.request.use((config) => {
  // JWT access token
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const csrfToken = getCookie("csrftoken");
  if (
    csrfToken &&
    ["post", "put", "patch", "delete"].includes(config.method.toLowerCase())
  ) {
    config.headers["X-CSRFToken"] = csrfToken;
  }

  return config;
});

// RESPONSE interceptor (refresh token)
apiAuth.interceptors.response.use(
  (res) => {
    return res;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const new_token = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/token/refresh-cookie/`,
          {},
          { withCredentials: true }
        );

        setAccessToken(new_token.data.access);
        originalRequest.headers.Authorization = `Bearer ${new_token.data.access}`;

        return apiAuth.request(originalRequest);
      } catch (err) {
        deleteTokenFromVariable();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiAuth;
