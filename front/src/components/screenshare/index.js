import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DragBox from '../draggable/DragBox';

import './index.css';
// import Peer from '../../RTCMulti';
import WebRTC from '../../webrtc';

const ScreenShare = React.memo((props) => {
    const dispatch = useDispatch();
    const self = useSelector((state) => state.screens.peer)
    const screenshare = useSelector((state) => state.buttons.screenshare);
    const videoShareRef = useRef(null);
    const [isNavigatorSelect, setIsNavigatorSelect] = useState(false);
    const _mediaStream = useRef(null);

    useEffect(() => {
        if (self.peer && props.screenshare.status === 'on') {
            if (props.screenshare.userid === 'me') {
                // console.log('share session : ---------', props.screenshare)
                self.peer.on('connection', (conn) => {
                    conn.on('data', (id) => {
                        if (_mediaStream.current !== null && self.peer) {
                            self.peer.call(id, _mediaStream.current);
                        }
                    });
                    conn.on('error', () => {
                        console.error('Connection with self.peer was broken');
                    });
                });

                navigator.mediaDevices
                    .getDisplayMedia({ video: { width: 1280, height: 720 } })
                    .then((mediaStream) => {
                        setIsNavigatorSelect(true);
                        if (videoShareRef.current) {
                            videoShareRef.current.srcObject = mediaStream;
                            videoShareRef.current.play();
                            _mediaStream.current = mediaStream;
                        } else {
                            console.error('No video tag reference!');
                        }
                        WebRTC.getInstance().screenShareChange({ status: props.screenshare.status === 'on', name: props.screenshare.name });

                        _mediaStream.current.getVideoTracks()[0].onended = () => {
                            dispatch({
                                type: 'screenshare_change',
                                value: { status: props.screenshare.status === 'on' ? 'off' : 'on', userid: 'me' }
                            });
                            dispatch({ type: 'click_screenshare', value: screenshare === 'on' ? 'off' : 'on' });

                            WebRTC.getInstance().screenShareChange(props.screenshare.status === 'off');
                            document.getElementById('screenshare').src = '/static/media/screenshare-off.44d81ce8.svg';
                        };
                    })
                    .catch(function (err) {
                        //log to console first
                        console.log(err);
                        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                            //required track is missing
                            console.log('NotFoundError, DevicesNotFoundError');
                        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                            //webcam or mic are already in use
                            console.log('NotReadableError, TrackStartError');
                        } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
                            //constraints can not be satisfied by avb. devices
                            console.log('OverconstrainedError, ConstraintNotSatisfiedError');
                        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                            //permission denied in browser
                            dispatch({
                                type: 'screenshare_change',
                                value: { status: 'off', userid: 'me' }
                            });
                            dispatch({ type: 'click_screenshare', value: screenshare === 'on' ? 'off' : 'on' });
                            document.getElementById('screenshare').src = '/static/media/screenshare-off.44d81ce8.svg';
                        } else if (err.name === 'TypeError' || err.name === 'TypeError') {
                            //empty constraints object
                            console.log('TypeError');
                        } else {
                            //other errors
                            console.log('Error: ' + err.name);
                        }
                    });
            } else {
                // console.log('watch session : -------------', props.screenshare, props.screenshare.name)
                const conn = self.peer.connect(props.screenshare.name);
                if (conn) {
                    conn.on('open', () => {
                        // console.log('watch open : --------- ', self.peer, self.id)
                        if (self.peer) {
                            conn.send(self.id);
                        }
                    });

                    self.peer &&
                        self.peer.on('call', (call) => {
                            call.answer();
                            call.on('stream', (incoming) => {
                                if (videoShareRef.current !== null) {
                                    videoShareRef.current.srcObject = incoming;
                                    if (incoming.active) {
                                        videoShareRef.current.play();
                                        incoming.getTracks().forEach((track) => {
                                            track.addEventListener('ended', () => {
                                                console.info('Stream ended.');
                                            });
                                        });
                                    } else {
                                        incoming.onaddtrack = () => {
                                            if (videoShareRef.current) {
                                                videoShareRef.current.play();
                                            }
                                        };
                                    }
                                }
                                console.info('Connected');
                            });

                            call.on('error', (error) => {
                                console.error(error);
                            });
                        });
                }
            }
        }

        if (props.screenshare.status === 'off' && props.screenshare.userid === 'me' && _mediaStream.current) {
            _mediaStream.current.getVideoTracks()[0].stop()
        }
    }, [props.screenshare.status, self.peer]);

    const handleScreenShareDragAndResize = (node, pos, scale) => {
        WebRTC.getInstance().screenSharePosition({
            name: props.screenshare.name,
            width: node.clientWidth,
            height: node.clientHeight,
            defX: pos.x,
            defY: pos.y
        });

        dispatch({
            type: 'screenshare_position',
            value: { name: props.screenshare.name, width: node.clientWidth, height: node.clientHeight, defX: pos.x, defY: pos.y }
        });
    };

    return props.screenshare.status === 'on' ? (
        <DragBox
            type="rectangle"
            offset={props.pos}
            scale={props.sceneZoom}
            initialRect={{
                left: props.screenshare.defX,
                top: props.screenshare.defY,
                width: props.screenshare.width,
                height: props.screenshare.height
            }}
            zIndex={props.screenshare.userid === 'me' ? 20 : 15}
            onMouseUp={handleScreenShareDragAndResize}
            onResize={handleScreenShareDragAndResize}
            draggable={props.screenshare.userid === 'me' ? true : false}
            sizable={props.screenshare.userid === 'me' ? true : false}
            zoom={props.zoom ? props.zoom : 1}
            aspect
            dragType="all"
        >
            <video
                ref={videoShareRef}
                className="screenshare"
                id={props.screenshare.name}
                controls=""
                loop=""
                style={{ display: isNavigatorSelect ? 'block' : props.screenshare.userid !== 'me' ? 'block' : 'none' }}
                muted={'me' === props.screenshare.userid}
            ></video>
        </DragBox>
    ) : null;
});
export default ScreenShare;
