import axios from "axios";

const api = axios.create({
  baseURL: "https://pilahpilih-backend-abc-gfa9dgdtfmfjbsgp.southeastasia-01.azurewebsites.net/api",
});

export default api;
