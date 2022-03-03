import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import LoginPage from "./Components/Login";
import { createTheme } from "@mui/material";
import {ThemeProvider} from "@mui/styles";
import { cyan } from "@mui/material/colors";
import Home from "./Components/Home";
import Layout from "./Components/Layout";

const theme = createTheme({
  palette: {
    primary: {
      main: "#fe0000"
    },
    secondary: cyan,
  },
  typography:{
    fontFamily: "Quicksand",
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700   
  }
});

function App() {
  return (
    <ThemeProvider theme={theme} >
      <Router>
        <Layout>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/login" element={<LoginPage/>}/>
            </Routes>
          </div>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
