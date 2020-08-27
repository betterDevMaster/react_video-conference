import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import DragBox from '../draggable/DragBox';
import WebRTC from '../../webrtc';
import Peer from '../../RTCMulti';
import Utils from '../../utils/position';

import './index.css';

const Screen = React.memo((props) => {
    const dispatch = useDispatch();
    const videoRef = useRef(null);
    const peer = new Peer(process.env.NODE_ENV === 'production');

    useEffect(() => {
        var video = document.getElementById(props.user.stream.id);
        if (video) {
            window.easyrtc.setVideoObjectSrc(video, props.user.stream);
        }

        // console.log('props.user : -----------', props.user, peer);
        if (props.user.id === 'me' && peer._id === null) {
            props.onGoToFirstPosition({
                x: props.sceneZoom ? props.user.defPosX / props.sceneZoom : props.user.defPosX,
                y: props.sceneZoom ? props.user.defPosY / props.sceneZoom : props.user.defPosX
            });

            if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                console.error('Use google chrome!');
                return;
            }
            // Connect peer
            peer.on('open', (id) => {
                // console.log('peer open : ---------', id, peer);

                const draggableBack = document.getElementsByClassName('drag-container')[0];
                const posMe = Utils.getPositionFromStyle(draggableBack);
                const scaleMe = Utils.getValueFromAttr(draggableBack, 'curzoom').value;

                const calc_def_x = (Math.abs(-posMe.x) + Utils.width() / 2) / scaleMe;
                const calc_def_y = (Math.abs(-posMe.y) + Utils.height() / 2) / scaleMe;

                const opt = { width: 600, height: 450 };
                dispatch({
                    type: 'set_peer',
                    value: { peer: peer, id: id }
                });
                dispatch({
                    type: 'screenshare_add',
                    value: {
                        userid: 'me',
                        username: 'Me',
                        name: id,
                        width: opt.width,
                        height: opt.height,
                        defX: calc_def_x,
                        defY: calc_def_y,
                        status: 'off'
                    }
                });
                WebRTC.getInstance().screenShareAdd({
                    name: id,
                    width: opt.width,
                    height: opt.height,
                    defX: calc_def_x,
                    defY: calc_def_y,
                    status: 'off'
                });
            });
        }
    }, []);

    useEffect(() => {
        if (videoRef && videoRef.current) videoRef.current.volume = props.zoom === 0.5 ? 0 : props.zoom;
    }, [props.zoom]);

    const handleDrag = (node, pos, scale) => {
        WebRTC.getInstance().updateMyPosition({ x: pos.x, y: pos.y });
        dispatch({ type: 'user_position', value: { id: props.user.id, defPosX: pos.x * scale, defPosY: pos.y * scale } });

        if (props.onDrag) props.onDrag(node, props.user, pos, scale);
    };

    return (
        <>
            <DragBox
                type={'circle'}
                offset={props.pos}
                scale={props.sceneZoom}
                initialRect={{
                    left: props.user.defPosX,
                    top: props.user.defPosY,
                    width: 100,
                    height: 100
                }}
                zIndex={50}
                onClickSmall={props.onClickSmall}
                onMouseMove={handleDrag}
                tip={props.user.name}
                draggable={props.user.id === 'me' ? true : false}
                zoom={props.zoom ? props.zoom : 1}
                dragType={'body'}
            >
                <div
                    key={props.user.id}
                    className="screen"
                    id={props.user.id}
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: props.user.id === 'me' ? '2px solid #dcdb53' : '2px solid'
                    }}
                    tabIndex={0}
                >
                    <video
                        ref={videoRef}
                        className="video"
                        style={{ borderRadius: '50%' }}
                        id={props.user.stream.id}
                        controls=""
                        loop=""
                        muted={'me' === props.user.id}
                    ></video>
                </div>
            </DragBox>
        </>
    );
});

export default Screen;
