import { useEffect, useState } from "react"


function Sender() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
    useEffect(()=>{
      const socket = new WebSocket('ws://localhost:8080');
      setSocket(socket);
      socket.onopen = () =>{
        socket.send(JSON.stringify({type: "sender"}));
      }


    },[]);

  const startSendingVideo = async()=>{
    if(!socket) return 

    const pc = new RTCPeerConnection();
    pc.onnegotiationneeded = async()=>{
      console.log("on negotiotion");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.send(JSON.stringify({ type: 'createOffer', sdp: pc.localDescription }));
    }

    pc.onicecandidate = (event) =>{
      if(event.candidate) {
        socket.send(JSON.stringify({type: 'iceCandidate', candidate: event.candidate}))
      }
    }


    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log("message");
      
      console.log(message);
      
      if (message.type === 'createAnswer') {
        console.log("sdp");
        
        console.log(message.sdp);
        
          await pc.setRemoteDescription(message.sdp);
      } else if (message.type === 'iceCandidate') {
        console.log("candidate");
        
        console.log(message.candidate);
        
          await pc.addIceCandidate(message.candidate);
      }
  }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio:false });
    pc.addTrack(stream.getVideoTracks()[0]);
  }
  return (
    <div>
      <button onClick={startSendingVideo}>
        send video
      </button>
    </div>
  )
}

export default Sender