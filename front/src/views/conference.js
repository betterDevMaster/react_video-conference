import React, { Component, useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import * as qs from 'query-string'

import Navbar from '../components/navbar';
import WebRTC from '../webrtc';
import Screen from '../components/screen';
import YoutubeUpload from '../components/youtubeupload';
import ImageUpload from '../components/imageupload';
import Tip from '../components/tip';
import DragContainer from '../components/draggable/DragContainer';
// import DragBox from '../components/draggable/DragBox'

import img_small from '../images/map-small@2x.0c2a372b.png';
import img_big from '../images/map-big@2x.44a3f15c.png';

import './index.css';
import Utils from "../utils/position";

function Conference(props) {
    useEffect(() => {
        WebRTC.getInstance().startConference(dispatch, null, query.space, query.uname, 2);
    }, [])

    const dispatch = useDispatch()
    const query = qs.parse(props.location.search);
    const users = useSelector(state => state.users);
    const videoObj = useSelector(state => state.screens.videos);
    const imageObj = useSelector(state => state.screens.images);
    const [userClose, setUserClose] = useState(false);

    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    const handleSetUserClose = (value) => {
        setUserClose(value)
    }

    const handleDrag = (dom, pos) => {
        setPos(pos);
    };
    const handleZoom = (dom, zoom, pos) => {
        setZoom(zoom);
        setPos(pos);
    };
    const handleClickSmall = (smallPos) => {
        const stage = document.getElementById('stage');
        setPos({
            x: Math.max(Math.min(0, stage.clientWidth / 2 - smallPos.x)),
            y: Math.min(0, stage.clientHeight / 2 - smallPos.y)
        })
    }
    const handleDragMe = (me, pos) => {
        users.forEach(user => {
            if (user !== me) {
                const dist = Math.max(1, Math.sqrt((pos.x - user.defPosX) * (pos.x - user.defPosX) +
                    (pos.y - user.defPosY) * (pos.y - user.defPosY)))
                const scaleVal = Math.max(0.3, Math.min(1, 150 / (dist)))

                WebRTC.getInstance().updateMyPosition(pos, scaleVal)
                dispatch({ type: 'user_position', value: { id: user.id, zoom: scaleVal } })
            }
        });
    }
    
    const handleDragYoutubeMe = (me, pos) => {
        users.forEach(user => {
            if (user !== me) {
                const dist = Math.max(1, Math.sqrt((pos.x - user.defPosX) * (pos.x - user.defPosX) +
                    (pos.y - user.defPosY) * (pos.y - user.defPosY)))
                const scaleVal = Math.max(0.3, Math.min(1, 150 / (dist)))

                WebRTC.getInstance().updateMyPosition(pos, scaleVal)
                dispatch({ type: 'user_position', value: { id: user.id, zoom: scaleVal } })
            }
        });
    }

    const handleDragImageMe = (me, pos) => {
        users.forEach(user => {
            if (user !== me) {
                const dist = Math.max(1, Math.sqrt((pos.x - user.defPosX) * (pos.x - user.defPosX) +
                    (pos.y - user.defPosY) * (pos.y - user.defPosY)))
                const scaleVal = Math.max(0.3, Math.min(1, 150 / (dist)))

                WebRTC.getInstance().updateMyPosition(pos, scaleVal)
                dispatch({ type: 'user_position', value: { id: user.id, zoom: scaleVal } })
            }
        });
    }

    return (
        <div className="App">
            <div
                id="stage"
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundImage: `url(${img_small})`,
                    width: '100vw',
                    height: '100vh',
                    left: 0,
                    top: 0
                }}
            >
                <Navbar onSetUserClose={handleSetUserClose} videoObj={videoObj} imageObj={imageObj} query={query} />
                <DragContainer
                    // debug
                    fitParent
                    background={img_big}
                    width={3000}
                    height={2000}
                    position={pos}
                    zoom={zoom}
                    onMove={handleDrag}
                    onZoom={handleZoom}
                    maxZoom={3}
                    minZoom={0.2}
                >
                    {
                        users.map((user) => 
                            <Screen 
                                key={user.id} 
                                pos={pos} 
                                zoom={zoom} 
                                user={user} 
                                onClickSmall={handleClickSmall} 
                                onDrag={handleDragMe} 
                            />
                        )
                    }
                    {
                        videoObj.map((video) => 
                            <YoutubeUpload 
                                key={video.name} 
                                video={video} 
                                pos={pos} 
                                zoom={zoom} 
                                userClose={userClose} 
                                room={query.space}
                                onDrag={handleDragYoutubeMe} 
                            />
                        )
                    }
                    {
                        imageObj.map((image) => 
                            <ImageUpload 
                                key={image.value} 
                                image={image} 
                                pos={pos} 
                                zoom={zoom} 
                                userClose={userClose} 
                                room={query.space} 
                                onDrag={handleDragImageMe} 
                            />
                        )
                    }
                </DragContainer>
            </div>
            <Tip />
        </div>
    );
}

export default Conference
