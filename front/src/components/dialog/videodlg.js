import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import './index.css';
import WebRTC from '../../webrtc';
import youtube from '../../images/youtube1.svg'

function VideoDialog(props){
    const dispatch = useDispatch()
    const [video, setVideo] = useState('');
    const [valid, setValid] = useState(false);

    const handleCancel = (event) => {
        window.$('#videodialog').plainModal('close')
    }

    const ytVidId = (url) => {
        var p = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/;
        return (url.match(p)) ? RegExp.$1 : false;
    }
    const getId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        return (match && match[2].length === 11)
        ? match[2]
        : null;
    }
    const handleChange = (event) => {
        var url = video.value;
        if (ytVidId(url) !== false) {
            setValid(true)
        } else {
            setValid(false)
            var element = document.getElementsByClassName("input-text");
            element[0].className += " error";
            element[0].textContent = 'Incorrect link'
        }
    }
    const handleSubmit = (event) => {
        var elementInput = document.getElementsByClassName("input-text");
        elementInput[0].textContent = 'YouTube video link'
        elementInput[0].className = elementInput[0].className.replace(/\berror\b/g, "");

        const videoId = getId(video.value);

        dispatch({type: 'youtube_add', value:{name: videoId, id: 'me', username: props.uname, value: videoId}})
        WebRTC.getInstance().youtubeAdd({videoId: videoId, name: videoId, username: props.uname})

        video.value = ''
        window.$('#videodialog').plainModal('close')
    }


    return (
        <div data-v-6a2f6b36="" data-v-6e496afa="" id ='videodialog' aria-expanded="true" data-modal="add-youtube" className="add-youtube-modal v--modal-overlay customDlgPos" >
            <div className="v--modal-background-click">
                <div className="v--modal-top-right"></div>
                <div role="dialog" aria-modal="true" className="v--modal-box modal videodialog" >
                    <img data-v-6a2f6b36 className="logo" src={youtube} alt='youtube.svg' />
                    <div data-v-6a2f6b36="" className="input-text">YouTube video link</div>
                    <input data-v-6a2f6b36="" type="text" name='video' className="url" ref={input => setVideo(input)} onChange={(e)=>handleChange(e)} />
                    <div data-v-6a2f6b36="" className="buttons">
                        <input data-v-6a2f6b36="" type="button" value="CANCEL" className="cancel" onClick={(e)=>handleCancel(e)} />
                        <input data-v-6a2f6b36="" type="submit" value="OK" className="ok" onClick={(e)=>handleSubmit(e)}
                            disabled={valid ? false : true} />
                    </div>
                </div>
            </div>
        </div>
    )

}
export default VideoDialog;