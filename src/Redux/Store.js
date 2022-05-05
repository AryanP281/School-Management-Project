/**********************Imports****************** */
import { configureStore } from "@reduxjs/toolkit";
import NewSubjectReducer from "./Slices/NewSubjectSlice";
import StudentReducer from "./Slices/StudentSlice";

/**********************Variables****************** */
const store = configureStore({
    reducer: {
        newSubject : NewSubjectReducer,
        student: StudentReducer
    }
})

/**********************Exports****************** */
export default store;