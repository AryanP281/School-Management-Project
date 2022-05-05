/**********************Imports****************** */
import { createSlice } from "@reduxjs/toolkit";

/**********************Slice****************** */
const newSubjectSlice = createSlice({
    name: "newSubjectResults",
    initialState: {
        schoolId: undefined,
        schoolName: "",
        subjectId: undefined,
        subjectName: "",
        stds: [],
    },
    reducers: {
        setSubjectDetails : setDetails,
        resetSubjectDetails: reset,
        setSubjectId: setId,
        setSubjectStds: setStds
    }
})

/************************Functions************************* */
function setDetails(state, action)
{
    const details = action.payload;

    state.schoolId = details.schoolId;
    state.schoolName = details.schoolName;
    state.subjectId = details.subjectId;
    state.subjectName = details.subjectName;
    state.stds = details.stds;
}

function reset(state, action)
{
    state.schoolId = undefined;
    state.schoolName = "";
    state.subjectId = undefined;
    state.subjectName = "";
    state.stds = [];
}

function setId(state, action)
{
    state.subjectId = action.payload.id;
}

function setStds(state,action)
{
    state.stds = action.payload.stds;
}

/************************Exports************************* */
export const {setSubjectDetails, resetSubjectDetails, setSubjectId, setSubjectStds} = newSubjectSlice.actions;
export default newSubjectSlice.reducer;