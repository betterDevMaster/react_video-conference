import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux';
import DragBox from '../draggable/DragBox'
import WebRTC from '../../webrtc';

import './index.css';

const Screen = React.memo(props => {
    const dispatch = useDispatch();
    const videoRef = useRef(null);

    useEffect(() => {
        var video = document.getElementById(props.user.stream.id);

        if (video) {
            window.easyrtc.setVideoObjectSrc(video, props.user.stream);
        }

        if (props.user.id === 'me') {
            props.onGoToFirstPosition(
                {x: props.sceneZoom ? props.user.defPosX / props.sceneZoom : props.user.defPosX, 
                    y: props.sceneZoom ? props.user.defPosY / props.sceneZoom : props.user.defPosX})
        }
    }, []);

    useEffect(() => {
        if (videoRef && videoRef.current) videoRef.current.volume = props.zoom === 0.5 ? 0 : props.zoom;
    }, [props.zoom])

    const handleDrag = (node, pos, scale) => {
        WebRTC.getInstance().updateMyPosition({x: pos.x, y: pos.y });
        dispatch({ type: 'user_position', value: { id: props.user.id, defPosX: pos.x * scale, defPosY: pos.y * scale } });

        if (props.onDrag) props.onDrag(node, props.user, pos, scale);
    }

    return (
        <DragBox
            type="circle"
            offset={props.pos}
            scale={props.sceneZoom}
            initialRect={{ 
                left: props.user.defPosX, 
                top: props.user.defPosY, 
                width: 100, 
                height: 100 }}
            zIndex={props.user.id === 'me' ? 50 : 25}
            onClickSmall={props.onClickSmall}
            onMouseMove={handleDrag}
            tip={props.user.name}
            draggable = {props.user.id === 'me' ? true : false}
            sizable = {false}
            zoom = {props.zoom ? props.zoom : 1}
            dragType='body'
        >
            <div key={props.user.id} className='screen'
                style={{
                    width: '100%', height: '100%',
                    borderRadius: '50%',
                    border: props.user.id === 'me' ? '2px solid #dcdb53' : '2px solid'
                }}
                tabIndex={0}  >
                <video
                    ref={videoRef}
                    className='video'
                    id={props.user.stream.id}
                    controls="" loop="" muted={'me' === props.user.id}
                >
                </video>
            </div>
        </DragBox>
    );
})

export default Screen;