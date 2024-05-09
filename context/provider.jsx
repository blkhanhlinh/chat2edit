import React, { createContext, useState, useContext } from 'react';

const ResultDataContext = createContext();

export const useResultData = () => useContext(ResultDataContext);

export const ResultDataProvider = ({ children }) => {
  const [resultData, setResultData] = useState([]);
  const [query, setQuery] = useState(null);
  const [topK, setTopK] = useState(15);
  const [instructResult, setInstructResult] = useState("")

  return (
    <ResultDataContext.Provider value={{ resultData, setResultData, query, setQuery, topK, setTopK, instructResult, setInstructResult }}>
      {children}
    </ResultDataContext.Provider>
  );
};