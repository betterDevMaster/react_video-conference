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
import Utils from "../utils/position";

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
        validSmallScreens()
    }
    const handlePanning = (e) => {
        validSmallScreens()
    }
    function validSmallScreens () {
        var videoEles = document.getElementsByClassName('screen')
        console.log('videoEles----------', videoEles)
        if (videoEles) {
            for (var i = 0; i < videoEles.length; i++) {
                setScaleByPosition(videoEles[i])
            }
        }
    }
    const setScaleByPosition = (videoEle) => {
        const draggableBack = document.getElementsByClassName('react-transform-element')[0]
        const posBack = Utils.getPositionFromTransformWithScale(draggableBack);
        const viewRect = {
            left: -posBack.x / posBack.scale,
            top: -posBack.y / posBack.scale,
            right: (-posBack.x + Utils.width()) / posBack.scale,
            bottom: (-posBack.y + Utils.height()) / posBack.scale
        }
        const screenMePos = Utils.getPositionFromTransform(videoEle.parentElement);

        var inRect = Utils.isInRect(viewRect, screenMePos)
        console.log(inRect)

        const smallScreen = 'smallscreen_' + videoEle.getAttribute('data-for')
        const d = document.getElementById(smallScreen)
        if (d) {
            if (!inRect) {
                videoEle.style.display = 'none'
                d.style.display = 'inline-block';

                if (videoEle.firstChild)
                    d.appendChild(videoEle.firstChild)

                const smallPos = getDistanceByRectAndPosition( screenMePos, viewRect, posBack.scale)
                Utils.setPositionOfHtmlElement(d, smallPos);
            } else {
                d.style.display = 'none'
                videoEle.style.display = 'inline-block';
                if (d.firstChild)
                    videoEle.appendChild(d.firstChild);
            }
        }
    }

    const getDistanceByRectAndPosition = (posMe, viewRect, scale) => {
        const pos = Utils.multiplyPosition(Utils.addPosition(posMe, {x: -viewRect.left, y: -viewRect.top}), scale)
        if (pos.x < 0) pos.x = 20
        if (pos.x > Utils.width()) pos.x = Utils.width()-20
        if (pos.y < 0) pos.y = 20
        if (pos.y > Utils.height()) pos.y = Utils.height()-20
        return pos
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
                    onPanning={(e)=>{handlePanning(e)}}
                    doubleClick={{ disabled: true}}
                >
                    <TransformComponent>
                        <div id={'background_div'} style={{backgroundImage: `url(${img_big})`, height: '100vh', width: '100vw'}}>
                            {
                                users.map((user) =>  <Screen key={user.id} curScale={wheelScale} user={user} />)
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
            </div>
            {
                users.map((user) => {
                    return (
                        <div id={'smallscreen_' + user.id} className='screen_small' key={user.id}
                            style={{width: 40, height: 40, borderRadius: '50%', position: 'absolute', left: 0, top: 0, display: 'none', 
                                    zIndex: user.id==='me'?50:25, border: user.id==='me'?'2px solid #dcdb53':'2px solid',
                                    transform:'translate(-20px,-20px)' }} >
                        </div>
                    )
                })
            }
            <Tip />
        </React.Fragment>
    );
}

export default Conference
