import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import DragBox from '../draggable/DragBox'

import './index.css';

const Screen = React.memo(props => {
    const dispatch = useDispatch();

    useEffect(() => {
        var video = document.getElementById(props.user.stream.id);

        if (video) {
            window.easyrtc.setVideoObjectSrc(video, props.user.stream);
        }
    }, []);

    const handleDrag = (node, pos, scale) => {
        dispatch({ type: 'user_position', value: {id: props.user.id, defPosX: pos.x, defPosY: pos.y, zoom: scale } })

        if (props.onDrag) props.onDrag(node, props.user, pos, scale);
    }

    return (
        <DragBox
            type="circle"
            offset={props.pos}
            scale={props.zoom}
            initialRect={{ left: props.user.defPosX, top: props.user.defPosY, width: 100, height: 100 }}
            zIndex={props.user.id === 'me' ? 50 : 25}
            onClickSmall={props.onClickSmall}
            onMouseMove={handleDrag}
            tip={props.user.name}
            draggable = {props.user.id === 'me' ? true : false}
            sizable = {false}
            zoom = {props.user.zoom ? props.user.zoom : 1}
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
                    className='video'
                    id={props.user.stream.id}
                    controls="" loop="" muted={'me' === props.user.id}
                    volumn = {props.user.zoom}
                >
                </video>
            </div>
        </DragBox>
    );
})

export default Screen;