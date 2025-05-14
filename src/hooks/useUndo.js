import { useState } from 'react';

export function useUndo(initialState) {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);

  const current = history[index];
  
  const setState = (newState) => {
    if (JSON.stringify(current) === JSON.stringify(newState)) {
      return; // No change
    }
    
    const newHistory = history.slice(0, index + 1);
    setHistory([...newHistory, newState]);
    setIndex(newHistory.length);
  };

  const undo = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const redo = () => {
    if (index < history.length - 1) {
      setIndex(index + 1);
    }
  };

  return [
    { present: current, past: history.slice(0, index), future: history.slice(index + 1) },
    setState,
    { 
      undo, 
      redo, 
      canUndo: index > 0, 
      canRedo: index < history.length - 1,
      history,
      index
    }
  ];
}