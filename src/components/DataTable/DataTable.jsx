import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  CircularProgress,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import * as enums from "./datatable.enums";
import * as utils from "./datatable.utils";
import { t } from "../../libs/locales";

const DataTable = ({ columns, data, status }) => {
  const { TableStatus } = enums;
  const { formatTableValue } = utils;
  return (
    <>
      {status !== TableStatus.TABLE_OK && (
        <Box
          py={3}
          display="flex"
          justifyContent="center"
          style={{ width: "100%" }}
        >
          {status === TableStatus.TABLE_LOADING && (
            <CircularProgress color="secondary" />
          )}
          {status === TableStatus.TABLE_NO_RESULTS && (
            <Alert severity="info">{t("noResultsFound")}</Alert>
          )}
          {status === TableStatus.TABLE_FILTER_NO_RESULTS && (
            <Alert severity="info">{t("filterNoResultsFound")}</Alert>
          )}
          {status === TableStatus.TABLE_ERROR && (
            <Alert severity="error">{t("noResultsDueToError")}</Alert>
          )}
        </Box>
      )}
      {status == TableStatus.TABLE_OK && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map(({ key, title }) => (
                  <TableCell key={key}>{title}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.key}>
                  {columns.map(({ key, type }) => (
                    <TableCell key={key}>
                      {formatTableValue(type, row[key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      width: PropTypes.number,
      type: PropTypes.oneOf(Object.values(enums.TableFormater)),
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  status: PropTypes.oneOf(Object.values(enums.TableStatus)).isRequired,
};

export default DataTable;
