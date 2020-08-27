import React from "react";

// import marksvg from '../images/logo-mark.svg'
import Dialog from '../components/dialog';
import RoomDialog from '../components/dialog/roomdlg';
import Footer from '../components/footer';

function Home(props) {
    return (
    <div data-v-5c9875d0="" className="home">
        <div data-v-5c9875d0="" className="buttons">
            <button data-v-5c9875d0="" onClick={()=>{Dialog.show('roomdialog')}} className="button">Create Space</button>
        </div>
        <Footer />
        <RoomDialog />
    </div>
    );
}

export default Home;
