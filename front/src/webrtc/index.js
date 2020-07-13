class WebRTC {
    static _instance = null;
    client = null;
    roomName = ''
    userName = ''
    myPosition = {x:0, y:0}
    youtubes = []
    images = []
    sharedUserId = ''
    enableScreenShare = true
    enableCamera = true
    enableMic = true
    // visibleScreenWidth = document.getElementsByClassName('space')[0].offsetWidth
    // visibleScreenHeight = document.getElementsByClassName('space')[0].offsetHeight
    visibleScreenWidth = document.getElementById('background_div').offsetWidth
    visibleScreenHeight = document.getElementById('background_div').offsetHeight

    videoQualities = [
        {text:'SSM (30p - 128Kb/s)', value:{width: 160, height:120, frameRate: 10}},
        {text:'SM (120p - 256Kb/s)', value:{width: 320, height:240, frameRate: 10}},
        {text:'SD (360p - 1Mb/s)', value:{width: 480, height:360, frameRate: 10}},
        {text:'HD (720p - 2Mb/s)', value:{width: 1280, height:720, frameRate: 10}},
        {text:'Full HD (1080p - 4Mb/s)', value:{width: 1920, height:1080, frameRate: 15}},
    ]
    currentVideoQuality = this.videoQualities[1]
    audioQualities = [
        {text:'Narrow Band (16Kb/s)', value:{sampleSize: 8, channelCount: 1}},
        {text:'Wide Band (64Kb/s)', value:{sampleSize: 8, channelCount: 2}},
        {text:'Full Band (256Kb/s)', value:{sampleSize: 16, channelCount: 2}},
    ]
    currentAudioQuality = this.audioQualities[1]

    static getInstance(){
         if ( WebRTC._instance === null) {
             WebRTC._instance = new WebRTC();
         }
         return WebRTC._instance;
    }

    constructor() {
        console.log('WebRTC class was initialized.');
    }

    checkBrowser() {
        return window.Login._browserCompatCheck();
    }
    getUserName() {
        const username = window.localStorage.getItem('userName');
        return username ? username : '';
    }
    setUserName(name) {
        window.localStorage.setItem('userName', name)
    }
    getRoomName() {
        return this.roomName;
    }
    generateRoomName(){
        return window.generateRoomName();
    }
    createRoom(token, roomName) {
        window.localStorage.setItem('o', true)
        window.localStorage.setItem('t', 'video-conference')
        window.localStorage.setItem('r', roomName)
        window.location.href = '/room?username='+this.getUserName();
    }
    joinRoom(token, roomName) {
        window.localStorage.setItem('o', false)
        window.localStorage.setItem('t', 'video-conference')
        window.localStorage.setItem('r', roomName)
        window.location.href = '/room?username='+this.getUserName();
    }
    createAudioMeter(localstream) {
        var kSampleSize = 16384;
        var kSampleAverageInterval = 16;
        var audioContext = new AudioContext();
        var mediaStreamSource = audioContext.createMediaStreamSource(localstream);
        var processor = audioContext.createScriptProcessor(kSampleSize, 1, 1);

        mediaStreamSource.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = function(evt) {
            var buffer = evt.inputBuffer;
            if (buffer.numberOfChannels > 0) {
                var inputData = buffer.getChannelData(0);
                var inputDataLength = inputData.length;
                var total = 0;

                // We calculate the average of every X to prevent CPU fans from kicking in
                // on laptops!
                for (var i = 0; i < inputDataLength; i += kSampleAverageInterval) {
                    total += Math.abs(inputData[i]);
                }

                var rms = Math.sqrt((kSampleAverageInterval * total) / inputDataLength);
                // WebRTC.getInstance().client.sendPeerMessage();

                window.easyrtc.sendPeerMessage({
                    targetRoom: WebRTC.getInstance().roomName
                }, 'audio-meter', {
                    rms: rms
                });
            }
        };
    }
    toggleCamera (enable) {
        this.enableCamera = enable
        // window.easyrtc.enableCamera(enable);
        this.onStreamConfigurationChange()
        if(this.client)
            this.client.sendPeerMessage({room: this.roomName}, 'media-presence', {type:'camera', status: enable?'on':'off'});
    }
    toggleMic (enable) {
        this.enableMic = enable
        // window.easyrtc.enableMicrophone(enable);
        this.onStreamConfigurationChange()
        if(this.client)
            this.client.sendPeerMessage({room: this.roomName}, 'media-presence', {type:'mic', status: enable?'on':'off'});
    }
    toggleScreenShare (enable) {
        this.enableScreenShare = enable
        if (!enable)
            WebRTC.getInstance().onSetScreenCapture()
        else 
            WebRTC.getInstance().onStreamConfigurationChange()
        if(this.client)
            this.client.sendPeerMessage({room: this.roomName}, 'media-presence', {type:'screenshare', status: enable?'on':'off'});
    }
    
    youtubePosition (value) {
        this.youtubes.forEach((youtube)=>{
            if(youtube.name === value.name)
                youtube.transform = value.transform;
        })
        if(this.client)
            this.client.sendPeerMessage({room: this.roomName}, 'youtube-position', value);
    }
    youtubePlay (value) {
        this.youtubes.forEach((youtube)=>{
            if(youtube.name === value.name) {
                youtube.videoplay = value.videoplay;
                youtube.videoplaying = value.videoplaying;
                youtube.curtime = value.curtime;
            }
        })

        if(this.client)
            this.client.sendPeerMessage({room: this.roomName}, 'youtube-play', value);
    }
    youtubeAdd (value) {
        value.transform = 'translate(0px, 0px)'
        value.videoWidth = 382
        value.videoHeight = 214
        WebRTC.getInstance().youtubes.push(value)
        if(WebRTC.getInstance().client)
            WebRTC.getInstance().client.sendPeerMessage({room: this.roomName}, 'youtube-add', value);
    }
    youtubeRemove (value) {
        if(WebRTC.getInstance().client)
            WebRTC.getInstance().client.sendPeerMessage({room: this.roomName}, 'youtube-remove', value);
        WebRTC.getInstance().youtubes = WebRTC.getInstance().youtubes.filter((rec)=>{
            return rec.name!==value.name
        })
    }
    imageAdd (value) {
        value.transform = 'translate(0px, 0px)';
        WebRTC.getInstance().images.push(value)
        if(WebRTC.getInstance().client)
            WebRTC.getInstance().client.sendPeerMessage({room: this.roomName}, 'image-add', value);
    }
    imagePosition (value) {
        this.images.forEach((image)=>{
            if(image.name === value.name)
                image.transform = value.transform
        })
        if(this.client)
            this.client.sendPeerMessage({room: this.roomName}, 'image-position', value);
    }
    imageRemove (value) {
        if(WebRTC.getInstance().client)
            WebRTC.getInstance().client.sendPeerMessage({room: this.roomName}, 'image-remove', value);
        WebRTC.getInstance().images = WebRTC.getInstance().images.filter((rec)=>{
            return rec.name!==value.name
        })
    }
    closeClient(cusId) {
        this.dispatch({type:'user_remove', value: { id: cusId }});
        window.easyrtc.disconnect();
    }
    sendFile(peerId, peerName, dispatch) {
        const fileInput = window.$("#file");
        fileInput.one(
            'change',
            function(){
                const file = fileInput[0].files[0];
                if(file.size === 0){
                    alert("Empty file selected.");
                    return;
                }
                if(file.size > Math.pow(2, 21)){
                    alert("File size can't be larger than 2MB.");
                    return;
                }
                var reader = new FileReader();
                // Closure to capture the file information.
                reader.onload = function(e) {
                    var txData = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        binaryContents: e.target.result
                    };
                    dispatch({type:'chat_add',
                        value:{
                            username: 'Me',
                            userid: 'me',
                            text: `Send a file "${file.name}" to "${peerName}".`,
                            align: 'right',
                            time: Date.now()}})
                    window.easyrtc.sendDataWS(peerId, 'file', txData);
                };
                // Read in the image file as a data URL.
                reader.readAsDataURL(file);
                fileInput[0].value = ''
            }
        )
        fileInput[0].click();
        // .trigger('click');
    }
    // exitRoom(){
    //     if(this.owner === 'true'){
    //         this.sendMessage('Room closed.');
    //         window.easyrtc.sendPeerMessage({
    //             targetRoom: WebRTC.getInstance().roomName
    //         }, 'close');
    //         this.dispatch({type:'chat_add', value:{username: 'Me', userid: 'me', text: 'Room closed.', align: 'right', time: Date.now()}})
    //     }
    //     this.closeClient()
    // }
    updateStreamMode(){
        // get getUserMedia mode
        let mode = {video:false, audio: false}
        if(this.currentVideoDevice){
            mode.video = {}
            mode.video.deviceId = this.currentVideoDevice.value;
            mode.video.width = this.currentVideoQuality.value.width;
            mode.video.height = this.currentVideoQuality.value.height;
            mode.video.frameRate = this.currentVideoQuality.value.frameRate;
        }
        if(this.currentAudioDevice){
            mode.audio = {}
            mode.audio.deviceId = this.currentAudioDevice.value;
            mode.audio.sampleSize = this.currentAudioQuality.value.sampleSize;
            mode.audio.channelCount = this.currentAudioQuality.value.channelCount;
        }
        this.currentContraintMode = mode;
    }
    onStreamConfigurationChange(peerId){
        if(!this.enableScreenShare){
            //now screen sharing status...
            const peers = window.easyrtc.getPeerConnections()
            for(const id in peers){
                const peer = peers[id]
                
                peer.pc.getSenders().map((sender) => 
                {
                    if(WebRTC.getInstance().screenStream){
                        sender.replaceTrack(WebRTC.getInstance().screenStream.getTracks().find(track=>{
                            return track.kind === sender.track.kind
                        }))
                    }
                })
            }
            return;
        }

        this.updateStreamMode();
        const local = window.easyrtc.getLocalStream();
        local.getTracks().forEach(track=>{track.stop()})
        const mode = {...this.currentContraintMode}
        if(! WebRTC.getInstance().enableCamera)
            mode.video = false;
        if(! WebRTC.getInstance().enableMic)
            mode.audio = false;
        if(!mode.video && !mode.audio){
            const peers = window.easyrtc.getPeerConnections()
            for(const id in peers){
                const peer = peers[id]
                // if(peer.cancelled)
                //     continue;
                peer.pc.getSenders().forEach((sender) =>{
                    if(sender.track)
                        sender.track.enabled = false;
                            // sender.track.stop()
                    }
                )
                    //sender.replaceTrack(null))
            }
            return;
        }
        navigator.mediaDevices.getUserMedia(mode).then(
            (stream)=>{
                // replace local stream
                stream.getTracks().forEach((track)=>{local.addTrack(track)})
                const video_me = document.getElementById(local.id)
                // console.log('video_me ----------',video_me)
                if(video_me)
                    window.easyrtc.setVideoObjectSrc(video_me, stream)
                window.easyrtc.enableCamera(WebRTC.getInstance().enableCamera)
                window.easyrtc.enableMicrophone(WebRTC.getInstance().enableMic)
                const peers = window.easyrtc.getPeerConnections()
                
                for(const id in peers){
                    const peer = peers[id]
                    // if(peer.cancelled)
                    //     continue;
                    peer.pc.getSenders().forEach((sender) =>{
                        const kind = sender.track.kind;
                        // if(kind === 'video'){
                        const local_track = stream.getTracks().find(track=>track.kind===kind)
                        if(local_track){
                            sender.replaceTrack(local_track);
                            sender.track.enabled = true
                        }
                        else
                            sender.track.enabled = false;
                        // }
                    } )
                }
            }
        );
    }
    async updateDevices(){
        try{
            let audio = [];
            let video = [];
            const devices = await navigator.mediaDevices.enumerateDevices();
            for(const dev of devices){
                if(dev.kind === 'audioinput'){
                    const found = audio.filter(ele=>ele.text.indexOf(dev.label)===0)
                    if(found.length>0)
                        audio = [...audio, {text:dev.label+'-'+found.length, value: dev.deviceId}]
                    else
                        audio = [...audio, {text:dev.label, value: dev.deviceId}]
                }
                if(dev.kind === 'videoinput'){
                    const found = video.filter(ele=>ele.text.indexOf(dev.label)===0)
                    if(found.length>0)
                        video = [...video, {text:dev.label+'-'+found.length, value: dev.deviceId}]
                    else
                        video = [...video, {text:dev.label, value: dev.deviceId}]

                }
            }
            this.videoDevices = video;
            this.audioDevices = audio;
        }catch(e){
        }
    }
    async startConference(dispatch, token, room, userName) {
        console.log('start conference: ', userName)
        this.userName = userName;
        this.roomName = room ? room : window.localStorage.getItem('r');
        
        if(!this.roomName){
            window.location.href = '/room?space='+this.roomName;
            return;
        }
        this.dispatch = dispatch;
        await this.updateDevices();
        this.currentVideoDevice = this.videoDevices.length === 0 ? null: this.videoDevices[0];
        this.currentAudioDevice = this.audioDevices.length === 0 ? null: this.audioDevices[0];

        this.owner = window.localStorage.getItem('o')
        this.token = window.localStorage.getItem('t');

        window.localStorage.removeItem('o');
        window.localStorage.removeItem('t');
        window.localStorage.removeItem('r');

        window.easyrtc.enableDataChannels(false);
        window.VTCCore
        .initialize({
            cameraIsEnabled: true,
            micIsEnabled: true
        })
        .onError(function(config) {
            console.log("error---", config);
        })
        .onPeerMessage(function(client, peerId, msgType, content) {
            if (msgType === 'chat') {
                dispatch({type:'chat_add', value:{username: client.idToName(peerId), userid: peerId, text: content, align: 'left', time: Date.now()}})
            } else if (msgType === 'set_peer_position') {
                WebRTC.getInstance().updatePeerPosition(content)
            // Youtube Handle
            } else if (msgType === 'youtube-position') {
                dispatch({type:'youtube_position', value:{username: client.idToName(peerId), name: content.name, videoId: peerId, transform: content.transform, 
                    videoWidth: content.videoWidth, videoHeight: content.videoHeight}})
            } else if (msgType === 'youtube-play') {
                dispatch({type:'youtube_play', value:{ name: content.name, videoplay: content.videoplay, curtime: content.curtime, videoplaying: content.videoplaying}})
            } else if (msgType === 'youtube-add') {
                dispatch({type:'youtube_add', value:{name: content.name, id: peerId, value: content.videoId}})
            } else if (msgType === 'youtube-remove') {
                console.log('youtbut_remove: ', content)
                dispatch({type:'youtube_remove', name:content.name})
            // Image Handle
            } else if (msgType === 'image-position') {
                dispatch({type:'image_position', value:{username: client.idToName(peerId), name: content.name, imageid: peerId, transform: content.transform}})
            } else if (msgType === 'image-add') {
                dispatch({type:'image_add', value:{name: content.name, id: peerId, value: content.imageId}})
            } else if (msgType === 'image-remove') {
                dispatch({type:'image_remove', name:content.name})
            // Navbar Handle
            } else if (msgType === 'media-presence' &&
                typeof content.type === 'string' &&
                typeof content.status === 'string') {
                    const setScreen = ()=>{
                        const ele = document.getElementById('screen_'+peerId);
                        if(ele){
                            dispatch({type:'user_media', value: { id: peerId, type: 'screenshare', status: content.status}})
                            return;
                        }
                        setTimeout(setScreen, 500);
                    }
                    setTimeout(setScreen, 500);
            } else if (msgType === 'debug') {
                console.log(msgType, peerId, content);
            } else if (msgType === 'mic-control' && typeof content.enabled === 'boolean') {
                console.log(client, peerId, msgType, content)
                return;
            } else if (msgType === 'audio-meter') {
                // dispatch({type:'user_audio', value: {audio: content.rms});
                // AudioMeter.handlePeerMessage(peerId, content);
            } else if (msgType === 'file'){
                var arr = content.binaryContents.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                while(n--){
                    u8arr[n] = bstr.charCodeAt(n);
                }
                var blob = new Blob([u8arr], {type:mime});
                dispatch({type:'chat_add',
                        value:{
                            username: client.idToName(peerId),
                            userid: peerId,
                            html: `"${client.idToName(peerId)}" sent a file.<br><a href='${URL.createObjectURL(blob)}' target='_blank'>Click here to download ${content.name}(${content.size}bytes)`,
                            align: 'left',
                            time: Date.now()}})
            } else {
                // @todo FIXME: right now we don't have other messages to take care of
                console.log('peerMessage => got a peer message that is unexpected');
                console.log('            => peerId:  ' + peerId);
                console.log('            =>   name: ' + client.idToName(peerId));
                console.log('            => msgType: ' + msgType);
                console.log('            => content: ' + JSON.stringify(content));
            }
        })
        .onStreamAccept(function(client, peerId, stream) {
            var peerName = client.idToName(peerId);
            
            window.easyrtc.sendServerMessage("get_peer_position", peerId,
                function(msgType, position){
                    console.log('onStreamAccept: ', peerName, 'roomName = ', WebRTC.getInstance().roomName)
                    dispatch({type: 'user_add', value: {id: peerId, name: peerName, stream, defPosX: position.x, defPosY: position.y} })
                    WebRTC.getInstance().onStreamConfigurationChange(peerId);
                    
                    // WebRTC.getInstance().updatePeerPosition(peerId, peerName, position)
                }, function(errorCode, errorText){
                    // WebRTC.getInstance().updatePeerPosition(peerId, {x:0, y:0})
               });
            WebRTC.getInstance().youtubes.forEach((youtube)=>{
                WebRTC.getInstance().client.sendPeerMessage(
                    {rtcId: peerId}, 
                    'youtube-add', youtube);
                WebRTC.getInstance().client.sendPeerMessage(
                    {rtcId: peerId}, 
                    'youtube-play', youtube);
                WebRTC.getInstance().client.sendPeerMessage(
                    {rtcId: peerId}, 
                    'youtube-position', youtube);
            })
            WebRTC.getInstance().images.forEach((image)=>{
                WebRTC.getInstance().client.sendPeerMessage(
                    {rtcId: peerId}, 
                    'image-add', image);
                WebRTC.getInstance().client.sendPeerMessage(
                    {rtcId: peerId}, 
                    'image-position', image);
            })
            
            WebRTC.getInstance().client.sendPeerMessage({room: WebRTC.getInstance().roomName}, 'media-presence', {type:'screenshare', status: WebRTC.getInstance().enableScreenShare?'on':'off'});
            
            return;
        })
        .onStreamClose(function(client, peerId) {
            console.log('streamClose')
            dispatch({type:'image_remove_by_id', peerId})
            dispatch({type:'youtube_remove_by_id', peerId})

            dispatch({type:'user_remove', value: { id: peerId }});

            return;
        })
        .connect(userName, this.roomName, (client) => {
            console.log('start local stream: ', userName, 'roomName = ',this.roomName)
            var stream = client.getLocalStream();

            window.easyrtc.sendServerMessage('get_my_position', {clientId: client.getId(), sWidth: WebRTC.getInstance().visibleScreenWidth, sHeight: WebRTC.getInstance().visibleScreenHeight},
            // window.easyrtc.sendServerMessage('get_my_position', {clientId: client.getId()},
                function(msgType, position){
                    // console.log('webrtc---------- ', position)
                    dispatch({type: 'user_add', value: {id: 'me', name: 'Me', stream, defPosX: position.x, defPosY: position.y} })
                    WebRTC.getInstance().onStreamConfigurationChange(); 
                    WebRTC.getInstance().client = client;

                    WebRTC.getInstance().updateMyPosition(position)
                }, function(errorCode, errorText){
                    // WebRTC.getInstance().updateMyPosition({x:0, y:0})
                }
            );
               
            return;
        });

    }
    sendMessage(message){
        this.client.sendPeerMessage({room: this.roomName}, 'chat', message);
    }
    onSetScreenCapture(){
        this.updateStreamMode();
        const local = window.easyrtc.getLocalStream();
        var _this = this
        // navigator.mediaDevices.getUserMedia(this.currentContraintMode).then(
        navigator.mediaDevices.getDisplayMedia({video:{width: 1920, height:1080, frameRate: 5}}).then(
            async (stream)=>{
                local.getTracks().forEach(track=>{track.stop()})

                const audioStream = await navigator.mediaDevices.getUserMedia({audio:true});
                stream.getVideoTracks()[0].onended = () => {
                    this.toggleScreenShare(true)
                    this.dispatch({type: 'click_screenshare', value: 'on'});
                    this.dispatch({type:'user_media', value: { id: 'me', type: 'screenshare', status: 'on'}})
                    document.getElementById('screenshare').src = '/static/media/screenshare-on.44d81ce8.svg'
                }
                
                stream.addTrack(audioStream.getAudioTracks()[0]);
                // replace local stream
                stream.getTracks().forEach((track)=>{local.addTrack(track)})
                WebRTC.getInstance().screenStream = stream;
                const video_me = document.getElementById(local.id)
                window.easyrtc.setVideoObjectSrc(video_me, stream)
                // send it to remote
                const peers = window.easyrtc.getPeerConnections()
                for(const id in peers){
                    const peer = peers[id]
                    if(peer.cancelled)
                        continue;
                    peer.pc.getSenders().map((sender) => 
                        sender.replaceTrack(stream.getTracks().find(track=>{
                            return track.kind === sender.track.kind
                        })))
                }
            }
        ).catch(function(err) {
            //log to console first 
            console.log(err); /* handle the error */
            if (err.name == "NotFoundError" || err.name == "DevicesNotFoundError") {
                //required track is missing 
                console.log('NotFoundError, DevicesNotFoundError')
            } else if (err.name == "NotReadableError" || err.name == "TrackStartError") {
                //webcam or mic are already in use 
                console.log('NotReadableError, TrackStartError')
            } else if (err.name == "OverconstrainedError" || err.name == "ConstraintNotSatisfiedError") {
                //constraints can not be satisfied by avb. devices 
                console.log('OverconstrainedError, ConstraintNotSatisfiedError')
            } else if (err.name == "NotAllowedError" || err.name == "PermissionDeniedError") {
                //permission denied in browser 
                console.log('Send screen share message')
                _this.toggleScreenShare(true)
                _this.dispatch({type: 'click_screenshare', value: 'on'});
                _this.dispatch({type:'user_media', value: { id: 'me', type: 'screenshare', status: 'on'}})
                document.getElementById('screenshare').src = '/static/media/screenshare-on.44d81ce8.svg'
            } else if (err.name == "TypeError" || err.name == "TypeError") {
                //empty constraints object 
                console.log('TypeError')
            } else {
                //other errors 
                console.log("Error: " + err.name);
            }
        });
    }
    updatePeerPosition(content){
        console.log('---------updatePeerPosition------------', content)
        WebRTC.getInstance().dispatch({type: 'user_position', value: {id: content.position.peerId, defPosX: content.position.x, defPosY: content.position.y} })

        // const setPos = ()=>{
        //     const peer = document.getElementById('screen_'+peerId);
        //     if(peer){
        //         peer.style.left = position.x + 'px'
        //         peer.style.top = position.y + 'px'
        //     }else{
        //         setTimeout(setPos, 100)
        //     }
        // };
        // setTimeout(setPos, 100)
    }
    updateMyPosition( position ){
        // const me = document.getElementById('screen_me');
        if(this.client){
            if(!position)
                position = this.myPosition;
            // me.style.left = position.x + 'px';
            // me.style.top = position.y + 'px';
            this.myPosition = position;

            console.log('updateMyposition------------------', position, this.client)
            this.client.sendPeerMessage({room: this.roomName}, 'set_peer_position', {id: this.client.getId(), position:this.myPosition});
        }
    }
}
export default WebRTC;