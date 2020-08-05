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
    const dbRef = React.createRef();
    const [youtubeMute, setYoutubeMute] = useState('off')
    const youtubeMuteAudio = 'youtubeAudio_'+props.video.value

    var realCurTime

    const opts = {
        playerVars: {
            // autoplay: 1,
            // mute: 0,
            // origin: 'https://webrtc.bcisummit.com',
            origin: 'http://localhost:3000',
            enablejsapi: 1,
        }
    };
    // console.log('-----------', youtubeMute, props.video)

    // useEffect(() => {
    //     if (videoRef && videoRef.current) {
    //         videoRef.current.internalPlayer.unMute()
    //         videoRef.current.internalPlayer.setVolume(100);
    //     }
    // })

    useEffect(() => {
        if (videoRef && videoRef.current) {
            // console.log('useEffect -----------', youtubeMute, props.video.videoplay, props.video.curtime)

            if (props.video.videoplay) {
                videoRef.current.internalPlayer.setVolume(props.video.volume * (youtubeMute ==='on' ? 1: 0));
                videoRef.current.internalPlayer.seekTo(props.video.curtime)
                videoRef.current.internalPlayer.playVideo()
            }
            else 
                videoRef.current.internalPlayer.pauseVideo()
        }
    }, [props.video.videoplay])

    const handleDragMeForYoutube = (node, pos, scale) => {
        if (props.onDrag) props.onDrag(node, youtubeMute, props.video, true);
    }

    const handleClose = (value) => {
        dispatch({type: 'youtube_remove', name: value})
        WebRTC.getInstance().youtubeRemove({name: value})
    }
    const handleYoutubeReady = (event) => {
        event.target.unMute();
        event.target.playVideo();
    }
    const handleYouTubePlay = (event) => {
        console.log('handleYoutubePlay')
        realCurTime.then(function(result) {
            realCurTime = result
            if (props.onDrag) props.onDrag(dbRef.current.myRef.current, youtubeMute, props.video, true, result);
        })
    }
    const handleYouTubePause = (event) => {
        console.log('handleYoutubePause')
        realCurTime.then(function(result) {
            realCurTime = result
            if (props.onDrag) props.onDrag(dbRef.current.myRef.current, youtubeMute, props.video, false, result);
        })
    }
    const handleStateChange = (e) => {    
        realCurTime = videoRef.current.internalPlayer.getCurrentTime()
        videoRef.current.internalPlayer.playVideo()
    }
    const toggleChange = (event)=>{
        if (youtubeMute === 'on') {
            if (videoRef.current) {
                document.getElementById(youtubeMuteAudio).src = MicMute0
                setYoutubeMute('off')
            }
        }
        else {
            if (videoRef.current) {
                document.getElementById(youtubeMuteAudio).src = MicMute1
                setYoutubeMute('on')
            }
        }
        console.log('toogleChange ----------', youtubeMute)
        videoRef.current.internalPlayer.setVolume(props.video.volume * 100 * (youtubeMute ==='on' ? 1: 0));
    }

    return (
        <DragBox
            type="rectangle"
            ref={ dbRef }
            offset={ props.pos }
            scale={ props.zoom }
            initialRect={{ left: props.video.defX, top: props.video.defY, width: props.video.width, height: props.video.height }}
            zIndex={ props.video.id === 'me' ? 10 : 5 }
            onResize={handleDragMeForYoutube}
            // onMouseUp={handleDragMeForYoutube}
            onMouseMove={handleDragMeForYoutube}
            draggable = { props.video.id === 'me' ? true : false }
            zoom = { props.video.zoom ? props.video.zoom : 1 }
            sizable = { props.video.id === 'me' ? true : false } 
            aspect
            dragType='title'
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
                        onReady={handleYoutubeReady}
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
            {props.video.id==='me' &&
                <div onClick={() => handleClose(props.video.name)} className="cus_close" >
                    <img data-v-6a2f6b36 src={closevideo} alt='closevideo.svg' />
                </div>
            }
        </DragBox>
    );
})
export default YoutubeUpload;