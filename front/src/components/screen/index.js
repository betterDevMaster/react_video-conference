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
        // var screenshare_video = document.getElementById('screenshare_' + props.user.stream.id);
        // console.log('screen : ', video, screenshare_video)
        console.log('screen stream : ----------', WebRTC.getInstance().screenShareStream)
        if (video) {
            window.easyrtc.setVideoObjectSrc(video, props.user.stream);
        }
        // if (screenshare_video) {
        //     window.easyrtc.setVideoObjectSrc(screenshare_video, props.user.stream);
        // }

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

    const handleScreenShareDrag = (node, pos, scale) => {
        WebRTC.getInstance().imagePosition({ name: props.image.name, width: node.clientWidth, height: node.clientHeight, defX: pos.x, defY: pos.y })
        dispatch({type: 'image_position', value: { name: props.image.name, width: node.clientWidth, height: node.clientHeight, defX: pos.x, defY: pos.y } })
    }

    const screenShareId = 'screenshare_' + WebRTC.getInstance().getUserName()

    return (
        <>
            <DragBox
                type={props.user.id===screenShareId ? 'rectangle' : 'circle'}
                offset={props.pos}
                scale={props.sceneZoom}
                initialRect={{ 
                    left: props.user.defPosX, 
                    top: props.user.defPosY, 
                    width: props.user.id===screenShareId ? 400 : 100, 
                    height: props.user.id===screenShareId ? 340 : 100 }}
                zIndex={props.user.id === 'me' ? 50 : props.user.id===screenShareId ? 20 : 25}
                onClickSmall={props.onClickSmall}
                onMouseMove={handleDrag}
                // onMouseUp={handleScreenShareDrag}
                // onResize={handleScreenShareDrag}
                tip={props.user.name}
                draggable = {props.user.id === 'me' || props.user.id===screenShareId ? true : false}
                sizable = { props.user.id===screenShareId ? true : false } 
                zoom = {props.zoom ? props.zoom : 1}
                dragType={props.user.id===screenShareId ? 'all' : 'body'}
                aspect={props.user.id===screenShareId ? true : false}
            >
                <div key={props.user.id} className='screen' id={props.user.id}
                    style={{
                        width: '100%', height: '100%',
                        borderRadius: props.user.id===screenShareId ? '0' : '50%',
                        border: props.user.id === 'me' ? '2px solid #dcdb53' : '2px solid'
                    }}
                    tabIndex={0}  >
                    <video
                        ref={videoRef}
                        className='video'
                        style={{borderRadius: props.user.id===screenShareId ? '0' : '50%',}}
                        id={props.user.stream.id}
                        controls='' loop='' muted={'me' === props.user.id}
                    >
                    </video>
                </div>
            </DragBox>
            {/* <DragBox
                type='rectangle'
                offset={ props.pos }
                scale={ props.sceneZoom }
                initialRect={{ left: props.user.defPosX, top: props.user.defPosY, width: 400, height: 320 }}
                zIndex={ 15 }
                // onMouseUp={handleImageDrag}
                // onResize={handleImageResize}
                draggable = { props.user.id === 'me' ? true : false }
                sizable = { props.user.id === 'me' ? true : false } 
                zoom = {props.zoom ? props.zoom : 1}
                aspect
                dragType='body'
            >
                <video
                    className='screenshare'
                    id={'screenshare_' + props.user.stream.id}
                    controls='' loop='' muted={'me' === props.user.id}
                >
                </video>
            </DragBox> */}
        </>
    );
})

export default Screen;