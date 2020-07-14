import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';


import Utils from '../../utils/position';

export default function Tip(props){
    return (
        <div id='div_tip' style={{position: 'absolute', zIndex: 100, display: 'none', backgroundColor: '#5494a6', borderRadius: 10, padding: '10px'}}>
\        </div>
    );
}