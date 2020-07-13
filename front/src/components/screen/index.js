import React, { useEffect, useState } from 'react'
import ReactTooltip from "react-tooltip";
// import Draggable from 'react-draggable';

import WebRTC from '../../webrtc';
import './index.css';

const currentDragObject = {obj:null, x:0, y:0, scale:1, dragStarted:false}

const Screen = React.memo(props => {
    const nodeRef = React.useRef(null)
    const screenid = 'screen_'+props.user.id 
    useEffect(() => {
        const video = document.getElementById(props.user.stream.id);
        // console.log(video, props.user,props.user.stream.getTracks())
        if(video){
            window.easyrtc.setVideoObjectSrc(video, props.user.stream);
            // if(props.user.id === 'me'){
            //     // video.parentElement.removeEventListener('mousedown', dragStart);
            //     // video.parentElement.addEventListener('mousedown', dragStart);
            //     // video.parentElement.removeEventListener('mousemove', dragWhile);
            //     // video.parentElement.addEventListener('mousemove', dragWhile);
            //     // video.parentElement.removeEventListener('mouseup', dragEnd);
            //     // video.parentElement.addEventListener('mouseup', dragEnd);
            // }else{
            //     setTimeout(onTimer, 100);
            // }
        }
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
    //         console.log('dragStart---------',ele)
    //         if(ele.tagName === 'VIDEO' && ele.parentElement.id==='screen_me'){
    //             currentDragObject.obj = ele.parentElement
    //             currentDragObject.x = e.x;
    //             currentDragObject.y = e.y;
    //             currentDragObject.dragStarted = true;
    //             // currentDragObject.scale = getScaleFromTransform(document.getElementById('videoFrame').parentElement.parentElement.style.transform)
    //             currentDragObject.scale = props.cur
    //             e.stopPropagation();
    //         }
    //     }
    // }
    // const dragWhile = (e)=>{
    //     if(currentDragObject.dragStarted){
    //         console.log('dragWhile---------',currentDragObject)

    //         const x = WebRTC.getInstance().myPosition.x + (e.x - currentDragObject.x)/currentDragObject.scale
    //         const y = WebRTC.getInstance().myPosition.y + (e.y - currentDragObject.y)/currentDragObject.scale
    //         currentDragObject.obj.style.left = x + 'px';
    //         currentDragObject.obj.style.top = y + 'px';
    //         e.stopPropagation();
    //     }
    // }
    // const dragEnd = (e)=>{
    //     if(currentDragObject.dragStarted){
    //         console.log('dragEnd---------',currentDragObject)

    //         WebRTC.getInstance().myPosition.x +=(e.x - currentDragObject.x)/currentDragObject.scale
    //         WebRTC.getInstance().myPosition.y += (e.y - currentDragObject.y)/currentDragObject.scale
    //         WebRTC.getInstance().updateMyPosition()
    //         e.stopPropagation();
    //     }
    //     currentDragObject.dragStarted = false
    // }

    return (
        <>
            <div id={screenid} data-tip data-for={props.user.id} key={props.user.id} className='screen'
                style={{width: 100, height: 100, zIndex: props.user.id==='me'?50:25, borderRadius: '50%' }} 
                // videoDraggable={props.user.id === 'me' ? true : false}
                tabIndex={0}  >
                <video 
                    // style={{width: 100, height: 100, zIndex: props.user.id==='me'?50:25, borderRadius: '50%' }}
                    className='video' 
                    id={props.user.stream.id} 
                    controls="" loop="" muted={'me' === props.user.id} 
                >    
                </video>
            </div>
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