import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Rnd } from "react-rnd";

import './index.css';
import closeimage from '../../images/closevideo.svg'
import WebRTC from '../../webrtc';

const ImageUpload = React.memo((props) => {
    const nodeRef = React.useRef(null);
    const dispatch = useDispatch();

    const handleClose = (value) => {
        dispatch({type: 'image_remove', name: value})
        WebRTC.getInstance().imageRemove({name: value})
    }
    const handleStart = (event) => {
        dispatch({type: 'backgound_moving', value: {bgMoving: true} })
    }
    const handleStop = (e) => {
        dispatch({type: 'backgound_moving', value: {bgMoving: false} })
        WebRTC.getInstance().imagePosition({transform: nodeRef.current.parentNode.style.transform, name: props.image.name})
    }
    if (nodeRef.current && props.image.transform) {
        nodeRef.current.parentNode.style.transform = props.image.transform;
    }

    const calculateEdge = (posX, posY) => {
        const width = document.getElementById('background_div').offsetWidth
        const height = document.getElementById('background_div').offsetHeight

        if (posX >= width - cWid - 10)
            posX = width - cWid - 10
        if (posX < -width + 10)
            posX = -width + 10
        if (posY >= height - cHei - 60)
            posY = height - cHei - 60
        if (posY < -height + 30) // 22 is close header height
            posY = -height + 30

        setXPos(posX)
        setYPos(posY)
    }
    
    const back_left = document.getElementById('background_div').style.left.match(/\d+(?:\.\d+)?/g).map(Number);
    const back_top = document.getElementById('background_div').style.top.match(/\d+(?:\.\d+)?/g).map(Number);
    const [cWid, setCWid] = useState(275)
    const [cHei, setCHei] = useState(183)
    const [xPos, setXPos] = useState(back_left[0] + document.getElementById('foreground_div').offsetWidth/2 - 275/2)
    const [yPos, setYPos] = useState(back_top[0] + document.getElementById('foreground_div').offsetHeight/2 - 183/2 - 22)

    return (
        <Rnd
            noderef={nodeRef}
            size={{ width: cWid,  height: cHei }}
            position={{ x: xPos, y: yPos }}
            onDragStart={(e) => handleStart(e)}
            onDragStop={(e, d) => { 
                calculateEdge(d.x, d.y)
                handleStop(e)
            }}
            scale={props.cur}   
            lockAspectRatio={true}
            style = {{zIndex: props.image.id==='me'?10:5}}
            onResizeStop={(e, direction, refval, delta, position) => {
                var resizeWidth = parseInt(refval.style.width.match(/\d+/)[0]) // after resizing, remove 'px' string
                var resizeHeight = parseInt(refval.style.height.match(/\d+/)[0]) // after resizing, remove 'px' string

                setCWid(resizeWidth)
                setCHei(resizeHeight)
            }}
            disableDragging={props.image.id==='me' ? false: true}
        >
            <div ref={nodeRef} key={props.image.id} >
                <div className="cus_header pointer hidden">
                    <div className="cus_title">Pinned by {props.image.username}</div>
                    {props.image.id==='me' &&
                        <div onClick={() => handleClose(props.image.name)} className="cus_close" >
                            <img data-v-6a2f6b36 src={closeimage} alt='closevideo.svg' />
                        </div>
                    }
                </div>
                <img src={props.image.value} className="image-frame" alt="map-transparent" />
            </div>
        </Rnd>
    );
})
export default ImageUpload;