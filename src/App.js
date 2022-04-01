import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import { createTheme } from "@mui/material";
import {ThemeProvider} from "@mui/material";
import Login from "./Pages/Login";
import ReportStudentSelection from "./Pages/ReportStudentSelection";
import SubjectManagement from "./Pages/SchoolSubjectManagement";
import {red} from "@mui/material/colors";
import StudentReportEntry from "./Pages/StudentReportEntry";
import SubjectRubric from "./Pages/SubjectRubric";
import { apiBaseUrl } from "./Config/AppConfig";
import SchoolHome from "./Pages/SchoolHome";

//Configuring the app theme
const appTheme = createTheme({
  palette: {
    primary : red
  }
});

function App() {
  return (
    <ThemeProvider theme={appTheme} >
      <Router>
        <div className="App">
          <Routes>
            <Route path="/admin/login" element={<Login apiUrl={`${apiBaseUrl}/admin/login`}/>} />
            <Route path="/school/login" element={<Login apiUrl={`${apiBaseUrl}/school/login`} />} />
            <Route path="/home/school" element={<SchoolHome />}/>
            <Route path="/report/student" element={<ReportStudentSelection />} />
            <Route path="/school/subject" element={<SubjectManagement />} />
            <Route path="/report/student/:studentId" element={<StudentReportEntry />} />
            <Route path="/school/subject/rubric" element={<SubjectRubric />} />
          </Routes>
        </div>
        </Router>
      </ThemeProvider>
  );
}

export default App;
