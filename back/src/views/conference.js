import React, { Component, useState, useEffect } from "react";
import { useSelector, useDispatch} from 'react-redux';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import * as qs from 'query-string'

import Navbar from '../components/navbar';
import WebRTC from '../webrtc';
import Screen from '../components/screen';
import YoutubeUpload from '../components/youtubeupload';
import ImageUpload from '../components/imageupload';
import Tip from '../components/tip';

import img_small from '../images/map-small@2x.0c2a372b.png';
import img_big from '../images/map-big@2x.44a3f15c.png';

import './index.css';

function Conference(props) {
    useEffect(()=>{
        WebRTC.getInstance().startConference(dispatch, null, query.space, query.uname, 2);
    },[])
    
    const dispatch = useDispatch()
    const query = qs.parse(props.location.search);
    const users = useSelector(state=>state.users);
    const videoObj = useSelector(state=>state.screens.videos);
    const imageObj = useSelector(state=>state.screens.images);
    const bgMoving = useSelector(state=>state.screens.bgMoving);
    const [userClose, setUserClose] = useState(false);
    const [wheelScale, setWheelScale] = useState(1);
    
    const handleSetUserClose = (value) => {
        setUserClose(value)
    }
    const handleWheel = (e) => {
        setWheelScale(e.scale)
    }
    
    return (
        <React.Fragment>
            <div id='foreground_div' style={{backgroundImage: `url(${img_small})`}}>
                <Navbar onSetUserClose={handleSetUserClose} videoObj={videoObj} imageObj={imageObj} query={query} /> 
                <TransformWrapper
                    enablePadding={false}
                    enablePanPadding={false}
                    scalePadding={{ disabled: true}}
                    options={{ disabled: bgMoving, minScale: 1, maxScale: 4}}
                    wheel={{ step: 200 }}
                    pan={{ paddingSize: 0, padding: true}}
                    onWheel={(e)=>{handleWheel(e)}}
                    doubleClick={{ disabled: true}}
                >
                    <TransformComponent>
                        <div id={'background_div'} style={{backgroundImage: `url(${img_big})`, height: '100vh', width: '100vw'}}>
                            {
                                users.map((user) => <Screen key={user.id} curScale={wheelScale} user={user} />)
                            }
                            {
                                videoObj.map((video) => <YoutubeUpload key={video.name} video={video} curScale={wheelScale} userClose={userClose} room={query.space} />)
                            }
                            {
                                imageObj.map((image) => <ImageUpload key={image.value} image={image} curScale={wheelScale} userClose={userClose} room={query.space} />)
                            }
                        </div>                    
                    </TransformComponent>
                </TransformWrapper>
                {
                    users.map((user) => {
                        return (
                            <div id={'smallscreen_' + user.id} className='screen' data-tip data-for={user.id} key={user.id}
                                style={{width: 50, height: 50, borderRadius: '50%', position: 'absolute', left: 0, top: 0, display: 'none', 
                                        marginLeft:25, marginTop:25, zIndex: user.id==='me'?50:25, border: user.id==='me'?'2px solid #dcdb53':'2px solid' }} >
                            </div>
                        )
                    })
                }
            </div>
            <Tip />
        </React.Fragment>
    );
}

export default Conference
