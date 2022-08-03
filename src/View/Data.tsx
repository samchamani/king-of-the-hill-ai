import React from "react";
import "./Data.css";

export interface DataProps {
  label: string;
  content: string;
}

export const Data = (props: DataProps) => {
  return (
    <div className="data-object">
      <div className="data-lable">{props.label}</div>
      <div className="data-content">{props.content}</div>
    </div>
  );
};
