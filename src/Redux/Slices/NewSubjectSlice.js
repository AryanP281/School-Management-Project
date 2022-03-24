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
        setSubjectDetails : setDetails
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

/************************Exports************************* */
export const {setSubjectDetails} = newSubjectSlice.actions;
export default newSubjectSlice.reducer;