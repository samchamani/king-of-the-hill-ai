import * as React from "react";

export type figType = "K" | "k" | "Q" | "q" | "B" | "b" | "N" | "n" | "R" | "r" | "P" | "p" | "";

export interface FigureProps {
  fig: figType;

  /**
   * Zahl von 1-8: steht für a bis h
   */
  col: number;

  /**
   * Zahl von 1-8
   */
  row: number;
}

export const Figure = (props: FigureProps) => {
  const posStyles = {
    top: (props.row - 1) * 50,
    left: (props.col - 1) * 50,
  };

  return <div className={`chess-figure ${props.fig.toLowerCase() + isWhite(props.fig)}`} style={posStyles} />;
};

function isWhite(str: string): string {
  if (str === "") return "";
  str === str.toUpperCase() ? "white" : "black";
  return str === str.toUpperCase() ? "white" : "black";
}
