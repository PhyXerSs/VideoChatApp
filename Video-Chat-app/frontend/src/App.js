import './App.css';
import { Button ,TextField } from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import AssignmentIcon from '@mui/icons-material/Assignment';
import React, { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatPopup from './components/ChatPopup';
import Typed from "react-typed";

const socket = io.connect('http://localhost:4000/')


function App() {
	const [ myId, setMyId ] = useState("")
	const [ stream, setStream ] = useState()
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ caller, setCaller ] = useState("")
	const [ callerSignal, setCallerSignal ] = useState()
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false)
	const [ name, setName ] = useState("")
	const [ chatId , setChatID ] = useState(null);
	const [ myName , setMyName ] = useState('');
	const [ nameFriend , setNameFriend ] = useState('');
	const myVideo = useRef()
	const userVideo = useRef()
	const connectionRef= useRef()


   	useEffect(() => {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true })
			.then((res) => {
				setStream(res)
				myVideo.current.srcObject = res
			})

		socket.on("connected", (socketId) => {
			setMyId(socketId)
		})
		//wait until someone call
		socket.on("callUser", (data) => {
			setReceivingCall(true)
			setCaller(data.from)
			setName(data.name)
			setNameFriend(data.name)
			setCallerSignal(data.signal)
		})
	}, [])

	function callUser(id){
		setChatID(id);
		const peer = new Peer({
			initiator:true,
			trickle:false,
			stream:stream
		})
		peer.on('signal',(data)=>{
			socket.emit('callUser',{ //send to destination
				signalData:data, //data for peer
				from:myId,
				name:myName,
				userToCall:id 
			})
		})
		
		peer.on('stream',(DataStream)=>{ //get data from destination
			userVideo.current.srcObject = DataStream; 
		})

		socket.on('callAccepted',(data)=>{
			setCallAccepted(true);
			setNameFriend(data.name);
			peer.signal(data.signal); //peer

		})

		connectionRef.current = peer;
	};

	function answerCall(){
		setCallAccepted(true);
		setChatID(caller);
		const peer = new Peer({ 
			initiator:false,
			trickle:false,
			stream:stream
		});

		peer.on('signal',(data)=>{
			socket.emit('answerCall',{ //send data to caller
				name:myName,
				to:caller,
				signal:data
			})
		});

		peer.on('stream',(dataStream)=>{  // get stream from caller
			userVideo.current.srcObject = dataStream;
		})

		peer.signal(callerSignal); //peer to caller
		connectionRef.current = peer;	
	};

	
	function leaveCall() {
		setChatID(null)
		setCallEnded(true)
		setNameFriend('');
		connectionRef.current.destroy()
		window.location.reload();
	}


    return (
    	<>
			<div className="header">
				<Typed
					className="typed-text"
					strings={["Chat App and Video Call"]}
					typeSpeed={40}
					backSpeed={60}
					loop
				/>
			</div>
			
			<div className="container">
				{!!!chatId && <div className="myId">
					<TextField
						id="filled-basic"
						label="Name"
						variant="filled"
						value={myName}
						onChange={(e) => {setName(e.target.value); setMyName(e.target.value)}}
						style={{ marginBottom: "20px" }}
					/>
					<CopyToClipboard text={myId} style={{backgroundColor:"#181D31", marginBottom: "2rem"}}>
						<Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
							Copy your ID
						</Button>
					</CopyToClipboard>

					<TextField
						id="filled-basic"
						label="ID to call"
						variant="filled"
						value={idToCall}
						onChange={(e) => setIdToCall(e.target.value)}
					/>
					
					<div className="myId-footer">
						{callAccepted && !callEnded ? (
							null
						) : (
							<Button variant="contained" color="primary" className="call-button" onClick={() => callUser(idToCall)}>
								Call!
							</Button>
						)}
						
					</div>
				</div>
				}
				
				<div className={!!chatId ?"video-container" : 'closeMyVideo'}>
				
					<div className="myVideo-block-calling">
					{!callAccepted ?<>
						{ stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "500px" }} className={!!chatId ? 'showMyVideo': 'closeMyVideo'}/> }</>
						:<>{ stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "150px" }} className={!!chatId ? 'myVideo-userAccept': 'closeMyVideo'}/> }
						</>}
					</div>
					
				
					<div className="userVideo-block">
						{callAccepted && !callEnded ? 
						<>
							<ChatPopup socket={socket} chatId={chatId}/>
							<video playsInline ref={userVideo} autoPlay style={{ width: "500px"}} className="showUserVideo" />
						</>:null}
					</div>
					<div className="video-container-footer">
						
						<h3>You are chatting to {nameFriend}</h3>
						{!!chatId  ? <Button variant="contained" className="endcall-button" onClick={leaveCall}>
										End Call
						</Button>:null}
					</div>
					
				</div>
				


				<div>
					{receivingCall && !callAccepted ? (
							<div className="caller">
							<h1 >{name} is calling...</h1>
							<Button variant="contained" color="primary" onClick={answerCall}>
								Answer
							</Button>
						</div>
					) : null}
				</div>

				
			</div>
			
		</>
  );
}

export default App;
