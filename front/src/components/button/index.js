import React from 'react';
import './index.css';
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Button = React.memo(props => {
    const toggleStatus = () => {
        if(props.onClick && props.status !== 'no')
            props.onClick();
        else {
            toast.info('Session initializing. Wait a moment.')
        }
    }
    return (
        <>
            <img id={props.id} data-v-2f32af68="" className="stopvideo pointer has-tooltip" src={props[props.status]} alt={props.alt} title={props.alt} onClick={ toggleStatus } />
            <ToastContainer
                autoClose={3000}
                hideProgressBar={true}
                position={toast.POSITION.BOTTOM_RIGHT}
            />
        </>
    );
})
export default Button;