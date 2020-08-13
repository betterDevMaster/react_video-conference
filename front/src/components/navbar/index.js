import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';

import WebRTC from '../../webrtc';
import Button from '../button'
import Dialog from '../dialog';
import VideoDialog from '../dialog/videodlg';
import ImageDialog from '../dialog/imagedlg';

import userssvg from '../../images/users.svg'
import youtube from '../../images/youtube.svg'
import uploadimage from '../../images/uploadimage.svg'
import sharedscreen_on from '../../images/screenshare-on.svg'
import sharedscreen_off from '../../images/screenshare-off.svg'
import stopvideo0 from '../../images/stopvideo-0.svg'
import stopvideo1 from '../../images/stopvideo-1.svg'
import stopaudio0 from '../../images/stopaudio-0.svg'
import stopaudio1 from '../../images/stopaudio-1.svg'
import logosvg from '../../images/logo.svg'
import logosmallsvg from '../../images/logo-small.svg'
import support from '../../images/support.svg'
import close from '../../images/close.svg'

import './index.css';

const   Navbar = React.memo(props => {
    const dispatch = useDispatch()
    const users = useSelector(state=>state.users);
    const camera = useSelector(state => state.buttons.camera);
    const mic = useSelector(state => state.buttons.mic);
    const screenshare = useSelector(state => state.buttons.screenshare);

    const toggleChange = (type1, value1)=>{
        dispatch( {type: type1, value: value1 ==='on'?'off':'on'});
        // console.log('toogleChange: ', type1, value1)
        if(type1 === 'click_camera'){
            dispatch({type:'user_media', value: { id: 'me', type: 'camera', status: value1 ==='on'?'off':'on'}})
            WebRTC.getInstance().toggleCamera(value1==='off')
        } else if ( type1 === 'click_mic') {
            dispatch({type:'user_media', value: { id: 'me', type: 'mic', status: value1 ==='on'?'off':'on'}})
            WebRTC.getInstance().toggleMic(value1==='off')
        } else if ( type1 === 'click_screenshare') {
            // if(!document.getElementById('screen_me')) return;
            dispatch({type:'user_media', value: { id: 'me', type: 'screenshare', status: value1 ==='on'?'off':'on'}})
            WebRTC.getInstance().toggleScreenShare(value1==='off')
        }
    }
    const handleClose = (event) => {
        WebRTC.getInstance().closeClient('me')
        window.location.href = '/room?space='+props.query.space;  
    }
    return (
        <>
            <div data-v-2db9ff64="" className="app-header" data-v-12a888fb="">
                <a data-v-2db9ff64="" href="/" target="_blank">
                    <img data-v-2db9ff64="" className="logo" src={logosvg} alt='logosvg' style={{display: 'none'}}/>
                    <img data-v-2db9ff64="" className="logo-small" src={logosmallsvg} alt='logosmallsvg' style={{display: 'none'}}/>
                </a>
                <div data-v-2f32af68="" className="controls">
                    <div data-v-2f32af68="" className="controls-main">
                        <div data-v-261ef19f="" data-v-2f32af68="" className="members-container">
                            <div data-v-2f32af68="" data-v-261ef19f="" className="members cus-dropdown">
                                <img data-v-2f32af68="" src={userssvg} alt='userssvg' />
                                <span data-v-2f32af68="" data-v-261ef19f="">{users.length}</span>
                                <div data-v-261ef19f="" className="cus-dropdown-content">
                                    {
                                        users.map((user) => user.id!=='me'?<span key={user.id}>{user.name}</span>:null)
                                    }
                                </div>
                            </div>
                        </div>
                        <Button on={youtube} off={youtube} no={youtube} alt='Youtube' status='on' onClick={()=>{ Dialog.show('videodialog') }} ></Button>
                        <Button on={uploadimage} off={uploadimage} no={uploadimage} alt='Uploadimage' status='on' onClick={()=>{ Dialog.show('imagedialog')} }></Button>
                        <Button on={sharedscreen_on} off={sharedscreen_off} no={sharedscreen_on} id='screenshare' alt='Screenshare' status={screenshare} onClick={()=>toggleChange('click_screenshare', screenshare)} ></Button>
                        <Button on={stopvideo0} off={stopvideo1} no={stopvideo1} alt='Camera' status={camera} onClick={()=>toggleChange('click_camera', camera)}></Button>
                        <Button on={stopaudio0} off={stopaudio1} no={stopaudio1} alt='Mic' status={mic} onClick={()=>toggleChange('click_mic', mic)}></Button>
                    </div>
                    <a data-v-2f32af68="" href="mailto:support@spatial.chat" className="support-link">
                        <img data-v-2f32af68="" className="support has-tooltip" src={support} alt='support' />
                    </a>
                    <img data-v-2f32af68="" className="close pointer" src={close} alt='close' onClick={(e)=>handleClose(e)} />
                </div>
            </div>
            <VideoDialog uname={props.query.uname} />
            <ImageDialog uname={props.query.uname} />
        </>
    );
})

export default Navbar;