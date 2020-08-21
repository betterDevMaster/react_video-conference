import React, { Component, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import * as qs from 'query-string';

import Navbar from '../components/navbar';
import WebRTC from '../webrtc';
import Screen from '../components/screen';
import YoutubeUpload from '../components/youtubeupload';
import ImageUpload from '../components/imageupload';
import DragContainer from '../components/draggable/DragContainer';
import ScreenShare from '../components/screenshare';

import img_small from '../images/map-small@2x.0c2a372b.png';
import img_big from '../images/map-big@2x.44a3f15c.png';

import './index.css';
import { faMousePointer } from '@fortawesome/free-solid-svg-icons';

function Conference(props) {
    const dispatch = useDispatch();
    const query = qs.parse(props.location.search);
    const users = useSelector((state) => state.users);
    const videos = useSelector((state) => state.screens.videos);
    const images = useSelector((state) => state.screens.images);
    const screenshares = useSelector((state) => state.screens.screenshares);
    const [userClose, setUserClose] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [mePos, setMePos] = useState({ x:0, y: 0 });
    const [sceneZoom, setSceneZoom] = useState(1);

    // console.log('Conference : screenshare: ------------- ', screenshares)
    useEffect(() => {
        WebRTC.getInstance().startConference(dispatch, null, query.space, query.uname);
    }, []);
 
    const handleSetUserClose = (value) => {
        setUserClose(value);
    };
    const handleDrag = (dom, pos) => {
        setPos(pos);
    };
    const handleZoom = (dom, zoom, position) => {
        setSceneZoom(zoom);
        setPos(position);
    };
    const handleClickSmall = (smallPos) => {
        const stage = document.getElementById('stage');
        setPos({
            x: Math.max(Math.min(0, stage.clientWidth / 2 - smallPos.x)),
            y: Math.min(0, stage.clientHeight / 2 - smallPos.y)
        });
    };
    const handleGoToFirstPosition = (pos) => {
        handleClickSmall(pos);
    };
    const handleDragMe = (node, me, pos, scale) => {
        setMePos(pos);
    };
    const calcZoom = (user) => {
        if (user.id === 'me' && mePos.x === 0 && mePos.y === 0) {
            setMePos({ x: user.defPosX, y: user.defPosY });
        } 
        if (user.id !== 'me') { 
            const dist = Math.max(
                1,
                Math.sqrt((mePos.x - user.defPosX) * (mePos.x - user.defPosX) + (mePos.y - user.defPosY) * (mePos.y - user.defPosY))
            );
            const scaleVal = Math.max(0.5, Math.min(1, 150 / dist));
            return scaleVal;
        }
        return 1;
    };
    const calcVolume = (video) => {
        const dist = getDistanceByRectAndPosition(
            {
                left: video.defX - video.width / 2,
                right: video.defX + video.width / 2,
                top: video.defY - video.height / 2,
                bottom: video.defY + video.height / 2
            }, mePos
        );

        const volume = dist === 0 ? 1 : Math.max(0, Math.min(1, Math.pow(100 / dist, 4)));
        return volume < 0.01 ? 0 : volume;
    }
    const getDistanceByPosition = (p1, p2) => {
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    };
    const getDistanceByRectAndPosition = (rect, pos) => {
        let distance = -1;
        if (pos.x > rect.left && pos.x < rect.right) {
            distance = Math.min(Math.abs(pos.y - rect.top), Math.abs(pos.y - rect.bottom));
        }
        if (pos.y > rect.top && pos.y < rect.bottom) {
            if (distance === -1) distance = Math.min(Math.abs(pos.x - rect.left), Math.abs(pos.x - rect.right));
            else distance = 0;
        }
        if (distance >= 0) return distance;
        return Math.min(
            Math.min(
                getDistanceByPosition(pos, { x: rect.left, y: rect.top }),
                getDistanceByPosition(pos, { x: rect.left, y: rect.bottom })
            ),
            Math.min(
                getDistanceByPosition(pos, { x: rect.right, y: rect.top }),
                getDistanceByPosition(pos, { x: rect.right, y: rect.bottom })
            )
        );
    };
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
                <Navbar onSetUserClose={handleSetUserClose} videos={videos} images={images} query={query} />
                <DragContainer
                    // debug
                    fitParent
                    background={img_big}
                    width={WebRTC.getInstance().width}
                    height={WebRTC.getInstance().height}
                    position={pos}
                    sceneZoom={sceneZoom}
                    onMove={handleDrag}
                    onZoom={handleZoom}
                    maxZoom={3}
                    minZoom={0.2}
                >
                    {users.map((user) => (
                        <Screen
                            key={user.id}
                            pos={pos}
                            sceneZoom={sceneZoom}
                            zoom={calcZoom(user)}
                            user={user}
                            onClickSmall={handleClickSmall}
                            onDrag={user.id === 'me' ? handleDragMe : null}
                            onGoToFirstPosition={handleGoToFirstPosition}
                        />
                    ))}
                    {videos.map((video) => (
                        <YoutubeUpload
                            key={video.name}
                            video={video}
                            pos={pos}
                            mePos={mePos}
                            sceneZoom={sceneZoom}
                            userClose={userClose}
                            room={query.space}
                            volume={calcVolume(video)}
                        />
                    ))}
                    {images.map((image) => (
                        <ImageUpload
                            key={image.value}
                            image={image}
                            pos={pos}
                            sceneZoom={sceneZoom}
                            userClose={userClose}
                            room={query.space}
                        />
                    ))}
                    {screenshares.map((screenshare) => (
                        <ScreenShare
                            key={screenshare.name}
                            screenshare={screenshare}
                            pos={pos}
                            sceneZoom={sceneZoom}
                            room={query.space}
                        />
                    ))}
                </DragContainer>
            </div>
        </div>
    );
}

export default Conference;
