import {createSlice} from '@reduxjs/toolkit';

const sniperSlice = createSlice({
    name: 'sniper',
    initialState: {
        words: '',
        contracts: [],
        order: {
            status: "created_at",
            inc: 0
        }
    },  
    reducers: {
        SET_WORDS: (state, action) => {
            // console.log(action.payload)
            state.words = action.payload
        },
        SET_CONTRACTS: (state, action) => {
            state.contracts = [...action.payload]
        },
        SET_ORDER: (state, action) => {
            if(state.order.status == action.payload.status) {
                state.order = {
                    status: action.payload.status,
                    inc: 1 - state.order.inc
                }
            }
            else state.order = action.payload
        },
}})

export const {SET_WORDS, SET_CONTRACTS, SET_ORDER} = sniperSlice.actions;
export default sniperSlice.reducer;

