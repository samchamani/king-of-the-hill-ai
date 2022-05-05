import { figType } from "../View/Figure";

export const isWhite = (str: string | figType) => {
  return str.toUpperCase() === str;
};

export const isIndexOnBoard = (num: number) => {
  return num >= 0 && num <= 7;
};
