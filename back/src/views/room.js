import React, { useState } from "react";
import ReactSpinner from 'react-spinkit'
// import {Redirect} from 'react-router-dom';
import * as qs from 'query-string'

import WebRTC from '../webrtc';
import Utils from '../utils/position'
import logosvg from '../images/logo.svg'
import logosmallsvg from '../images/logo-small.svg'
import joinbtn from '../images/joinbtn.svg'
import Footer from '../components/footer';
import './index.css';

function Room(props) {
    const [isVerified, setIsVerified] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [userName, setUserName] = useState('');
    const query = qs.parse(props.location.search);

    const handleChange = (event) => {
        event.preventDefault();

        const { value } = event.target;
        if (value.length > 0) {
            setIsVerified(true);
            setUserName(value);
        }
        else
            setIsVerified(false);
    }
    const handleSubmit = (event) => {
        event.preventDefault()
        setSendingEmail(true)
        
        window.localStorage.setItem('o', true)
        window.localStorage.setItem('t', 'video-meeting')
        window.localStorage.setItem('r', query.space)
        window.localStorage.setItem('r', 'tryme')
        window.localStorage.setItem('userName', userName)

        setTimeout(()=>{
            props.history.push('/conference?space='+query.space+'&uname='+userName);
            // props.history.push('/home/conference');
            // <Redirect to="/conference/" />
            // this.context.router.push('child')
        }, 2500);
    }
    
    return (
    <div data-v-12a888fb="" className="space">
        <div data-v-2db9ff64="" style={{ position: 'absolute', right: '10%', top: '5%'}} data-v-12a888fb="">
            <div data-v-2f32af68="" >
                {query.space}
            </div>
        </div>
        <div data-v-a74c9690="" data-v-12a888fb="" className="entrance ent-div">
            <form data-v-a74c9690="" className="form" onSubmit={(e)=>handleSubmit(e)}>
                <input data-v-a74c9690="" type="text" placeholder="Your Name" className="name" onChange={(e)=>handleChange(e)}/>
                <button data-v-a74c9690="" type="submit" disabled={!isVerified} className="pointer">
                    {sendingEmail
                    ? <ReactSpinner name='three-bounce' />
                    : <img src={joinbtn} alt='joinbtn' />
                    }
                </button>
            </form>
        </div>
        <Footer />
    </div>
    );
}

export default Room;
