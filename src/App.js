import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import { createTheme } from "@mui/material";
import {ThemeProvider} from "@mui/material";
import Login from "./Pages/Login";
import AdminStudentSelection from "./Pages/AdminStudentSelection";
import SubjectManagement from "./Pages/SchoolSubjectManagement";
import {red} from "@mui/material/colors";
import StudentReportEntry from "./Pages/StudentReportEntry";
import SubjectRubric from "./Pages/SubjectRubric";
import { apiBaseUrl } from "./Config/AppConfig";
import SchoolHome from "./Pages/SchoolHome";
import SchoolStudentSelection from "./Pages/SchoolStudentSelection";
import StudentReport from "./Pages/StudentReport";
import AdminHome from "./Pages/AdminHome";
import AdminReportStudentSelection from "./Pages/AdminReportStudentSelection";
import SchoolCustomization from "./Pages/SchoolCustomization";

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
            <Route path="/admin/login" element={<Login apiUrl={`${apiBaseUrl}/admin/login`}/>} isSchoolLogin={false} />
            <Route path="/school/login" element={<Login apiUrl={`${apiBaseUrl}/school/login`} isSchoolLogin={true} />} />
            <Route path="/home/school" element={<SchoolHome />}/>
            <Route path="/home/admin" element={<AdminHome />} />
            <Route path="/admin/student" element={<AdminStudentSelection/>} />
            <Route path="/admin/report/student" element={<AdminReportStudentSelection />} />
            <Route path="/school/report/student" element={<SchoolStudentSelection />} /> 
            <Route path="/report/:year" element={<StudentReport />} /> 
            <Route path="/admin/school/subject" element={<SubjectManagement />} />
            <Route path="/admin/student/report" element={<StudentReportEntry />} />
            <Route path="/admin/school/subject/rubric" element={<SubjectRubric />} />
            <Route path="/admin/customization" element={<SchoolCustomization />} />
          </Routes>
        </div>
        </Router>
      </ThemeProvider>
  );
}

export default App;
