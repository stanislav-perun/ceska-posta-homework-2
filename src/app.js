import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import moment from "moment";
import {
  Typography,
  Container,
  Box,
  Paper,
  Grid,
  ButtonGroup,
  Button,
  Divider,
  TextField,
} from "@material-ui/core";

import { persist, load } from "./libs/localstorage";
import { t } from "./libs/locales";
import * as api from "./api";

import Datatable, {
  utils as tableUtils,
  enums as tableEnums,
} from "./components/DataTable";

const LocalStorageKey = {
  DATE_KEY: "date",
  VIEW_TYPE_KEY: "flightViewtype",
  SEARCHED_QUERY_KEY: "searchedQuery",
};

const ViewMode = {
  ARRIVAL_TYPE: "arrival",
  DEPARTURE_TYPE: "departure",
};


const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);

  const [date, setDate] = useState(
    load(LocalStorageKey.DATE_KEY) || moment().format("YYYY-MM-DD")
  );

  const [shallowData, setShallowData] = useState([...data]);
  const [searchedQuery, setSearchedQuery] = useState(
    load(LocalStorageKey.SEARCHED_QUERY_KEY) || ""
  );

  const filterDataByCallsign = (query) =>
    data.filter(({ callsign }) => callsign.includes(query));

  useEffect(() => {
    setShallowData(filterDataByCallsign(searchedQuery));
  }, [searchedQuery, data]);

  const [viewMode, setViewMode] = useState(
    load(LocalStorageKey.VIEW_TYPE_KEY) || ViewMode.ARRIVAL_TYPE
  );

  const viewModeButtonProps = (type) => ({
    onClick: () => {
      persist(LocalStorageKey.VIEW_TYPE_KEY, type);
      setViewMode(type);
    },
    color: type === viewMode ? "secondary" : "default",
  });

  const fetchFlights = async () => {
    setLoading(true);

    const dateAsMoment = moment(date);
    const begin = dateAsMoment.clone().startOf("date").unix();
    const end = dateAsMoment.clone().endOf("date").unix();

    try {
      let response;
      if (viewMode === ViewMode.ARRIVAL_TYPE) {
        const arrivals = await api.getArrivalApi(begin, end);
        response = arrivals;
      }
      if (viewMode === ViewMode.DEPARTURE_TYPE) {
        const departures = await api.getDepartureApi(begin, end);
        response = departures;
      }
      setData(response.data);
      setError(false);
    } catch (error) {
      if (error && error.response.status !== 404) {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [date, viewMode]);

  const { TableStatus } = tableEnums;
  const { createTableColumn } = tableUtils;

  const table = {};

  table.columns = [
    createTableColumn(t("departure"), "firstSeen", "date"),
    createTableColumn(t("arrival"), "lastSeen", "date"),
    createTableColumn(t("callsign"), "callsign"),
    createTableColumn(t("departureAirport"), "estDepartureAirport"),
  ];

  table.data = shallowData.map(
    ({ firstSeen, lastSeen, callsign, estDepartureAirport }, index) => ({
      key: `${index}|${callsign}`,
      firstSeen,
      lastSeen,
      callsign,
      estDepartureAirport,
    })
  );

  const getTableStatus = () => {
    if (loading) {
      return TableStatus.TABLE_LOADING;
    }

    if (error) {
      return TableStatus.TABLE_ERROR;
    }

    if (data.length === 0) {
      return TableStatus.TABLE_NO_RESULTS;
    }

    if (searchedQuery.length > 0 && shallowData.length === 0) {
      return TableStatus.TABLE_FILTER_NO_RESULTS;
    }

    return TableStatus.TABLE_OK;
  };

  table.status = getTableStatus();

  const getPageTitlevVariant = () => {
    switch (viewMode) {
      case ViewMode.ARRIVAL_TYPE:
        return t("arrivalInfo");
      case ViewMode.DEPARTURE_TYPE:
        return t("departureInfo");
    }
  };

  return (
    <Container>
      <Box display="flex" justifyContent="center">
        <Paper style={{ flex: 1 }}>
          <Typography component="h1" variant="h3" align="center">
            {process.env.AIRPORT_NAME}
          </Typography>
          <Typography component="h2" variant="h4" align="center">
            {getPageTitlevVariant()}
          </Typography>
          <Box display="flex" justifyContent="center" py={3}>
            <ButtonGroup size="small" disabled={loading}>
              <Button {...viewModeButtonProps(ViewMode.ARRIVAL_TYPE)}>
                {t("arrival_plural")}
              </Button>
              <Button {...viewModeButtonProps(ViewMode.DEPARTURE_TYPE)}>
                {t("departure_plural")}
              </Button>
            </ButtonGroup>
          </Box>
          <Divider />

          <Box p={2}>
            <Grid container spacing={3} justify="center" alignItems="center">
              <Grid item>
                <TextField
                  label={t("filterByCallSign")}
                  variant="outlined"
                  size="small"
                  value={searchedQuery}
                  disabled={loading || error}
                  onChange={(event) => {
                    const value = event.target.value;
                    persist(LocalStorageKey.SEARCHED_QUERY_KEY, value);
                    setSearchedQuery(value);
                  }}
                />
              </Grid>
              <Grid item>
                <TextField
                  type="date"
                  label={t("chooseDate")}
                  variant="outlined"
                  size="small"
                  defaultValue={date}
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(event) => {
                    const value = event.target.value;
                    persist(LocalStorageKey.DATE_KEY, value);
                    setDate(value);
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          <Divider />

          <Datatable
            columns={table.columns}
            data={table.data}
            status={table.status}
          />
        </Paper>
      </Box>
    </Container>
  );
};

ReactDOM.render(<App />, document.getElementById("ceska-posta-app"));
