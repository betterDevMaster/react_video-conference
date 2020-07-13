import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import WebRTC from '../../webrtc';
import {addPoint, offsetPoint, multiplyPoint, getZoom, calcCurrentPos, setCurrentDragElement, getCurrentDragElement,attachDraggableEvent} from './dragEvent'

const DraggableContainer = (props)=>{
    useEffect(()=>{
        console.log("Attach draggable event for container")
        const ele = attachDraggableEvent(props.id, props.isZoom)
        setScreenPositionWithChildElement(ele)
        document.g_currScale = 1
    },[]);
    function attachDraggableEvent(elementId, zoomable){
        const ele = document.getElementById(elementId);
        if(ele){
            ele.removeEventListener('mousedown', onMouseDown)
            ele.addEventListener('mousedown', onMouseDown)
            ele.removeEventListener('mousemove', onMouseMove)
            ele.addEventListener('mousemove', onMouseMove)
            ele.removeEventListener('mouseup', onMouseUp)
            ele.addEventListener('mouseup', onMouseUp)
            if(zoomable){
                ele.removeEventListener('wheel', onWheel)
                ele.addEventListener('wheel', onWheel)    
            }
        }else{
            console.error("Error in getting HTML element with ID: ", elementId)
        }
        return ele
    }
    function setScreenPositionWithChildElement(ele) {
        setTimeout(function(){ 
            const eleScreen = document.getElementById('screen_me');
            // console.log('screen_me ------------- ',eleScreen, ele)
            console.log(eleScreen.offsetLeft, eleScreen.offsetTop, window.screen.availWidth, window.screen.availHeight)
            ele.style.left = (width()/2 - eleScreen.offsetLeft) + 'px'
            ele.style.top = (height()/2 - eleScreen.offsetTop - 50) + 'px'
            correctPos();
            clearTimeout()
        }, 3000);
    }
    function width(){
        return(window.innerWidth)?
        window.innerWidth:
        document.documentElement.clientWidth||document.body.clientWidth||0;
    }
    function height(){
        return(window.innerHeight)?
        window.innerHeight:
        document.documentElement.clientHeight||document.body.clientHeight||0;
    }
    // function setScale(value){
    //     document.g_currScale = value
    // }
    const onMouseDown = (e)=>{
        var ele = document.elementFromPoint(e.x, e.y);
        // console.log('onMouseDown-----------', ele)

        if (ele.nodeName === 'VIDEO') {
            ele = ele.parentElement
            // ele.videoDraggable ? console.log('me-------') : console.log('other------------')
            // if (ele.id != "screen_me")
            //     return;
        }
        if(e.buttons === 1 && e.button === 0 ){
            setCurrentDragElement(ele, e);
        }
    }
    const onMouseMove = (e)=>{
        const ele = getCurrentDragElement();
        
        // if (e.id != "background_div" || ele.nodeName != 'VIDEO') 
        //     return

        // if( ele && ele.dragInfo && e.buttons === 1 && e.button === 0 ) {
        if( ele && ele.dragInfo && e.buttons === 1 && e.button === 0 ) {
                
                // if (e.id === "background_div") {
                ele.style.zoom = document.g_currScale
                const newPos = calcCurrentPos(ele, e)
                console.log('onMouseMove-----------', newPos, document.g_currScale)
                ele.style.left = newPos.x + 'px';
                ele.style.top = newPos.y + 'px';
            // }
        } 
        correctPos();
    }
    const onMouseUp = (e)=>{
        const ele = getCurrentDragElement();

        if(ele && ele.dragInfo ){
            const newPos = calcCurrentPos(ele, e)

            ele.style.left = newPos.x + 'px';
            ele.style.top = newPos.y + 'px';

            if (ele.id != props.id) {
                WebRTC.getInstance().myPosition.x += (e.x - ele.dragInfo.firstPos.x)
                WebRTC.getInstance().myPosition.y += (e.y - ele.dragInfo.firstPos.y)
                WebRTC.getInstance().updateMyPosition()
            }
            // console.log('dragEnd---------',currentDragObject)
        }
        setCurrentDragElement(null);
        correctPos();
    }
    const correctPos = ()=>{
        const ele = document.getElementById(props.id);
        const targetX = ele.offsetLeft > 0 ?
                             0 : 
                             ele.offsetLeft < ele.parentElement.clientWidth-props.width ?
                                ele.parentElement.clientWidth-props.width:
                                ele.offsetLeft;
        const targetY = ele.offsetTop > 0 ?
                            0 : 
                            ele.offsetTop < ele.parentElement.clientHeight-props.height ?
                                ele.parentElement.clientHeight-props.height:
                                ele.offsetTop;
        ele.style.left = targetX + 'px'
        ele.style.top = targetY + 'px'
    }
    const onWheel = (e)=>{
        if(props.isZoom){
            let currZoom = getZoom(e.target)
            currZoom = e.deltaY < 0 ? Math.min(3, currZoom*1.1) : Math.max(1, currZoom*0.9)
            e.target.style.zoom = currZoom
            // setScale(currZoom);
            document.g_currScale = currZoom
            handleWheelChangeValue(currZoom) // For react Tooltip
        }
    }
    const handleWheelChangeValue = (value) => {
        props.onWheelChange(value);   
    }
    return (
        <div id={props.id}
            style={{position: 'relative', backgroundImage: `url(${props.background})`, width: props.width, height: props.height}}
        >
            {props.children}
        </div>
    )
        
}
export default DraggableContainer;