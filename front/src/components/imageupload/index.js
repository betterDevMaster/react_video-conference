import React from 'react';
import { useDispatch } from 'react-redux';
import DragBox from '../draggable/DragBox'

import './index.css';
import closeimage from '../../images/closevideo.svg'
import WebRTC from '../../webrtc';

const ImageUpload = React.memo((props) => {
    const dispatch = useDispatch();

    const handleImageDrag = (node, pos, scale) => {
        imageHandle(node, pos, scale);
    }
    const handleImageResize = (node, pos, scale) => {
        imageHandle(node, pos, scale);
    }
    function imageHandle (node, pos, scale) {
        WebRTC.getInstance().imagePosition({ name: props.image.name, width: node.clientWidth, height: node.clientHeight, defX: pos.x, defY: pos.y })
        dispatch({type: 'image_position', value: { name: props.image.name, width: node.clientWidth, height: node.clientHeight, defX: pos.x, defY: pos.y } })
    }
    const handleClose = (value) => {
        dispatch({type: 'image_remove', name: value})
        WebRTC.getInstance().imageRemove({name: value})
    }

    return (
        <DragBox
            type="rectangle"
            offset={ props.pos }
            scale={ props.zoom }
            initialRect={{ left: props.image.defX, top: props.image.defY, width: props.image.width, height: props.image.height }}
            zIndex={ props.image.id === 'me' ? 10 : 5 }
            onMouseUp={handleImageDrag}
            onResize={handleImageResize}
            draggable = { props.image.id === 'me' ? true : false }
            zoom = { props.image.zoom ? props.image.zoom : 1 }
            sizable = { props.image.id === 'me' ? true : false } 
            aspect
            dragType='all'
        >
            <div key={props.image.id} className='cus_content'>
                <div className="cus_header pointer hidden" style={{ zIndex: props.image.id === 'me' ? 10 : 5 }}>
                    <div className="cus_title">Pinned by {props.image.username}</div>
                    
                </div>
                <img src={props.image.value} className="image-frame" alt="map-transparent" />
            </div>
            {props.image.id==='me' &&
                <div onClick={() => handleClose(props.image.name)} className="cus_close" >
                    <img data-v-6a2f6b36 src={closeimage} alt='closevideo.svg' />
                </div>
            }
        </DragBox>
    );
})
export default ImageUpload;