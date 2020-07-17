import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Rnd } from "react-rnd";

import WebRTC from '../../webrtc';
import './index.css';

import Utils from '../../utils/position';

// const currentDragObject = {obj:null, x:0, y:0, scale:1, dragStarted:false}

const Screen = React.memo(props => {
    const screenid = 'screen_' + props.user.id
    const smallScreenId = 'smallscreen_' + props.user.id
    const nodeRef = React.useRef(null);
    const dispatch = useDispatch()

    const [firstPosX, setFirstPosX] = useState(0)
    const [firstPosY, setFirstPosY] = useState(0)

    useEffect(() => {
        var video = document.getElementById(props.user.stream.id);

        if (video) {
            window.easyrtc.setVideoObjectSrc(video, props.user.stream);
        }
    }, []);

    function validVolumeAndScaleForNeighborhood() {
        var videoEles = document.getElementsByTagName('VIDEO')
        const screenMePos = Utils.getPositionFromTransform(videoEles[0].parentElement.parentElement);

        if (videoEles.length > 1) {
            for (var i = 1; i < videoEles.length; i++) {
                setVolumeAndScaleForNeighborhood(screenMePos, videoEles[i])
            }
        }
    }

    function setVolumeAndScaleForNeighborhood(screenMePos, videoEle) {
        if (!videoEle) return

        const screenCurrObjPos = Utils.getPositionFromTransform(videoEle.parentElement.parentElement);

        const dist = Math.max(1, Math.sqrt((screenMePos.x - screenCurrObjPos.x) * (screenMePos.x - screenCurrObjPos.x) +
            (screenMePos.y - screenCurrObjPos.y) * (screenMePos.y - screenCurrObjPos.y)))
        const scale_val = Math.max(0.3, Math.min(1, 150 / (dist)))

        console.log('-----------------', videoEle, videoEle.parentElement.parentElement)
        if (videoEle.parentElement.parentElement.className === 'App') return
        videoEle.parentElement.parentElement.style.transform = `translate(${screenCurrObjPos.x}px, ${screenCurrObjPos.y}px) scale(${scale_val})`

        var vol = dist === 0 ? 1 : Math.max(0, Math.min(1, Math.pow((100 / dist), 3)))
        if (vol < 0.01) vol = 0

        videoEle.volume = isFinite(vol) ? vol : 1;
    }
    
    const handleDragStart = (e, detail) => {
        window.dragStart = true

        dispatch({ type: 'backgound_moving', value: true })
        setFirstPosX(detail.x)
        setFirstPosY(detail.y)
    }
    const handleDrag = (e, detail) => {
        var videoEles = document.getElementsByTagName('VIDEO')
        const screenMePos = { x: detail.x, y: detail.y }
        if (videoEles.length > 1) {
            for (var i = 1; i < videoEles.length; i++) {
                setVolumeAndScaleForNeighborhood(screenMePos, videoEles[i], false)
            }
        }
    }
    const handleDragStop = (e, detail) => {
        window.dragStart = false

        dispatch({ type: 'backgound_moving', value: false })
        WebRTC.getInstance().myPosition.x += (detail.x - firstPosX)
        WebRTC.getInstance().myPosition.y += (detail.y - firstPosY)
        WebRTC.getInstance().updateMyPosition()
    }
    function calculateEdge(posX, posY) {
        if (posX >= Utils.width() - 80 - 10)
            posX = Utils.width() - 80 - 10
        if (posX < 10)
            posX = 10
        if (posY >= Utils.height() - 80 - 10)
            posY = Utils.height() - 80 - 10
        if (posY < 30) // 22 is close header height
            posY = 30

        return {x: posX, y: posY}
    }

    if (nodeRef.current && props.user.id != 'me') {
        var { x, y } = calculateEdge(props.user.defPosX, props.user.defPosY, 80, 80)
        nodeRef.current.parentNode.style.transform = `translate(${x}px, ${y}px)`
        validVolumeAndScaleForNeighborhood()
    }

    useEffect(() => {
        validVolumeAndScaleForNeighborhood()
    }, [props.curScale])

    return (
        <>
            <Rnd
                noderef={nodeRef}
                default={{ x: props.user.defPosX, y: props.user.defPosY }}
                onDragStart={(e, d) => { handleDragStart(e, d) }}
                onDrag={(e, d) => { handleDrag(e, d) }}
                onDragStop={(e, d) => {
                    calculateEdge(d.x, d.y)
                    handleDragStop(e, d)
                }}
                scale={props.curScale}
                style={{ zIndex: props.user.id === 'me' ? 50 : 25 }}
                lockAspectRatio={true}
                enableResizing={false}
                disableDragging={props.user.id != 'me' ? true : false}
            >
                <div ref={nodeRef} id={screenid} data-tip data-for={props.user.id} key={props.user.id} className='screen'
                    style={{
                        width: 80, height: 80, borderRadius: '50%', marginLeft: -40, marginTop: -40,
                        border: props.user.id === 'me' ? '2px solid #dcdb53' : '2px solid'
                    }}
                    tabIndex={0}  >
                    <video
                        className='video'
                        id={props.user.stream.id}
                        controls="" loop="" muted={'me' === props.user.id}
                        onMouseMove={
                            (e) => {
                                const ele = document.getElementById('div_tip')
                                ele.style.left = e.screenX + 'px'
                                ele.style.top = (e.screenY - 150) + 'px'
                                ele.innerHTML = props.user.name
                                ele.style.display = 'inline-block'
                            }
                        }
                        onMouseOut={
                            (e) => {
                                document.getElementById('div_tip').style.display = 'none'
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