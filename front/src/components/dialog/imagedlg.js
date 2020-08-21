import React, { useState } from 'react';
import isImageUrl from 'is-image-url'
import { useDispatch } from 'react-redux';

import './index.css';
import WebRTC from '../../webrtc';
import Utils from '../../utils/position';

function ImageDialog(props){
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
    const [uploadClick, setUploadClick] = useState(true)
    const [fileName, setFileName] = useState('')
    const [imgSize, setImgSize] = useState({width: 0, height: 0})
    const dispatch = useDispatch()

    const handleCancel = (event) => {
        event.preventDefault()
        window.$('#imagedialog').plainModal('close')
        setImagePreviewUrl(null)
    }
    const handleSubmit = (event) => {
        const imageWidth = parseInt(imgSize.width/3)
        const imageHeight = parseInt(imgSize.height/3)
        
        const draggableBack = document.getElementsByClassName('drag-container')[0]
        const posMe = Utils.getPositionFromStyle(draggableBack);
        const scaleMe = Utils.getValueFromAttr(draggableBack, 'curzoom').value;

        const calc_def_x = (Math.abs(-posMe.x) + Utils.width() / 2 ) / scaleMe
        const calc_def_y = (Math.abs(-posMe.y) + Utils.height() / 2 ) / scaleMe

        dispatch({type: 'image_add', value:{name: fileName, id: 'me', username: 'Me', value: imagePreviewUrl, width: imageWidth, height: imageHeight, defX: calc_def_x, defY: calc_def_y}})
        WebRTC.getInstance().imageAdd({imageId: imagePreviewUrl, name: fileName, width: imageWidth, height: imageHeight, defX: calc_def_x, defY: calc_def_y})

        setImagePreviewUrl(null)
        window.$('#imagedialog').plainModal('close')
    }
    const fileChangedHandler = (event) => {
        let reader = new FileReader();
        setFileName(event.target.files[0].name)
        reader.onload = function () {
            var img = new Image;
            img.onload = function() {
                setImgSize({width: img.width, height: img.height})
            };
            img.src = reader.result;
        }
        reader.onloadend = (e) => {
            setImagePreviewUrl(reader.result)
        }
        reader.readAsDataURL(event.target.files[0])
    }
    const imageExists = (image_url) => {
        var http = new XMLHttpRequest();
        http.open('HEAD', image_url, false);
        http.send();
        return http.status !== 404;
    }
    const URLChangedHandler = (event) => {
        var element = document.getElementsByClassName("label");
        if (isImageUrl(event.target.value) || imageExists(event.target.value)) {
            element[0].className = element[0].className.replace(/\berror\b/g, "");
            element[0].textContent = 'Image link'
            setImagePreviewUrl(event.target.value)
            setFileName(event.target.value)
        }
        else {
            element[0].className += " error";
            element[0].textContent = 'Incorrect link'
        }
    }
    const handleUpload = (event) => {
        setUploadClick(true)
        var elementUpload = document.getElementsByClassName("image_upload");
        var elementLink = document.getElementsByClassName("image_link");
        elementLink[0].className = elementLink[0].className.replace(/\bactive\b/g, "");
        elementUpload[0].className += " active";
    }
    const handleLink = (event) => {
        setUploadClick(false)
        var elementUpload = document.getElementsByClassName("image_upload");
        var elementLink = document.getElementsByClassName("image_link");
        elementUpload[0].className = elementUpload[0].className.replace(/\bactive\b/g, "");
        elementLink[0].className += " active";
    }
    const uploadComputer =
        <div data-v-bd733764="" className="upload-computer tab-active drop-zone" data-id="upload1" >
            <div data-v-bd733764="" className="bold">Drag and drop, paste image here</div>
            <div data-v-bd733764="" className="gray">or</div>
            <input type="file" name="file-4" id="file-4" className="inputfile" onChange={(e)=>fileChangedHandler(e)} />
            <label htmlFor="file-4">BROWSE...</label>
        </div>
    const preview =
        <div data-v-bd733764="" className="preview">
            <img className="imgPreview" src={imagePreviewUrl} height="200" alt="preview..." />
        </div>
    const linkURL =
        <div data-v-bd733764="" className="upload-link">
            <div data-v-bd733764="" className="label">Image link</div>
            <input data-v-bd733764="" type="text" className="link" onChange={(e)=>URLChangedHandler(e)} />
        </div>
    return (
        <div data-v-bd733764="" data-v-6e496afa="" id ='imagedialog' aria-expanded="true" data-modal="add-image" className="add-image-modal v--modal-overlay customDlgPos">
            <div className="v--modal-background-click">
                <div className="v--modal-top-right"></div>
                <div role="dialog" aria-modal="true" className="v--modal-box modal imagedialog" >
                    <div data-v-bd733764="" className="header">
                        <button data-v-bd733764="" data-id="upload1" className="image_upload active" onClick={(e)=>handleUpload(e)} >Upload</button>
                        <button data-v-bd733764="" data-id="upload2" className="image_link" onClick={(e)=>handleLink(e)} >URL</button>
                    </div>
                    {
                        uploadClick && imagePreviewUrl
                        ? preview
                        : uploadClick && !imagePreviewUrl
                        ? uploadComputer
                        : null
                    }
                    {
                        !uploadClick && imagePreviewUrl
                        ? preview
                        : !uploadClick && !imagePreviewUrl
                        ? linkURL
                        : null
                    }
                    <div data-v-bd733764="" className="buttons">
                        <input data-v-bd733764="" type="button" value="CANCEL" className="cancel" onClick={(e)=>handleCancel(e)} />
                        { imagePreviewUrl && <input data-v-bd733764="" type="submit" value="OK" className="ok" onClick={(e)=>handleSubmit(e)}/>}
                    </div>
                </div>
            </div>
        </div>
    )

}
export default ImageDialog;