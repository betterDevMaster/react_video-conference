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
        WebRTC.getInstance().startConference(dispatch, null, query.space, query.uname);
    },[])
    
    const dispatch = useDispatch()
    const query = qs.parse(props.location.search);
    const users = useSelector(state=>state.users);
    const videoObj = useSelector(state=>state.screens.videos);
    const imageObj = useSelector(state=>state.screens.images);

    const [userClose, setUserClose] = useState(false);
    const [wheelChange, setWheelChange] = useState(1);
    
    const handleSetUserClose = (value) => {
        setUserClose(value)
    }
    const handleWheelChangeValue = (value) => {
        setWheelChange(value)
    }

    const handleWheel = (e) => {
        console.log(e)
    }
    const Container = styled.div`
        height: 100vh;
        width: 100vw;
        background-image: url(${img_big});
    `;
    return (
    <div data-v-12a888fb="" className="space">
        <Navbar onSetUserClose={handleSetUserClose} videoObj={videoObj} imageObj={imageObj} query={query} /> 
        <div id='foreground_div' style={{backgroundImage: `url(${img_small})`}}>
            <TransformWrapper
                defaultScale={1}
                // defaultPositionX={200}
                // defaultPositionY={100}
                // positionX={}
                // positionY={}
                options={{minScale:1, maxScale: 4}}
                // scalePadding={{size:1}}
                Wheel={{step:70}}
                // Pan={{disabled: true, velocityMinSpeed:16}}
                // zoomIn={{disabled: true, step:200}}
                // pinch={{disabled: true, step:200}}
                // zoomOut={{disabled: true, step:200}}
                onWheel={handleWheel}
            >
                <TransformComponent>
                    {/* <Container background={img_big}>
                        {
                            users.map((user) => <Screen key={user.id} curScale={wheelChange} user={user} />)
                        }
                        {
                            videoObj.map((video) => <YoutubeUpload key={video.name} video={video} cur={wheelChange} userClose={userClose} room={query.space} />)
                        }
                        {
                            imageObj.map((image) => <ImageUpload key={image.value} image={image} cur={wheelChange} userClose={userClose} room={query.space} />)
                        }
                    </Container> */}
                    <img src={img_big} alt="background" />
                    
                </TransformComponent>
            </TransformWrapper>
        </div>
        <Tip />
    </div>
    );
    // return (
    // <div data-v-12a888fb="" className="space">
    //     <Navbar onSetUserClose={handleSetUserClose} videoObj={videoObj} imageObj={imageObj} query={query} /> 
    //     <div id='foreground_div' style={{position: 'relative', overflow: 'hidden', backgroundImage: `url(${img_small})`, width:'100%', height: '100%'}}>
    //         <DraggableContainer id='background_div' width={3000} height={3000} isZoom={true} background={img_big}
    //         // <DraggableContainer id='background_div' width={3200} height={1600} isZoom={true} background={img_big}
    //             onWheelChange={handleWheelChangeValue}
    //         >
                // {
                //     users.map((user) => <Screen key={user.id} curScale={wheelChange} user={user} />)
                // }
                // {
                //     videoObj.map((video) => <YoutubeUpload key={video.name} video={video} cur={wheelChange} userClose={userClose} room={query.space} />)
                // }
                // {
                //     imageObj.map((image) => <ImageUpload key={image.value} image={image} cur={wheelChange} userClose={userClose} room={query.space} />)
                // }
    //         </DraggableContainer>
    //         {
    //             users.map((user) => {
    //                 return (
    //                     <div id={'smallscreen_' + user.id} className='screen' data-tip data-for={user.id} key={user.id}
    //                         style={{width: 50, height: 50, borderRadius: '50%', position: 'absolute', left: 0, top: 0, display: 'none', 
    //                                 marginLeft:25, marginTop:25, zIndex: user.id==='me'?50:25, border: user.id==='me'?'2px solid #dcdb53':'2px solid' }} >
    //                     </div>
    //                 )
    //             })
    //         }
    //     </div>
    //     <Tip />
    // </div>
    // );
}

export default Conference
