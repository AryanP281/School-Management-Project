/**********************Imports****************** */
import { createSlice } from "@reduxjs/toolkit";

/**********************Slice****************** */
const newSubjectSlice = createSlice({
    name: "newSubjectResults",
    initialState: {
        schoolId: undefined,
        schoolName: "",
        subjectName: "",
        stds: [],
    },
    reducers: {
        setSubjectDetails : setDetails,
        resetSubjectDetails: reset
    }
})

/************************Functions************************* */
function setDetails(state, action)
{
    const details = action.payload;

    state.schoolId = details.schoolId;
    state.schoolName = details.schoolName;
    state.subjectName = details.subjectName;
    state.stds = details.stds;
}

function reset(state, action)
{
    state.schoolId = undefined;
    state.schoolName = "";
    state.subjectName = "";
    state.stds = [];
}

/************************Exports************************* */
export const {setSubjectDetails, resetSubjectDetails} = newSubjectSlice.actions;
export default newSubjectSlice.reducer;