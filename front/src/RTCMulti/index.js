import Peer from 'peerjs';

class MyPeer extends Peer {
  constructor(props) {
    super({
      host: 'screen-sharing-web.herokuapp.com',
      path: '/myapp',
      port: 443,
      secure: true,
      key: 'peerjs',
      debug: 0,
    });
  }
}

export default MyPeer;