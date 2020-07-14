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
    const handleStop = (width, height) => {
        WebRTC.getInstance().imagePosition({transform: nodeRef.current.parentNode.style.transform, name: props.image.name, width: width, height: height})
    }
    function calculateEdge(posX, posY, imgWidth, imgHeight, otherRender = false) {
        const width = document.getElementById('background_div').offsetWidth
        const height = document.getElementById('background_div').offsetHeight

        if (posX >= width - imgWidth - 10)
            posX = width - imgWidth - 10
        if (posX < 10)
            posX = 10
        if (posY >= height - imgHeight - 60)
            posY = height - imgHeight - 60
        if (posY < 30) // 22 is close header height
            posY = 30

        if (!otherRender) {
            setXPos(posX)
            setYPos(posY)
        } else {
            return {posX: posX, posY: posY}
        }
    }
    
    if (nodeRef.current && props.image.transform) {
        nodeRef.current.parentNode.style.width = props.image.width + 'px';
        nodeRef.current.parentNode.style.height = props.image.height + 'px';
        
        var string = props.image.transform 
        var numbers = string.match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
        var { posX, posY } = calculateEdge(numbers[0], numbers[1], props.image.videoWidth, props.image.videoHeight, true)
        nodeRef.current.parentNode.style.transform = `translate(${posX}px, ${posY}px)`
    }

    if (nodeRef.current && !props.image.transform && props.image.defX) {
        nodeRef.current.parentNode.style.transform = `translate(${props.image.defX}px, ${props.image.defY}px)`
    }

    const [cWid, setCWid] = useState(275)
    const [cHei, setCHei] = useState(183)
    const [xPos, setXPos] = useState(props.image.defX)
    const [yPos, setYPos] = useState(props.image.defY)

    return (
        <Rnd
            noderef={nodeRef}
            size={{ width: cWid,  height: cHei }}
            position={{ x: xPos, y: yPos }}
            scale={props.cur}   
            lockAspectRatio={true}
            enableResizing={{ top:false, right:false, bottom:false, left:false, 
                topRight:props.image.id==='me' ? true : false, 
                bottomRight:props.image.id==='me' ? true : false, 
                bottomLeft:props.image.id==='me' ? true : false, 
                topLeft:props.image.id==='me' ? true : false }}
            disableDragging={props.image.id==='me' ? false: true}
            style = {{zIndex: props.image.id==='me'?10:5}}
            onDragStop={(e, d) => { 
                calculateEdge(d.x, d.y, cWid, cHei)
                handleStop(cWid, cHei)
            }}
            onResizeStop={(e, direction, refval, delta, position) => {
                var resizeWidth = parseInt(refval.style.width.match(/\d+/)[0]) // after resizing, remove 'px' string
                var resizeHeight = parseInt(refval.style.height.match(/\d+/)[0]) // after resizing, remove 'px' string
                setCWid(resizeWidth)
                setCHei(resizeHeight)
                handleStop(resizeWidth, resizeHeight)
            }}
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