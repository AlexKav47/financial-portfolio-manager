import axios from "axios";

export const api = axios.create({
  // Prepend "/api" to every request so no need to type it
  // api.get("/login") automatically becomes "/api/login"
  baseURL: "/api",
  // It tells the browser to automatically include your login cookies 
  // with every request, keeping the user logged in
  withCredentials: true, 
});
