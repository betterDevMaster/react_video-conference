import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import YouTube from 'react-youtube';
import DragBox from '../draggable/DragBox'

import './index.css';
import MicMute1 from '../../images/mic-mute.svg'
import MicMute0 from '../../images/mic-mute1.svg'
import closevideo from '../../images/closevideo.svg'
import WebRTC from '../../webrtc';

import Utils from '../../utils/position';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const YoutubeUpload = React.memo(props => {
    const videoRef = useRef(null);
    const dbRef = useRef(null);
    const users = useSelector((state) => state.users);
    
    const videoid = 'video_'+props.video.value 
    const dispatch = useDispatch();
    const [youtubeMute, setYoutubeMute] = useState('off')
    // const [realCurTime, setRealCurTime] = useState(0)
    const [userMe, setUserMe] = useState({})
    // const [isPlayOrDrag, setIsPlayOrDrag] = useState({ videoPlay: false})
    const youtubeMuteAudio = 'youtubeAudio_'+props.video.value
    var _videoPlay = false
    var realCurTime = 0;
    const opts = {
        playerVars: {
            // autoplay: 1,
            mute: 0,
            // origin: 'https://webrtc.bcisummit.com',
            origin: 'http://localhost:3000',
            enablejsapi: 1,
            loop: 1
        }
    };

    useEffect(() => {
        videoRef.current.internalPlayer.unMute()
    }, [])

    useEffect(() => {
        for (const _user of users) {
            if (_user.id === 'me' && dbRef && dbRef.current) {
                setUserMe(_user)
                console.log('users -----------', _user, props.video.videoplay, props.video.volume, props.video.curtime)
                if (props.onDrag) props.onDrag(dbRef.current.myRef.current, props.video, props.video.videoplay, props.video.curtime, userMe);
            }
        }
    }, [users])

    useEffect(() => {
        if (videoRef && videoRef.current) {
            console.log('videoplay -----------', youtubeMute, props.video.videoplay, props.video.volume, props.video.curtime)
            videoRef.current.internalPlayer.setVolume(props.video.volume * 100 * (youtubeMute ==='off' ? 1: 0));
            if (props.video.videoplay) {
                videoRef.current.internalPlayer.seekTo(props.video.curtime)
                videoRef.current.internalPlayer.playVideo()
            }
            else 
                videoRef.current.internalPlayer.pauseVideo()
        }
    }, [props.video.videoplay])

    useEffect(() => {
        if (videoRef && videoRef.current) {
            console.log('volume -----------', youtubeMute, props.video.videoplay, props.video.volume, props.video.curtime)
            videoRef.current.internalPlayer.setVolume(props.video.volume * 100 * (youtubeMute ==='off' ? 1: 0));
        }
    }, [props.video.volume])

    useEffect(() => {
        if (videoRef && videoRef.current) {
            console.log('youtubeMute -----------', youtubeMute, props.video.videoplay, props.video.volume, props.video.curtime)
            videoRef.current.internalPlayer.setVolume(props.video.volume * 100 * (youtubeMute ==='off' ? 1: 0));
        }
    }, [youtubeMute])

    const handleDragMeForYoutube = (node, pos, scale) => {
        if (props.onDrag) props.onDrag(node, props.video, props.video.videoplay, realCurTime, userMe);
    }
    const handleClose = (value) => {
        dispatch({type: 'youtube_remove', name: value})
        WebRTC.getInstance().youtubeRemove({name: value})
    }
    const handleYouTubePlay = (event) => {
        if (props.onDrag) props.onDrag(dbRef.current.myRef.current, props.video, true, realCurTime, userMe);
    }
    const handleYouTubePause = (event) => {
        if (props.onDrag) props.onDrag(dbRef.current.myRef.current, props.video, false, realCurTime, userMe);
    }
    const handleStateChange = (e) => {    
        const currentTime = videoRef.current.internalPlayer.getCurrentTime()
        currentTime.then(function(result) {
            realCurTime = result
        })
    }
    const toggleChange = (event)=>{
        if (youtubeMute === 'on') {
            if (videoRef.current) {
                document.getElementById(youtubeMuteAudio).src = MicMute1
                setYoutubeMute('off')
            }
        }
        else {
            if (videoRef.current) {
                document.getElementById(youtubeMuteAudio).src = MicMute0
                setYoutubeMute('on')
            }
        }
        console.log('toogleChange --------', youtubeMute)
        videoRef.current.internalPlayer.setVolume(props.video.volume * 100 * (youtubeMute ==='off' ? 1: 0));
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
                        onPlay={props.video.id==='me'?(e)=>handleYouTubePlay(e): null}
                        onPause={props.video.id==='me'?(e)=>handleYouTubePause(e):null}
                        onStateChange={(e)=>handleStateChange(e)}
                    />
                </div>
                { props.video.id==='me' ? null :
                    <img data-v-c1f79ed4="" id={youtubeMuteAudio} svg-inline="" src={MicMute1} className="mute" 
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