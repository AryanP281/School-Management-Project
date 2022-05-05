/**********************Imports****************** */
import { createSlice } from "@reduxjs/toolkit";

/**********************Slice****************** */
const studentSlice = createSlice({
    name: "newSubjectResults",
    initialState: {
        schoolId: undefined,
        schoolName: "",
        studentId: undefined,
        studentName: "",
        studentStd: "",
        studentDiv: "",
        studentRollNo: "",
    },
    reducers: {
        setStudentDetails : setDetails,
        resetStudentDetails: reset
    }
})

/************************Functions************************* */
function setDetails(state, action)
{
    const details = action.payload;

    state.schoolId = details.schoolId;
    state.schoolName = details.schoolName;
    state.studentId = details.studentId;
    state.studentName = details.studentName;
    state.studentStd = details.studentStd;
    state.studentDiv = details.studentDiv;
    state.studentRollNo = details.studentRollNo;
}

function reset(state, action)
{
    state.schoolId = undefined;
    state.schoolName = "";
    state.studentId = undefined;
    state.studentName = "";
    state.studentStd = "";
    state.studentDiv = "";
    state.studentRollNo = "";
}

/************************Exports************************* */
export const {setStudentDetails, resetStudentDetails} = studentSlice.actions;
export default studentSlice.reducer;