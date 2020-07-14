import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import ReactTooltip from "react-tooltip";
import { Rnd } from "react-rnd";

import WebRTC from '../../webrtc';
import './index.css';

// const currentDragObject = {obj:null, x:0, y:0, scale:1, dragStarted:false}

const Screen = React.memo(props => {
    const screenid = 'screen_'+props.user.id 
    const nodeRef = React.useRef(null);

    const [xPos, setXPos] = useState(props.user.defPosX)
    const [yPos, setYPos] = useState(props.user.defPosY)
    const [firstPosX, setFirstPosX] = useState(0)
    const [firstPosY, setFirstPosY] = useState(0)

    useEffect(() => {
        const video = document.getElementById(props.user.stream.id);

        if(video){
            window.easyrtc.setVideoObjectSrc(video, props.user.stream);
            if(props.user.id != 'me'){
                setTimeout(onTimer, 100);
            }
        }
    },[]);
    function onTimer(){
        const me_ele = document.getElementById('screen_me').parentElement
        const ele = document.getElementById('screen_' + props.user.id).parentElement
        if(me_ele && ele){
            var trans_me = me_ele.style.transform 
            var pos_me = trans_me.match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
            const screenMePos = {x: pos_me[0], y: pos_me[1]}

            var trans_other = ele.style.transform 
            var pos_other = trans_other.match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
            const screenCurrObjPos = {x: pos_other[0], y: pos_other[1]}

            const dist = Math.max(1, Math.sqrt((screenMePos.x-screenCurrObjPos.x)*(screenMePos.x-screenCurrObjPos.x) + 
                                    (screenMePos.y-screenCurrObjPos.y)*(screenMePos.y-screenCurrObjPos.y)))

            var vol = dist===0?1:Math.max(0, Math.min(1, Math.pow((100 / dist), 4)))
            if (vol < 0.01) vol = 0
            
            ele.firstElementChild.volume = isFinite(vol) ? vol : 1;
            // console.log('user volume----------', vol, ele.firstElementChild) 
        }
        setTimeout(onTimer, 300)
    }


    const handleStart = (ev, detail) => {
        setFirstPosX(detail.x)
        setFirstPosY(detail.y)
    }
    const handleStop = (e, detail) => {
        WebRTC.getInstance().myPosition.x += (detail.x - firstPosX)
        WebRTC.getInstance().myPosition.y += (detail.y - firstPosY)
        WebRTC.getInstance().updateMyPosition()
    }
    const calculateEdge = (posX, posY) => {
        const width = document.getElementById('background_div').offsetWidth
        const height = document.getElementById('background_div').offsetHeight

        if (posX >= width - 100 - 10)
            posX = width - 100 - 10
        if (posX < -width + 10)
            posX = -width + 10
        if (posY >= height - 100 - 60)
            posY = height - 100 - 60
        if (posY < -height + 30) // 22 is close header height
            posY = -height + 30

        setXPos(posX)
        setYPos(posY)
    }

    if (nodeRef.current && props.user.id != 'me') {
        nodeRef.current.parentNode.style.transform = `translate(${props.user.defPosX}px, ${props.user.defPosY}px)`
    }

    console.log(document.getElementById('foreground_div'), screenid)

    return (
        <Rnd
            noderef={nodeRef}
            default={{ x: xPos, y: yPos }}
            onDragStart={(e, d) => {handleStart(e, d)}}
            onDragStop={(e, d) => { 
                calculateEdge(d.x, d.y)
                handleStop(e, d)
            }}
            scale={props.curScale}  
            style={{zIndex: props.user.id==='me'?50:25}}
            lockAspectRatio={true}
            enableResizing={false}
            disableDragging={props.user.id != 'me' ? true : false}
        >
            <div ref={nodeRef} id={screenid} data-tip data-for={props.user.id} key={props.user.id} className='screen'
                style={{width: 100, height: 100, borderRadius: '50%' }} 
                tabIndex={0}  >
                <video 
                    className='video' 
                    id={props.user.stream.id} 
                    controls="" loop="" muted={'me' === props.user.id} 
                >    
                </video>
            </div>
            <ReactTooltip id={props.user.id} type="info"
                overridePosition={ ({ left, top }) => {
                    left = left/Math.pow(props.curScale, 5)
                    top = top/Math.pow(props.curScale, 5)
                    return { top, left }
                }}
            >
                <span>{props.user.name}</span>
            </ReactTooltip>
        </Rnd>
    );
})

export default Screen;