import { figType } from "../View/Figure";

export const isWhite = (str: string | figType) => {
  if (isEmpty(str as figType)) {
    console.log("Asked if white or black, but field is empty");
    return;
  }
  return str.toUpperCase() === str;
};

export const isIndexOnBoard = (...nums: number[]) => {
  for (const n of nums) {
    if (!(n >= 0 && n <= 7)) {
      return false;
    }
  }
  return true;
};

export const isEmpty = (fig: figType) => {
  return fig === "";
};

export const isBeatable = (fig1: figType, fig2: figType) => {
  if (isEmpty(fig1) || isEmpty(fig2)) return false;
  return isWhite(fig1) !== isWhite(fig2);
};
