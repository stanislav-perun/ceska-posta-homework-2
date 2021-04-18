import axios from "axios";

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.baseURL = process.env.API_URL;

const apiReqParams = (begin, end) => ({
  airport: process.env.AIRPORT_ICAO,
  begin,
  end,
});

export const getArrivalApi = (begin, end) =>
  axios({
    url: "/arrival",
    params: apiReqParams(begin, end),
  });

export const getDepartureApi = (begin, end) =>
  axios({
    url: "/departure",
    params: apiReqParams(begin, end),
  });
