import {createSlice} from '@reduxjs/toolkit';

const sniperSlice = createSlice({
    name: 'sniper',
    initialState: {
        words: '',
        contracts: [],
        order: {
            status: "createdat",
            inc: 0
        },
        order2: {
            status: "nonce",
            inc: 1
        },
        loading: false,
        check: {
            sniped: false,
            unsniped: false,
            nonce: false,
            profitable: false,
        },
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
        SET_ORDER2: (state, action) => {
            if(state.order2.status == action.payload.status) {
                state.order2 = {
                    status: action.payload.status,
                    inc: 1 - state.order2.inc
                }
            }
            else state.order2 = action.payload
        },
        SET_LOADING: (state, action) => {
            state.loading = action.payload
        },
        SET_CHECK: (state, action) => {
            for (let key in action.payload) {
                state.check = {
                    sniped: false,
                    unsniped: false,
                    nonce: false,
                    profitable: false,
                    [key]: action.payload[key]
                }
            }
        }
}})

export const { SET_WORDS, SET_CONTRACTS, SET_ORDER, SET_ORDER2, SET_LOADING, SET_CHECK } = sniperSlice.actions;
export default sniperSlice.reducer;

