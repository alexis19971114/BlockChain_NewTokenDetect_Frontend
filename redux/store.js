import {configureStore} from '@reduxjs/toolkit';
import  sniperReducer from './reducers/sniperSlice';


export default configureStore({
    reducer:{
        sniper: sniperReducer
    }
})
