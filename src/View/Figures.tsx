import * as React from "react";
import "./Figures.css";
import { Figure } from "./Figure";

export interface FiguresProps {
  fen: string;
}

export const Figures = (props: FiguresProps) => {
  return (
    <div className="chess-figures">
      <Figure fig="N" col="a" row={1} />
    </div>
  );
};
