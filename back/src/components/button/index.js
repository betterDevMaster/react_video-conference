import React from 'react';
import './index.css';

const Button = React.memo(props => {
    const toggleStatus = () => {
        if(props.onClick && props.status !== 'no')
            props.onClick();
    }
    return (
        <img id={props.id} data-v-2f32af68="" className="stopvideo pointer has-tooltip" src={props[props.status]} alt={props.alt} title={props.alt} onClick={ toggleStatus } />
    );
})
export default Button;