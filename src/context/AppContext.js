import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [beerTypes, setBeerTypes] = useState([]);
  const [cylinders, setCylinders] = useState([]);
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    setBeerTypes(JSON.parse(localStorage.getItem("beerTypes")) || []);
    setCylinders(JSON.parse(localStorage.getItem("cylinders")) || []);
    setReadings(JSON.parse(localStorage.getItem("readings")) || []);
  }, []);

  useEffect(() => {
    localStorage.setItem("beerTypes", JSON.stringify(beerTypes));
  }, [beerTypes]);

  useEffect(() => {
    localStorage.setItem("cylinders", JSON.stringify(cylinders));
  }, [cylinders]);

  useEffect(() => {
    localStorage.setItem("readings", JSON.stringify(readings));
  }, [readings]);

  return (
    <AppContext.Provider value={{
      beerTypes, setBeerTypes,
      cylinders, setCylinders,
      readings, setReadings
    }}>
      {children}
    </AppContext.Provider>
  );
}