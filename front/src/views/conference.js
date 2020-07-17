import React, { Component, useState, useEffect } from "react";
import { useSelector, useDispatch} from 'react-redux';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import * as qs from 'query-string'
import styled from "styled-components";

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

    const [userClose, setUserClose] = useState(false);
    const [wheelScale, setWheelScale] = useState(1);
    
    const handleSetUserClose = (value) => {
        setUserClose(value)
    }
    // const handleWheelChangeValue = (value) => {
    //     setWheelChange(value)
    // }
    const handleWheel = (e) => {
        console.log(e, e.scale)
        setWheelScale(e.scale)
    }
    const Container = styled.div`
        height: 100vh;
        width: 100vw;
        background-image: url(${img_big});
    `;

    // const defScale = window.localStorage.getItem('windowScale')
    // const defPosX = parseInt(window.localStorage.getItem('windowScreenWidth') / 2)
    // const defPosY = parseInt(window.localStorage.getItem('windowScreenHeight') / 2)
    // console.log('----------------', defScale, defPosX, defPosY)
    
    return (
        <React.Fragment>
            <div id='foreground_div' style={{backgroundImage: `url(${img_small})`}}>
                <Navbar onSetUserClose={handleSetUserClose} videoObj={videoObj} imageObj={imageObj} query={query} /> 
                <TransformWrapper
                    enablePadding={false}
                    enablePanPadding={false}
                    scalePadding={{ disabled: true}}
                    options={{ minScale: 1, maxScale: 4}}
                    wheel={{ step: 200 }}
                    pan={{ paddingSize: 0, padding: true}}
                    onWheel={handleWheel}
                >
                    <TransformComponent>
                        <Container id={'background_div'} >
                            {
                                users.map((user) => <Screen key={user.id} curScale={wheelScale} user={user} />)
                            }
                            {
                                videoObj.map((video) => <YoutubeUpload key={video.name} video={video} curScale={wheelScale} userClose={userClose} room={query.space} />)
                            }
                            {
                                imageObj.map((image) => <ImageUpload key={image.value} image={image} curScale={wheelScale} userClose={userClose} room={query.space} />)
                            }
                        </Container>                    
                    </TransformComponent>
                </TransformWrapper>
            </div>
            <Tip />
        </React.Fragment>
    );
}

export default Conference
