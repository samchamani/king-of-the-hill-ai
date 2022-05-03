import React, { Component } from 'react';
import './BoardField.css'

export interface BoardFieldProps {
  isWhite: boolean
}

export const BoardField = (props: BoardFieldProps) => {
  return (<div className={`chess-field ${props.isWhite ? 'white':'black'}`}/>)
};
