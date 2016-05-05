
import {Socket, LongPoller} from "phoenix"

var recordRTC;
    let socket = new Socket("/socket");
    socket.connect();
    socket.onClose( e => console.log("Closed connection") );
    socket.onOpen( ev => console.log("Opened connection", ev) );
    socket.onError( ev => console.log("ERROR", ev) );


    var channel = socket.channel("call", {});
    channel.join()
      .receive("ignore", () => console.log("auth error"))
      .receive("ok", () => console.log("join ok"))
      .receive("error", () => console.log("Connection error") );

    let localStream, peerConnection;
    let localVideo = document.getElementById("localVideo");
    let remoteVideo = document.getElementById("remoteVideo");
    let connectButton = document.getElementById("connect");
    let callButton = document.getElementById("call");
    let hangupButton = document.getElementById("hangup");                    

    function connect() {
      console.log("Requesting local stream");
      
      navigator.webkitGetUserMedia({audio:true, video:true}, gotStream, error => {
        console.log("getUserMedia error: ", error);
      });
    }

    function gotStream(stream) {
      console.log("Received local stream");
      localVideo.src = URL.createObjectURL(stream);
      localStream = stream;
      setupPeerConnection();
    }

    function convertFloat32ToInt16(buffer) {
      l = buffer.length;
      buf = new Int16Array(l);
      while (l--) {
        buf[l] = Math.min(1, buffer[l])*0x7FFF;
      }
      return buf.buffer;
    }

    function recorderProcess(e) {
      var left = e.inputBuffer.getChannelData(0);
      window.Stream.write(convertFloat32ToInt16(left));
    }

    function setupPeerConnection() {
      connectButton.disabled = true;
      callButton.disabled = false;
      hangupButton.disabled = false;
      console.log("Waiting for call");

      let servers = {
        "iceServers": [{
          "url": "stun:fruit-travel-4000.codio.ios"
        }]
      };

      var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || 
                              window.webkitRTCPeerConnection;
      
      peerConnection = new RTCPeerConnection(servers);
      console.log("Created local peer connection");
      peerConnection.onicecandidate = gotLocalIceCandidate;
      peerConnection.onaddstream = gotRemoteStream;
      peerConnection.addStream(localStream);
      console.log("Added localStream to localPeerConnection");
    }

    function call() {
      callButton.disabled = true;
      console.log("Starting call");
      peerConnection.createOffer(gotLocalDescription, handleError);
    }

    function gotLocalDescription(description){
      peerConnection.setLocalDescription(description, () => {
        channel.push("message", { body: JSON.stringify({
          "sdp": peerConnection.localDescription
        })});
      }, handleError);
      console.log("Offer from localPeerConnection: \n" + description.sdp);
    }

    function gotRemoteDescription(description){
      console.log("Answer from remotePeerConnection: \n" + description.sdp);
      peerConnection.setRemoteDescription(new RTCSessionDescription(description.sdp));
      peerConnection.createAnswer(gotLocalDescription, handleError);
    }

    function gotRemoteStream(event) {
      console.log("here");
      console.log(event.stream);
      remoteVideo.src = URL.createObjectURL(event.stream);
      console.log("Received remote stream");
    }

    function gotRemoteIceCandidate(event) {
      callButton.disabled = true;
      if (event.candidate) {
        peerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
        console.log("Remote ICE candidate: \n " + event.candidate.candidate);
      }
    }

    function gotLocalIceCandidate(event) {
      if (event.candidate) {
        console.log("Local ICE candidate: \n" + event.candidate.candidate);
        channel.push("message", {body: JSON.stringify({
          "candidate": event.candidate
        })});
      }
    }

    function hangup() {
      console.log("Ending call");
      peerConnection.close();
      localVideo.src = null;
      peerConnection = null;
      hangupButton.disabled = true;
      connectButton.disabled = false;
      callButton.disabled = true;
    }

    function handleError(error) {
      console.log(error.name + ": " + error.message);
    }

    channel.on("message", payload => {
      let message = JSON.parse(payload.body);
      if (message.sdp) {
        gotRemoteDescription(message);
      } else {
        gotRemoteIceCandidate(message);
      }
    })

    hangupButton.disabled = true;
    callButton.disabled = true;
    connectButton.onclick = connect;
    callButton.onclick = call;
    hangupButton.onclick = hangup;
    localVideo.muted = true;