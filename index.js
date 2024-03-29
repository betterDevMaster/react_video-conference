import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import YouTube from 'react-youtube';
import DragBox from '../draggable/DragBox'

import './index.css';
import MicMute0 from '../../images/mic-mute.svg'
import MicMute1 from '../../images/mic-mute1.svg'
import closevideo from '../../images/closevideo.svg'
import WebRTC from '../../webrtc';

import Utils from '../../utils/position';

const YoutubeUpload = React.memo(props => {
    const videoRef = useRef(null);
    const videoid = 'video_'+props.video.value 
    const dispatch = useDispatch();

    const [youtubeMute, setYoutubeMute] = useState('off')
    const youtubeMuteAudio = 'youtubeAudio_'+props.video.value
    
    var realCurTime

    const opts = {
        origin: 'https://webrtc.bcisummit.com',
        playerVars: {
            autoplay:0,
            muted:0
        }
    };
    
    const handleYoutubeDrag = (node, pos, scale) => {
        youtubeHandle(node, pos, scale);
        // if (props.onYoutubeDrag) props.onYoutubeDrag(node, props.video, videoRef, pos, scale);
    }
    const handleYoutubeResize = (node, pos, scale) => {
        youtubeHandle(node, pos, scale)
    }

    function youtubeHandle(node, pos, scale) {
        WebRTC.getInstance().youtubePosition({ name: props.video.name, width: node.clientWidth, height: node.clientHeight, defX: pos.x, defY: pos.y })
        dispatch({type: 'youtube_position', value: { name: props.video.name, width: node.clientWidth, height: node.clientHeight, defX: pos.x, defY: pos.y } })
    }

    const getDistanceByPosition = (p1, p2)=>{
        return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y))
    }
    const getDistanceByRectAndPosition = (rect, pos)=>{
        let distance = -1;
        if(pos.x > rect.left && pos.x < rect.right){
            distance = Math.min(Math.abs(pos.y-rect.top), Math.abs(pos.y-rect.bottom))
        }
        if(pos.y > rect.top && pos.y < rect.bottom){
            if (distance === -1)
                distance = Math.min(Math.abs(pos.x-rect.left), Math.abs(pos.x-rect.right))
            else
                distance = 0;
        }
        if(distance >=0 )
            return distance;
        return Math.min(Math.min(getDistanceByPosition(pos, {x:rect.left,y:rect.top}), getDistanceByPosition(pos, {x:rect.left,y:rect.bottom})),
                        Math.min(getDistanceByPosition(pos, {x:rect.right,y:rect.top}), getDistanceByPosition(pos, {x:rect.right,y:rect.bottom})))

    }

    const handleClose = (value) => {
        dispatch({type: 'youtube_remove', name: value})
        WebRTC.getInstance().youtubeRemove({name: value})
    }

    const handleYouTubePlay = (event) => {
        realCurTime.then(function(result) {
            realCurTime = result
            dispatch({type: 'youtube_play', value: { name: props.video.name, videoplay: true, curtime: realCurTime } })
            WebRTC.getInstance().youtubePlay({ name: props.video.name, videoplay: true, curtime: realCurTime, videoplaying: true })
        })
    }
    const handleYouTubePause = (event) => {
        realCurTime.then(function(result) {
            realCurTime = result
            dispatch({type: 'youtube_play', value: { name: props.video.name, videoplay: false, curtime: realCurTime } })
            WebRTC.getInstance().youtubePlay({ name: props.video.name, videoplay: false, curtime: realCurTime, videoplaying: false })
        })
    }
    const handleStateChange = () => {        
        realCurTime = videoRef.current.internalPlayer.getCurrentTime()
    }
    const toggleChange = (event)=>{
        const ele = document.getElementById('video_' + props.video.value)

        if (youtubeMute === 'on') {
            if (videoRef.current) {
                document.getElementById(youtubeMuteAudio).src = MicMute0
                setYoutubeMute('off')
                ele.muted = 'on'
            }
        }
        else {
            if (videoRef.current) {
                document.getElementById(youtubeMuteAudio).src = MicMute1
                ele.muted = 'off'
                setYoutubeMute('on')
            }
        }
    }

    return (
        <DragBox
            type="rectangle"
            offset={ props.pos }
            scale={ props.sceneZoom }
            initialRect={{ left: props.video.defX, top: props.video.defY, width: props.video.width, height: props.video.height }}
            zIndex={ props.video.id === 'me' ? 10 : 5 }
            onMouseMove={handleYoutubeDrag}
            onResize={handleYoutubeResize}
            draggable = { props.video.id === 'me' }
            sizable = { props.video.id === 'me' ? true : false } 
            aspect
        >
            <div data-v-c1f79ed4="" data-v-6e496afa="" data-v-7e3fe256="" key={props.video.id} id={videoid}
                className="youtube-el" style={{width:'100%'}} style={{ zIndex: props.video.id==='me'?10:5 }}>
                <div data-v-a995c326="" data-v-c1f79ed4="" className="header pointer hidden" >
                    <div data-v-a995c326="" className="title" >Pinned by {props.video.username}</div>
                    {props.video.id==='me' &&
                        <div onClick={() => handleClose(props.video.name)} >
                            <img data-v-6a2f6b36 className="close" src={closevideo} alt='closevideo.svg' />
                        </div>
                    }
                </div>
                <div data-v-c1f79ed4="" className={`player ${props.video.id==='me'?null:'pointer-events-none'}`} >
                    <YouTube
                        ref={videoRef}
                        videoId={props.video.value}
                        id={videoid}
                        opts={opts}
                        onPlay={props.video.id==='me'?(e)=>handleYouTubePlay(e): null}
                        onPause={props.video.id==='me'?(e)=>handleYouTubePause(e):null}
                        onStateChange={(e)=>handleStateChange(e)}
                    />
                </div>
                { props.video.id==='me' ? null :
                    <img data-v-c1f79ed4="" id={youtubeMuteAudio} svg-inline="" src={MicMute0} className="mute" 
                        onClick={(e)=>toggleChange(e)} alt="youtubeAudio"></img>
                }
            </div>
        </DragBox>
    );

    // const nodeRef = React.useRef(null);
    // const videoRef = useRef(null);
    // const dispatch = useDispatch();
    // const [youtubeMute, setYoutubeMute] = useState('off')

    // const youtubeMuteAudio = 'youtubeAudio_'+props.video.value 
    // const videoid = 'video_'+props.video.value 

    // var realCurTime

    // useEffect(() => {
    //     setTimeout(onTimer, 500);
    // },[]);
    // const getDistanceByPosition = (p1, p2)=>{
    //     return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y))
    // }
    // const getDistanceByRectAndPosition = (rect, pos)=>{
    //     let distance = -1;
    //     if(pos.x > rect.left && pos.x < rect.right){
    //         distance = Math.min(Math.abs(pos.y-rect.top), Math.abs(pos.y-rect.bottom))
    //     }
    //     if(pos.y > rect.top && pos.y < rect.bottom){
    //         if (distance === -1)
    //             distance = Math.min(Math.abs(pos.x-rect.left), Math.abs(pos.x-rect.right))
    //         else
    //             distance = 0;
    //     }
    //     if(distance >=0 )
    //         return distance;
    //     return Math.min(Math.min(getDistanceByPosition(pos, {x:rect.left,y:rect.top}), getDistanceByPosition(pos, {x:rect.left,y:rect.bottom})),
    //                     Math.min(getDistanceByPosition(pos, {x:rect.right,y:rect.top}), getDistanceByPosition(pos, {x:rect.right,y:rect.bottom})))

    // }
    // function onTimer(){
    //     const me_ele = document.getElementById('screen_me')
    //     const ele = document.getElementById('video_' + props.video.value)

    //     if(me_ele && ele){
    //         const screenMePos = Utils.getPositionFromTransform(me_ele.parentElement);
    //         const videoPos = Utils.getPositionFromTransform(ele.parentNode);

    //         const width = ele.parentNode.clientWidth
    //         const height = ele.parentNode.clientHeight

    //         const dist = getDistanceByRectAndPosition({left: videoPos.x, 
    //                                                    right: videoPos.x + width, 
    //                                                    top: videoPos.y,
    //                                                    bottom: videoPos.y + height}, 
    //                                                    screenMePos)
    //         var vol = dist===0?1:Math.max(0, Math.min(1, Math.pow((100 / dist), 4)))
    //         if (vol < 0.01) vol = 0
            
    //         // console.log("distance: ", dist, screenMePos, videoPosArr, width, height, vol* 100 * (ele.muted==='on' || ele.muted===undefined? 1: 0))
    //         if (videoRef && videoRef.current) {
    //             videoRef.current.internalPlayer.setVolume(vol* 100 * (ele.muted==='on' || ele.muted===undefined? 1: 0));
    //         }
    //     }
        
    //     setTimeout(onTimer, 1000)
    // }
    // const handleClose = (value) => {
    //     dispatch({type: 'youtube_remove', name: value})
    //     WebRTC.getInstance().youtubeRemove({name: value})
    // }
    // const handleDragStart = (e, detail) => {
    //     dispatch({type: 'backgound_moving', value: true })
    // }
    // const handleDragStop = (x, y, width, height) => {
    //     dispatch({type: 'backgound_moving', value: false })

    //     WebRTC.getInstance().youtubePosition({transform: nodeRef.current.parentNode.style.transform, name: props.video.name, width: width, height: height, defX: x, defY: y})
    //     dispatch({type: 'youtube_position', value: { transform: nodeRef.current.parentNode.style.transform, name: props.video.name, width: width, height: height, defX: x, defY: y } })
    // }
    // const handleStateChange = () => {        
    //     realCurTime = videoRef.current.internalPlayer.getCurrentTime()
    // }
    // const handleYouTubePause = (event) => {
    //     realCurTime.then(function(result) {
    //         realCurTime = result
    //         dispatch({type: 'youtube_play', value: { name: props.video.name, videoplay: false, curtime: realCurTime } })
    //         WebRTC.getInstance().youtubePlay({ name: props.video.name, videoplay: false, curtime: realCurTime, videoplaying: false })
    //     })
    // }
    // const handleYouTubePlay = (event) => {
    //     realCurTime.then(function(result) {
    //         realCurTime = result
    //         dispatch({type: 'youtube_play', value: { name: props.video.name, videoplay: true, curtime: realCurTime } })
    //         WebRTC.getInstance().youtubePlay({ name: props.video.name, videoplay: true, curtime: realCurTime, videoplaying: true })
    //     })
    // }
    // const toggleChange = (event)=>{
    //     const ele = document.getElementById('video_' + props.video.value)

    //     if (youtubeMute === 'on') {
    //         if (videoRef.current) {
    //             document.getElementById(youtubeMuteAudio).src = MicMute0
    //             setYoutubeMute('off')
    //             ele.muted = 'on'
    //         }
    //     }
    //     else {
    //         if (videoRef.current) {
    //             document.getElementById(youtubeMuteAudio).src = MicMute1
    //             ele.muted = 'off'
    //             setYoutubeMute('on')
    //         }
    //     }
    // }
    // function calculateEdge(posX, posY, vdoWidth, vdoHeight) {
    //     if (posX >= Utils.width() - vdoWidth - 10)
    //         posX = Utils.width() - vdoWidth - 10
    //     if (posX < 10)
    //         posX = 10
    //     if (posY >= Utils.height() - vdoHeight - 10)
    //         posY = Utils.height() - vdoHeight - 10
    //     if (posY < 30) // 22 is close header height
    //         posY = 30

    //     return {x: posX, y: posY}
    // }
    // if (props.video.id != 'me' && videoRef.current) {
    //     if (props.video.videoplay && props.video.videoplaying) {
    //         videoRef.current.internalPlayer.unMute()

    //         dispatch({type: 'youtube_play', value: { name: props.video.name, videoplay: true, curtime: realCurTime, videoplaying: false } })
    //         WebRTC.getInstance().youtubePlay({ name: props.video.name, videoplay: true, curtime: realCurTime, videoplaying: false })
    //         videoRef.current.internalPlayer.seekTo(props.video.curtime)
    //         videoRef.current.internalPlayer.playVideo()
    //     } else if (!props.video.videoplay && !props.video.videoplaying){
    //         videoRef.current.internalPlayer.pauseVideo()
    //     }
    // }
    // if (nodeRef.current && !props.video.transform && props.video.defX) {
    //     nodeRef.current.parentNode.style.transform = `translate(${props.video.defX}px, ${props.video.defY}px)`
    // }
    // if (nodeRef.current && props.video.transform) {
    //     nodeRef.current.parentNode.style.width = props.video.width + 'px';
    //     nodeRef.current.parentNode.style.height = props.video.height + 'px';

    //     var string = props.video.transform 
    //     var numbers = string.match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
    //     var { x, y } = calculateEdge(numbers[0], numbers[1], props.video.width, props.video.height)
    //     nodeRef.current.parentNode.style.transform = `translate(${x}px, ${y}px)`

    //     props.video.defX = x
    //     props.video.defY = y
    // }

    // console.log(props.video)
    // const opts = {
    //     origin: 'https://webrtc.bcisummit.com',
    //     playerVars: {
    //         autoplay:0,
    //         muted:0
    //     }
    // };

    // return (
    //     <Rnd
    //         noderef={nodeRef}
    //         size={{ width: props.video.width,  height: props.video.height }}
    //         position={{ x: props.video.defX, y: props.video.defY }}
    //         scale={props.curScale}   
    //         lockAspectRatio={true}
    //         style = {{zIndex: props.video.id==='me'?10:5}}
    //         disableDragging={props.video.id==='me' ? false: true}
    //         enableResizing={{ top:false, right:false, bottom:false, left:false, 
    //             topRight:props.video.id==='me' ? true : false, 
    //             bottomRight:props.video.id==='me' ? true : false, 
    //             bottomLeft:props.video.id==='me' ? true : false, 
    //             topLeft:props.video.id==='me' ? true : false }}
    //         onDragStart={(e, d) => {handleDragStart(e, d)}}
    //         onDragStop={(e, d) => { 
    //             const posArr = calculateEdge(d.x, d.y, props.video.width, props.video.height)
    //             handleDragStop(posArr.x, posArr.y, props.video.width, props.video.height)
    //         }}
    //         onResizeStop={(e, direction, refval, delta, position) => {
    //             var resizeWidth = parseInt(refval.style.width.match(/\d+/)[0]) // after resizing, remove 'px' string
    //             var resizeHeight = parseInt(refval.style.height.match(/\d+/)[0]) // after resizing, remove 'px' string
    //             handleDragStop(props.video.defX, props.video.defY, resizeWidth, resizeHeight)
    //         }}
    //     >
    //         <div data-v-c1f79ed4="" data-v-6e496afa="" data-v-7e3fe256="" ref={nodeRef} key={props.video.id} id={videoid}
    //             className="youtube-el" style={{width:'100%'}} style={{ zIndex: props.video.id==='me'?10:5 }}>
    //             <div data-v-a995c326="" data-v-c1f79ed4="" className="header pointer hidden" >
    //                 <div data-v-a995c326="" className="title" >Pinned by {props.video.username}</div>
    //                 {props.video.id==='me' &&
    //                     <div onClick={() => handleClose(props.video.name)} >
    //                         <img data-v-6a2f6b36 className="close" src={closevideo} alt='closevideo.svg' />
    //                     </div>
    //                 }
    //             </div>
    //             <div data-v-c1f79ed4="" className={`player ${props.video.id==='me'?null:'pointer-events-none'}`} >
    //                 <YouTube
    //                     ref={videoRef}
    //                     videoId={props.video.value}
    //                     id={videoid}
    //                     opts={opts}
    //                     onPlay={props.video.id==='me'?(e)=>handleYouTubePlay(e): null}
    //                     onPause={props.video.id==='me'?(e)=>handleYouTubePause(e):null}
    //                     onStateChange={(e)=>handleStateChange(e)}
    //                 />
    //             </div>
    //             { props.video.id==='me' ? null :
    //                 <img data-v-c1f79ed4="" id={youtubeMuteAudio} svg-inline="" src={MicMute0} className="mute" 
    //                     onClick={(e)=>toggleChange(e)} alt="youtubeAudio"></img>
    //             }
    //         </div>
    //     </Rnd>
    // );
})
export default YoutubeUpload;