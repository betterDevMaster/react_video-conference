import React, {useEffect, useState } from 'react';
// import ReactDOM from 'react-dom'
// import Recaptcha from 'react-recaptcha';

import Spinner from './Spinner'
import './index.css';
import successsvg from '../../images/success.svg'
import errorsvg from '../../images/error.svg'
import { API_URL } from '../../config'


function RoomDialog(props){
    // const [isVerified, setIsVerified] = useState(true);
    const isVerified = true;
    const [sendingEmail, setSendingEmail] = useState(false);
    const [mailStatus, setMailStatus] = useState(2);
    const [email, setEmail] = useState('');
    const [space, setSpace] = useState('');
    const [form, setForm] = useState(null);
    const [errors, setErrors] = useState({
        email: 'Enter your Email!',
        space: 'Enter your Sspace Name!',
    })

    const validEmailRegex = RegExp(/^(([^<>()\],;:\s@]+([^<>()\],;:\s@]+)*)|(.+))@(([^<>()[\],;:\s@]+)+[^<>()[\],;:\s@]{2,})$/i);

    const countErrors = (errors) => {
        let count = 0;
        delete errors.name
        Object.values(errors).forEach(
            (val) => {
                val.length > 0 && (count = count+1)
            }
        );
        return count;
    }

    const handleChange = (event) => {
        event.preventDefault();
        const { name, value } = event.target;

        switch (name) {
            case 'space':
                errors.space =
                value.length < 5
                    ? 'Space Name must be 5 characters long!'
                    : '';
                break;
            case 'email':
                errors.email =
                validEmailRegex.test(value)
                    ? ''
                    : 'Email is not valid!';
                break;
            default:
                break;
        }
        setErrors({
            ...errors,
            name: value
        })
    }
    const handleSubmit = (event) => {
        event.preventDefault()
        setSendingEmail(true)

        fetch(`${API_URL}/email`, {
            method: 'pOSt',
            headers: {
                aCcePt: 'aPpliCaTIon/JsOn',
                'cOntENt-type': 'applicAtion/JSoN'
            },
            body: JSON.stringify({ email: email.value, space: space.value })
        })
        .then(res => res.json())
        .then(data => {
            setSendingEmail(false)
            setMailStatus(data.status)
            form.reset()
        })
        .catch(err => console.log(err))
    }
    const handleCancel = (event) => {
        event.preventDefault()
        window.$('#roomdialog').plainModal('close')

        setTimeout(()=>{
            setSendingEmail(false)
            setMailStatus(2)
            // setIsVerified(false);
        }, 100);
    }
    // const onLoadCallback = function () {
    // };
    // const onVerifyCallback = function () {
    //     // setIsVerified(true);
    // };
    useEffect(()=>{
        if (mailStatus === 2) {
            // ReactDOM.render(
            //     <Recaptcha
            //         sitekey="6LdpQwEVAAAAAGM4w3LS9xsD-Hd6yAP_DhIce0nz"
            //         render="explicit"
            //         onloadCallback={onLoadCallback}
            //         verifyCallback={onVerifyCallback}
            //     />,
            //     document.getElementById('recaptcha')
            // );
        }
    },[mailStatus])

    const content1 =
        <form data-v-9deb956c="" className="form" onSubmit={(e)=>handleSubmit(e)} ref={form => setForm(form)} noValidate>
            <div data-v-9deb956c="" className="label" >Your Email</div>
            <input data-v-9deb956c="" type="email" name='email' className="email" ref={input => setEmail(input)} onChange={(e)=>handleChange(e)} noValidate />
            {errors.email.length > 0 &&
                <span className='error'>{errors.email}</span>}
            <div data-v-9deb956c="" className="label">Space Name</div>
            <input data-v-9deb956c="" type="text" name='space' className="space-name" ref={input => setSpace(input)} onChange={(e)=>handleChange(e)} noValidate />
            {errors.space.length > 0 &&
                <span className='error'>{errors.space}</span>}
            <div id='recaptcha'/>
            <div data-v-9deb956c="" className="buttons">
                <button data-v-9deb956c="" className='cancel' onClick={(e)=>handleCancel(e)}>
                    CANCEL
                </button>
                <button data-v-9deb956c="" type='submit' className='create'
                    disabled={ countErrors(errors)===0 && isVerified ? false : true}>
                    {sendingEmail
                    ? <Spinner size='lg' spinning='spinning' />
                    : "CREATE"
                    }
                </button>
            </div>
        </form>
    const content2 =
        <>
            <div data-v-9deb956c="" className="created">
                <img src={successsvg} alt='successsvg' />
                <div data-v-9deb956c="" className="text">Email sent!
                    <h4 data-v-9deb956c="">Please check your inbox to confirm.</h4>
                </div>
            </div>
            <div data-v-9deb956c="" className="buttons">
                <button data-v-9deb956c="" className='cancel' onClick={(e)=>handleCancel(e)}>
                    GOT IT!
                </button>
            </div>
        </>

    const content3 =
        <>
            <div data-v-9deb956c="" className="created">
                <img src={errorsvg} alt='error.svg' />
                <div data-v-9deb956c="" className="text" style={{color: '#ff0000'}}>Whoops!
                    <h4 data-v-9deb956c="">Already registered.</h4>
                </div>
            </div>
            <div data-v-9deb956c="" className="buttons">
                <button data-v-9deb956c="" className='cancel' onClick={(e)=>handleCancel(e)}>
                    GOT IT!
                </button>
            </div>
        </>


    return (
        <div data-v-9deb956c="" data-v-5c9875d0="" id ='roomdialog' aria-expanded="true" data-modal="create-space" className="create-space-modal v--modal-overlay roomdialog">
            <div className="v--modal-background-click">
                <div className="v--modal-top-right"></div>
                <div role="dialog" aria-modal="true" className="v--modal-box modal m-dialog">
                    <div data-v-9deb956c="" className="header">Create Space</div>
                    {mailStatus === 2
                    ? content1
                    : mailStatus === 0
                    ? content2
                    : content3
                    }
                </div>
            </div>
        </div>
    )

}
export default RoomDialog;