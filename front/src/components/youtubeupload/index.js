import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import YouTube from 'react-youtube';
import DragBox from '../draggable/DragBox';
import './index.css';
import MicMute1 from '../../images/mic-mute.svg';
import MicMute0 from '../../images/mic-mute1.svg';
import closevideo from '../../images/closevideo.svg';
import WebRTC from '../../webrtc';

const YoutubeUpload = React.memo((props) => {
    const videoRef = useRef(null);
    const dbRef = useRef(null);
    const dispatch = useDispatch();
    const [youtubeMute, setYoutubeMute] = useState('off');
    const youtubeMuteAudio = 'youtubeAudio_' + props.video.value;

    var realCurTime = 0;
    const opts = {
        playerVars: {
            autoplay: 1,
            origin: 'https://webrtc.bcisummit.com',
            // origin: 'http://localhost:3000/conference',
            enablejsapi: 1,
            loop: 1,
            autohide: 1,
            showinfo: 0,
        }
    };

    useEffect(() => {
        if (videoRef && videoRef.current) {
            videoRef.current.internalPlayer.unMute();
        }
    }, []);

    useEffect(() => {
        if (videoRef && videoRef.current) {
            if (props.video.videoplay) {
                videoRef.current.internalPlayer.seekTo(props.video.curtime);
                videoRef.current.internalPlayer.playVideo();
            } else videoRef.current.internalPlayer.pauseVideo();
        }
    }, [props.video.videoplay]);

    useEffect(() => {
        if (videoRef && videoRef.current) videoRef.current.internalPlayer.setVolume(props.volume * 100 * (youtubeMute === 'off' ? 1 : 0));
    }, [youtubeMute, props.volume]);

    const handleDragMeForYoutube = (node, pos, scale) => {
        dispatch({
            type: 'youtube_position',
            value: {
                name: props.video.name,
                width: node.clientWidth,
                height: node.clientHeight,
                defX: pos.x,
                defY: pos.y
            }
        });
        WebRTC.getInstance().youtubePosition({
            name: props.video.name,
            width: node.clientWidth,
            height: node.clientHeight,
            defX: pos.x,
            defY: pos.y
        });
    };
    const handleClose = (value) => {
        dispatch({ type: 'youtube_remove', name: value });
        WebRTC.getInstance().youtubeRemove({ name: value });
    };
    const handleYouTubePlay = (event) => {
        dispatch({ type: 'youtube_play', value: { name: props.video.name, videoplay: true, curtime: realCurTime } });
        WebRTC.getInstance().youtubePlay({ name: props.video.name, videoplay: true, curtime: realCurTime, videoplaying: true });
    };
    const handleYouTubePause = (event) => {
        dispatch({ type: 'youtube_play', value: { name: props.video.name, videoplay: false, curtime: realCurTime } });
        WebRTC.getInstance().youtubePlay({ name: props.video.name, videoplay: false, curtime: realCurTime, videoplaying: false });
    };
    const handleStateChange = (e) => {
        const currentTime = videoRef.current.internalPlayer.getCurrentTime();
        currentTime.then(function (result) {
            realCurTime = result;
        });
    };
    const toggleChange = () => {
        // console.log(youtubeMute)
        if (youtubeMute === 'on') {
            if (videoRef.current) {
                document.getElementById(youtubeMuteAudio).src = MicMute1;
                setYoutubeMute('off');
            }
        } else {
            if (videoRef.current) {
                document.getElementById(youtubeMuteAudio).src = MicMute0;
                setYoutubeMute('on');
            }
        }
    };

    return (
        <DragBox
            type="rectangle"
            ref={dbRef}
            offset={props.pos}
            scale={props.sceneZoom}
            initialRect={{ left: props.video.defX, top: props.video.defY, width: props.video.width, height: props.video.height }}
            zIndex={props.video.id === 'me' ? 10 : 5}
            onResize={handleDragMeForYoutube}
            onMouseUp={handleDragMeForYoutube}
            draggable={props.video.id === 'me' ? true : false}
            sizable={props.video.id === 'me' ? true : false}
            zoom={1}
            aspect
            dragType="title"
        >
            <div
                data-v-c1f79ed4=""
                data-v-6e496afa=""
                data-v-7e3fe256=""
                key={props.video.id}
                className="youtube-el"
                style={{ width: '100%', zIndex: props.video.id === 'me' ? 10 : 5 }}
            >
                <div data-v-a995c326="" data-v-c1f79ed4="" className="header pointer hidden">
                    <div data-v-a995c326="" className="title">
                        Pinned by {props.video.username}
                    </div>
                </div>

                <div data-v-c1f79ed4="" className={`player ${props.video.id === 'me' ? null : 'pointer-events-none'}`}>
                    <YouTube
                        ref={videoRef}
                        videoId={props.video.value}
                        opts={opts}
                        onPlay={props.video.id === 'me' ? (e) => handleYouTubePlay(e) : null}
                        onPause={props.video.id === 'me' ? (e) => handleYouTubePause(e) : null}
                        onStateChange={(e) => handleStateChange(e)}
                    />
                </div>
                {props.video.id === 'me' ? null : (
                    <img
                        onClick={() => toggleChange()}
                        data-v-c1f79ed4=""
                        id={youtubeMuteAudio}
                        svg-inline=""
                        src={MicMute1}
                        className="mute"
                        alt="youtubeAudio"
                    ></img>
                )}
            </div>
            {props.video.id === 'me' && (
                <div onClick={() => handleClose(props.video.name)} className="cus_close">
                    <img data-v-6a2f6b36 src={closevideo} alt="closevideo.svg" />
                </div>
            )}
            
        </DragBox>
    );
});
export default YoutubeUpload;
