import { TableFormater } from "./datatable.enums";
import moment from "moment";

export const createTableColumn = (title, key, type = null, width = null) => ({
  key,
  title,
  width,
  type,
});

export const formatTableValue = (type, value) => {
  switch (type) {
    case TableFormater.TABLE_DATE:
      return moment.unix(value).format("LLL");
    default:
      return value;
  }
};
