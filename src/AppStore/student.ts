import { createSlice } from '@reduxjs/toolkit';

interface CounterState {
  student: [];
}

const initialState: CounterState = {
  student: [],
};

export const StudentSlicer = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudents: (state, action) => {
      state.student += action.payload;
    },
  },
});

export const { setStudents } = StudentSlicer.actions;

export default StudentSlicer.reducer;