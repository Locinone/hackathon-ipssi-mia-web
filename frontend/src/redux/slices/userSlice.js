import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import UserService from '../../services/userService';

const userService = new UserService();

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await userService.login(email, password);
            if (response.error) {
                return rejectWithValue(response.error);
            }
            if (response.message) {
                return rejectWithValue(response.message);
            }

            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async ({ username, email, password }, { rejectWithValue }) => {
        try {
            const response = await userService.register(username, email, password);
            if (response.error) {
                return rejectWithValue(response.error);
            }
            if (response.message) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error) {
            const err = error;
            return rejectWithValue(err.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: '',
        isAuth: false,
        error: '',
        token: '',
        status: 'idle',
    },
    reducers: {
        logout: (state) => {
            state.user = '';
            state.isAuth = false;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setStatus: (state, action) => {
            state.status = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                state.token = action.payload.token;
                state.isAuth = true;
                state.error = '';
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(register.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(register.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                state.isAuth = true;
                state.error = '';
            })
            .addCase(register.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { logout, setError, setStatus } = authSlice.actions;

export default authSlice.reducer;
