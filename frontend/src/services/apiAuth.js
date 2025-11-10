import axios from "axios";
import {
  setAccessToken,
  getAccessToken,
  deleteTokenFromVariable,
} from "./auth.js";

const apiAuth = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true,
});

apiAuth.interceptors.request.use((config) => {
  let token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiAuth.interceptors.response.use(
  (res) => {
    console.log(`API response success: ${res.status}`);
    return res;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response.status &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; //ponovno pokušavamo samo jednom
      console.log("401 detected, trying to refresh token...");
      try {
        const new_token = await axios.post(
          "http://localhost:8000/api/token/refresh-cookie/",
          {},
          { withCredentials: true }
        );
        //uspješan refresh access tokena -> pokušavamo ponovno poslati isti config s dodanim Authorization headerom:
        setAccessToken(new_token.data.access);
        originalRequest.headers.Authorization = `Bearer ${new_token.data.access}`;
        console.log("Retrying original request!");
        return apiAuth.request(originalRequest);
      } catch (err) {
        //neuspješan refresh access tokena:
        console.log("Refresh failed, user will be logged out!", err);
        deleteTokenFromVariable();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default apiAuth;
