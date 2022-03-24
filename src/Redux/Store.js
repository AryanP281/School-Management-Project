/**********************Imports****************** */
import { configureStore } from "@reduxjs/toolkit";
import NewSubjectReducer from "./Slices/NewSubjectSlice";

/**********************Variables****************** */
const store = configureStore({
    reducer: {
        newSubject : NewSubjectReducer
    }
})

/**********************Exports****************** */
export default store;