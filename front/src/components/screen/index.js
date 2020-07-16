import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import ReactTooltip from "react-tooltip";
import { Rnd } from "react-rnd";

import WebRTC from '../../webrtc';
import './index.css';

import Utils from '../../utils/position';

// const currentDragObject = {obj:null, x:0, y:0, scale:1, dragStarted:false}

const Screen = React.memo(props => {
    const screenid = 'screen_'+props.user.id 
    const smallScreenId = 'smallscreen_'+props.user.id 
    const nodeRef = React.useRef(null);

    const [xPos, setXPos] = useState(props.user.defPosX)
    const [yPos, setYPos] = useState(props.user.defPosY)
    const [firstPosX, setFirstPosX] = useState(0)
    const [firstPosY, setFirstPosY] = useState(0)

    var ele_Screen = document.getElementById('screen_' + props.user.id)

    useEffect(() => {
        var video = document.getElementById(props.user.stream.id);

        if(video){
            window.easyrtc.setVideoObjectSrc(video, props.user.stream);
            setTimeout(onTimer, 100);
        }
    },[]);
    const setVolumeForNeighborhood = () => {
        const me_ele = document.getElementById('screen_me')
        const ele = document.getElementById('screen_' + props.user.id)

        if(me_ele && ele){
            const screenMePos = Utils.getPositionFromTransform(me_ele.parentNode);
            const screenCurrObjPos = Utils.getPositionFromTransform(ele.parentNode);

            const dist = Math.max(1, Math.sqrt((screenMePos.x-screenCurrObjPos.x)*(screenMePos.x-screenCurrObjPos.x) + 
                                    (screenMePos.y-screenCurrObjPos.y)*(screenMePos.y-screenCurrObjPos.y)))

            var scale_val = Math.max(0.3, Math.min(1, 150 / (dist)))
            ele.parentNode.style.transform = `translate(${screenCurrObjPos.x}px, ${screenCurrObjPos.y}px) scale(${scale_val})`
        
            var vol = dist===0?1:Math.max(0, Math.min(1, Math.pow((100 / dist), 3)))
            if (vol < 0.01) vol = 0
            
            // console.log('user volume----------', scale_val, vol, ele.firstElementChild)
            if (ele.firstElementChild)
                ele.firstElementChild.volume = isFinite(vol) ? vol : 1;
            // else 

            // console.log('user volume----------', vol, ele.firstElementChild) 
        }
    }
    const setScaleByPosition = ()=>{
        const ele = document.getElementById('screen_' + props.user.id)
        const eleBack = document.getElementById('background_div');
        const eleFore = document.getElementById('foreground_div');

        if(ele && !window.dragStart) {
            const posMe = Utils.getPositionFromTransform(ele.parentNode);
            const posBack = Utils.getPositionFromStyle(eleBack);
            const videoScreen = document.getElementById(props.user.stream.id);
            const eleSmall = document.getElementById(smallScreenId)

            const viewRect = {   
                left: -posBack.x, 
                top: -posBack.y, 
                right:-posBack.x + eleFore.clientWidth/document.g_currScale, 
                bottom: -posBack.y + eleFore.clientHeight/document.g_currScale
            }
            var inRect = Utils.isInRect(viewRect, posMe)
            if(!inRect){
                if (eleSmall.childNodes.length === 0) {
                    eleSmall.appendChild(videoScreen);

                    eleSmall.style.display = 'inline-block'
                    ele.parentNode.style.display = 'none';
                } 
                const smallPos = getDistanceByRectAndPosition(
                    Utils.multiplyPosition(Utils.addPosition(posMe, posBack), document.g_currScale), 
                    eleFore.clientWidth,
                    eleFore.clientHeight
                )
                Utils.setPositionOfHtmlElement(eleSmall, smallPos);

            } else {
                eleSmall.style.display = 'none'
                ele.parentNode.style.display = 'inline-block';
            
                const d = document.getElementById(screenid)
                d.appendChild(videoScreen)

            }
        }
    }
    const getDistanceByRectAndPosition = (pos, width, height)=>{
        if (pos.y < 0) pos.y = 25
        if (pos.y > height) pos.y = height - 25
        if (pos.x < 0) pos.x = 25
        if (pos.x > width) pos.x = width - 25
        return {x: pos.x-50, y: pos.y-50}
    }

    function onTimer(){
        // console.log('-------------onTimer')

        if(props.user.id !== 'me')
            setVolumeForNeighborhood();
            
        // console.log('ele_Screen-------------', ele_Screen)
        // if (ele_Screen)
        setScaleByPosition()
        setTimeout(onTimer, 50)
    }

    const handleStart = (ev, detail) => {
        window.dragStart = true
        setFirstPosX(detail.x)
        setFirstPosY(detail.y)
    }
    const handleStop = (e, detail) => {
        window.dragStart = false
        WebRTC.getInstance().myPosition.x += (detail.x - firstPosX)
        WebRTC.getInstance().myPosition.y += (detail.y - firstPosY)
        WebRTC.getInstance().updateMyPosition()
    }
    function calculateEdge(posX, posY) {
        const ele = document.getElementById('foreground_div')
        const back = document.getElementById('background_div')
        const width = ele.clientWidth
        const height = ele.clientHeight
        const pos = Utils.addPosition({x:posX, y:posY}, Utils.getPositionFromStyle(back))
        // console.log({x: posX, y: Math.max(50, Math.min(height, pos.y))} )
        
        return {x: posX, y: Math.max(50, Math.min(height, pos.y))}
    }

    if (nodeRef.current && props.user.id != 'me') {
        nodeRef.current.parentNode.style.transform = `translate(${props.user.defPosX}px, ${props.user.defPosY}px)`
    }

    return (
        <>
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
                    style={{width: 100, height: 100, borderRadius: '50%', marginLeft:-50, marginTop:-50,
                                border: props.user.id === 'me'?'2px solid #dcdb53':'2px solid' }} 
                    tabIndex={0}  >
                    <video 
                        className='video' 
                        id={props.user.stream.id} 
                        controls="" loop="" muted={'me' === props.user.id} 
                        onMouseMove={
                            (e)=>{
                                const ele = document.getElementById('div_tip')
                                ele.style.left = e.screenX + 'px'
                                ele.style.top = (e.screenY-150) + 'px'
                                ele.innerHTML = props.user.name
                                ele.style.display='inline-block'
                            }
                        }
                        onMouseOut = {
                            (e)=>{
                                document.getElementById('div_tip').style.display='none'
                            }
                        }
                    >    
                    </video>
                </div>
            </Rnd>
            
        </>
    );
})

export default Screen;