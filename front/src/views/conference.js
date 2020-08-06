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
import Utils from '../utils/position';

import img_small from '../images/map-small@2x.0c2a372b.png';
import img_big from '../images/map-big@2x.44a3f15c.png';

import './index.css';

function Conference(props) {
    useEffect(() => {
        WebRTC.getInstance().startConference(dispatch, null, query.space, query.uname, 2);
    }, []);

    const dispatch = useDispatch();
    const query = qs.parse(props.location.search);
    const users = useSelector((state) => state.users);
    const videos = useSelector((state) => state.screens.videos);
    const images = useSelector((state) => state.screens.images);
    const [userClose, setUserClose] = useState(false);

    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    const handleSetUserClose = (value) => {
        setUserClose(value);
    };

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
        });
    };
    const handleDragMe = (node, me, pos) => {
        users.forEach((user) => {
            if (user !== me) {
                const dist = Math.max(
                    1,
                    Math.sqrt((pos.x - user.defPosX) * (pos.x - user.defPosX) + (pos.y - user.defPosY) * (pos.y - user.defPosY))
                );
                const scaleVal = Math.max(0.3, Math.min(1, 150 / dist));

                WebRTC.getInstance().updateMyPosition(pos, scaleVal);
                dispatch({ type: 'user_position', value: { id: user.id, zoom: scaleVal } });
            } 
        });
    };

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

    const handleDragMeForYoutube = (node, me, videoplay, realCurTime, userMe) => {
        const videoMe = Utils.getPositionAndSizeFromStyle(node);
        const dist = getDistanceByRectAndPosition(
            {
                left: videoMe.x - videoMe.width / 2,
                right: videoMe.x + videoMe.width / 2,
                top: videoMe.y - videoMe.height / 2,
                bottom: videoMe.y + videoMe.height / 2
            },
            {
                x: userMe.defPosX,
                y: userMe.defPosY
            }
        );

        var vol = dist === 0 ? 1 : Math.max(0, Math.min(1, Math.pow((100 / dist), 4)))
        if (vol < 0.01) vol = 0

        vol = isFinite(vol) ? vol : 1;

        console.log('handleDrag------', videoplay, vol, realCurTime, userMe)

        WebRTC.getInstance().youtubePosition({
            name: me.name,
            width: node.clientWidth,
            height: node.clientHeight,
            defX: videoMe.x,
            defY: videoMe.y,
            volume: vol,
            curtime: realCurTime,
            videoplay: videoplay,
        });
        dispatch({
            type: 'youtube_position',
            value: {
                name: me.name,
                width: node.clientWidth,
                height: node.clientHeight,
                defX: videoMe.x,
                defY: videoMe.y,
                volume: vol,
                curtime: realCurTime,
                videoplay: videoplay,
            }
        });
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
                    width={3000}
                    height={2000}
                    position={pos}
                    zoom={zoom}
                    onMove={handleDrag}
                    onZoom={handleZoom}
                    maxZoom={3}
                    minZoom={0.2}
                >
                    {users.map((user) => (
                        <Screen
                            key={user.id}
                            pos={pos}
                            zoom={zoom}
                            user={user}
                            onClickSmall={handleClickSmall}
                            onDrag={user.id === 'me' ? handleDragMe : null}
                        />
                    ))}
                    {videos.map((video) => (
                        <YoutubeUpload
                            key={video.name}
                            video={video}
                            pos={pos}
                            zoom={zoom}
                            userClose={userClose}
                            room={query.space}
                            onDrag={video.id === 'me' ? handleDragMeForYoutube : null}
                            // onYoutubeDrag={handleYoutubeDragMe}
                        />
                    ))}
                    {images.map((image) => (
                        <ImageUpload key={image.value} image={image} pos={pos} zoom={zoom} userClose={userClose} room={query.space} />
                    ))}
                </DragContainer>
            </div>
        </div>
    );
}

export default Conference;
