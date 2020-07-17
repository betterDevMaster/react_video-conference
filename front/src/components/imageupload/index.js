import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Rnd } from "react-rnd";

import './index.css';
import closeimage from '../../images/closevideo.svg'
import WebRTC from '../../webrtc';
import Utils from '../../utils/position';

const ImageUpload = React.memo((props) => {
    const nodeRef = React.useRef(null);
    const dispatch = useDispatch();

    const handleClose = (value) => {
        dispatch({type: 'image_remove', name: value})
        WebRTC.getInstance().imageRemove({name: value})
    }
    const handleDragStart = (e, detail) => {
        dispatch({type: 'backgound_moving', value: true })
    }
    const handleDragStop = (x, y, width, height) => {
        dispatch({type: 'backgound_moving', value: false })

        WebRTC.getInstance().imagePosition({transform: nodeRef.current.parentNode.style.transform, name: props.image.name, width: width, height: height, defX: x, defY: y})
        dispatch({type: 'image_position', value: { transform: nodeRef.current.parentNode.style.transform, name: props.image.name, width: width, height: height, defX: x, defY: y } })
    }
    function calculateEdge(posX, posY, imgWidth, imgHeight) {
        if (posX >= Utils.width() - imgWidth - 10)
            posX = Utils.width() - imgWidth - 10
        if (posX < 10)
            posX = 10
        if (posY >= Utils.height() - imgHeight - 10)
            posY = Utils.height() - imgHeight - 10
        if (posY < 30) // 22 is close header height
            posY = 30

        return {x: posX, y: posY}
    }
    if (nodeRef.current && props.image.transform) {
        nodeRef.current.parentNode.style.width = props.image.width + 'px';
        nodeRef.current.parentNode.style.height = props.image.height + 'px';
        
        var string = props.image.transform 
        var numbers = string.match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
        var { x, y } = calculateEdge(numbers[0], numbers[1], props.image.width, props.image.height)
        nodeRef.current.parentNode.style.transform = `translate(${x}px, ${y}px)`
        props.image.defX = x
        props.image.defY = y
    }

    if (nodeRef.current && !props.image.transform && props.image.defX) {
        nodeRef.current.parentNode.style.transform = `translate(${props.image.defX}px, ${props.image.defY}px)`
    }

    return (
        <Rnd
            noderef={nodeRef}
            size={{ width: props.image.width,  height: props.image.height }}
            position={{ x: props.image.defX, y: props.image.defY }}
            scale={props.curScale}   
            lockAspectRatio={true}
            enableResizing={{ top:false, right:false, bottom:false, left:false, 
                topRight:props.image.id==='me' ? true : false, 
                bottomRight:props.image.id==='me' ? true : false, 
                bottomLeft:props.image.id==='me' ? true : false, 
                topLeft:props.image.id==='me' ? true : false }}
            disableDragging={props.image.id==='me' ? false: true}
            style = {{zIndex: props.image.id==='me'?10:5}}
            onDragStart={(e, d) => {handleDragStart(e, d)}}
            onDragStop={(e, d) => { 
                const posArr = calculateEdge(d.x, d.y, props.image.width, props.image.height)
                handleDragStop(posArr.x, posArr.y, props.image.width, props.image.height)
            }}
            onResizeStop={(e, direction, refval, delta, position) => {
                var resizeWidth = parseInt(refval.style.width.match(/\d+/)[0]) // after resizing, remove 'px' string
                var resizeHeight = parseInt(refval.style.height.match(/\d+/)[0]) // after resizing, remove 'px' string
                handleDragStop(props.image.defX, props.image.defY, resizeWidth, resizeHeight)
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