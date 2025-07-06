import AppContext from "../Context/AppContext";

export default function AppProvider({ children }) {
  return <AppContext.Provider>{children}</AppContext.Provider>;
}
