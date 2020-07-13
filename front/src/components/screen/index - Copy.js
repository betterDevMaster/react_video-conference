import React, { useEffect, useState } from 'react'
import ReactTooltip from "react-tooltip";
// import Draggable from 'react-draggable';

import { Rnd } from "react-rnd";

import WebRTC from '../../webrtc';
import './index.css';

const currentDragObject = {obj:null, x:0, y:0, scale:1, dragStarted:false}

const Screen = React.memo(props => {
    const nodeRef = React.useRef(null)
    const screenid = 'screen_'+props.user.id 
    useEffect(() => {

        // const video = document.getElementById(props.user.stream.id);
        // if(video){
        //     window.easyrtc.setVideoObjectSrc(video, props.user.stream);
        //     if(props.user.id === 'me'){
        //         video.parentElement.removeEventListener('mousedown', dragStart);
        //         video.parentElement.addEventListener('mousedown', dragStart);
        //         video.parentElement.removeEventListener('mousemove', dragWhile);
        //         video.parentElement.addEventListener('mousemove', dragWhile);
        //         video.parentElement.removeEventListener('mouseup', dragEnd);
        //         video.parentElement.addEventListener('mouseup', dragEnd);
        //     }else{
        //         // setTimeout(onTimer, 500);
        //     }
        // }
    },[]);
    // function onTimer(){
    //     const me_ele = document.getElementById('screen_me')
    //     const ele = document.getElementById('screen_' + props.user.id)
    //     if(me_ele && ele){
    //         const screenMePos = {x: parseFloat(me_ele.style.left), y: parseFloat(me_ele.style.top)}
    //         const screenCurrObjPos = {x: parseFloat(ele.style.left), y: parseFloat(ele.style.top)}
    //         const dist = Math.max(1, Math.sqrt((screenMePos.x-screenCurrObjPos.x)*(screenMePos.x-screenCurrObjPos.x) + 
    //                                 (screenMePos.y-screenCurrObjPos.y)*(screenMePos.y-screenCurrObjPos.y)))

    //         var scale_val = Math.max(0.3, Math.min(1, 150 / (dist)))
    //         ele.style.transform = `translate(-50px, -50px) scale(${scale_val})`

    //         var vol = dist===0?1:Math.max(0, Math.min(1, Math.pow((100 / dist), 4)))
    //         if (vol < 0.01) vol = 0
            
    //         ele.firstElementChild.volume = isFinite(vol) ? vol : 1;
    //     }
    //     setTimeout(onTimer, 300)
        
    // }
     
    // const getScaleFromTransform = (transform)=>{
    //     if(!transform)
    //         return 1;
    //     const arr1 = transform.split('(');
    //     const arr2 = arr1[arr1.length-1].split(')');
    //     return parseFloat(arr2[0]);
    // }
    
    // const dragStart = (e)=>{
    //     if(e.buttons === 1 && e.button === 0){
    //         const ele = document.elementFromPoint(e.x, e.y);
    //         if(ele.tagName === 'VIDEO' && ele.parentElement.id==='screen_me'){
    //             currentDragObject.obj = ele.parentElement
    //             currentDragObject.x = e.x;
    //             currentDragObject.y = e.y;
    //             currentDragObject.dragStarted = true;
    //             // currentDragObject.scale = getScaleFromTransform(document.getElementById('videoFrame').parentElement.parentElement.style.transform)
    //             e.stopPropagation();
    //         }
    //     }
    // }
    // const dragWhile = (e)=>{
    //     if(currentDragObject.dragStarted){
    //         const x = WebRTC.getInstance().myPosition.x + (e.x - currentDragObject.x)/currentDragObject.scale
    //         const y = WebRTC.getInstance().myPosition.y + (e.y - currentDragObject.y)/currentDragObject.scale
    //         currentDragObject.obj.style.left = x + 'px';
    //         currentDragObject.obj.style.top = y + 'px';
    //         e.stopPropagation();
    //     }
    // }
    // const dragEnd = (e)=>{
    //     if(currentDragObject.dragStarted){
    //         WebRTC.getInstance().myPosition.x +=(e.x - currentDragObject.x)/currentDragObject.scale
    //         WebRTC.getInstance().myPosition.y += (e.y - currentDragObject.y)/currentDragObject.scale
    //         WebRTC.getInstance().updateMyPosition()
    //         e.stopPropagation();
    //     }
    //     currentDragObject.dragStarted = false
    // }

    const handleStart = (event) => {
        // dispatch({type: 'backgound_moving', value: {bgMoving: true} })
    }
    const handleStop = () => {        
        // realCurTime = videoRef.current.internalPlayer.getCurrentTime()
    }

    function calculateEdge(posX, posY, videoWidth, videoHeight, otherRender = false) {
        const width = document.getElementById('background_div').offsetWidth
        const height = document.getElementById('background_div').offsetHeight

        if (posX >= width/2 - videoWidth - 10)
            posX = width/2 - videoWidth - 10
        if (posX < -width/2 + 10)
            posX = -width/2 + 10
        if (posY >= height/2 - videoHeight - 60)
            posY = height/2 - videoHeight - 60
        if (posY < -height/2 + 30) // 22 is close header height
            posY = -height/2 + 30

        if (!otherRender) {
            setXPos(posX)
            setYPos(posY)
        } else {
            return {posX: posX, posY: posY}
        }
    }

    const [xPos, setXPos] = useState(180)
    const [yPos, setYPos] = useState(100)

    return (
        <>
            {/* <Draggable nodeRef={nodeRef} position={{x:-50, y:-50}} disabled scale={props.cur} >
                <div ref={nodeRef} id={screenid} data-tip data-for={props.user.id} key={props.user.id} className='screen'
                    style={{width: 100, height: 100, zIndex: props.user.id==='me'?50:25, borderRadius: '50%' }} 
                    tabIndex={0} >
                    <video className='video' id={props.user.stream.id} controls="" loop="" muted={'me' === props.user.id} ></video>
                </div>
            </Draggable> */}
            <Rnd
                size={{ width: 100,  height: 100 }}
                position={{ x: xPos, y: yPos }}
                onDragStart={(e) => handleStart(e)}
                onDragStop={(e, d) => { 
                    calculateEdge(d.x, d.y, 100, 100)
                    handleStop(e)
                }}
                scale={props.cur}   
                lockAspectRatio={true}
                enableResizing={false}
                disableDragging={props.user.id==='me' ? false: true}
            >
                <div ref={nodeRef} id={screenid} data-tip data-for={props.user.id} key={props.user.id} className='screen'
                    style={{width: 100, height: 100, zIndex: props.user.id==='me'?50:25, borderRadius: '50%' }} 
                    tabIndex={0} >
                    <video className='video' id={props.user.stream.id} controls="" loop="" muted={'me' === props.user.id} ></video>
                </div>
            </Rnd>
            <ReactTooltip id={props.user.id} type="info"
                overridePosition={ ({ left, top }) => {
                        left = left/props.cur
                        top = top/props.cur
                        return { top, left }
                    }
                }
            >
                <span>{props.user.name}</span>
            </ReactTooltip>
            
        </>
    );
})

export default Screen;