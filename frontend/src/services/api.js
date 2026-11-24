import axios from "axios";

const api = axios.create({
  baseURL: "https://organicfarm-hdec.onrender.com/api",
});

export default api;
