import logo from './logo.svg'
import './App.css'
import { io } from 'socket.io-client'
//import socket from "socket.io-client";
import { useEffect, useState, useRef,useCallback } from 'react'
import Peer from 'peerjs'

//const io = require('socket.io-client')
//console.log(io)
const Video = ({ stream }) => {
  const localVideo = useRef()

  // localVideo.current is null on first render
  // localVideo.current.srcObject = stream;

  useEffect(() => {
    // Let's update the srcObject only after the ref has been set
    // and then every time the stream prop updates
    if (localVideo.current) localVideo.current.srcObject = stream
  }, [stream, localVideo])

  return <video ref={localVideo} autoPlay />
}

function App () {
  const [socket, setSocket] = useState(null)
  const [streams, setStreams] = useState([])
  const [myStream, setmyStream] = useState()
  //const [usersStream, setusersStream] = useState([])
  // const myVideo = useRef()
  // const othersVideos = useRef([])

  useEffect(() => {
   const newSocket = io(`http://localhost:4000/`)
   //const newSocket = io(`https://stream-squ-server.herokuapp.com/`)
    setSocket(newSocket)
    return () => newSocket.close()
  }, [setSocket])
  console.log('streams', streams)

  const myPeer = new Peer(undefined, {})

  // const connectToNewUser = (userId, stream) => {
  //   const call = myPeer.call(userId, stream)
  //   console.log('userId', userId)
  //   console.log('stream', stream)
  //   //   const video = document.createElement('video')
  //   call.on('stream', userVideoStream => {
  //     setStreams([...streams, userVideoStream])
  //   })
  //   call.on('close', () => {
  //     //  video.remove()
  //     console.log('closed')
  //   })
  // }

  const connectToNewUser = useCallback(
    (userId, stream) => {
      const call = myPeer.call(userId, stream)
      console.log('userId', userId)
      console.log('stream', stream)
      //   const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        setStreams([...streams, userVideoStream])
      })
      call.on('close', () => {
        //  video.remove()
        console.log('closed')
      })
    },
    [streams]
  )

  useEffect(() => {
   // console.log('othersVideos', othersVideos.current)
   console.log('socket',socket)
    if (socket) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(stream => {
          //  console.log('stream', stream)
          setmyStream(stream)

          myPeer.on('call', call => {
            call.answer(stream)
            //const video = document.createElement('video')
            call.on('stream', userVideoStream => {
              setStreams([...streams, userVideoStream])
            })
          })

          socket.on('user-connected', userId => {
            console.log('a user connected')
            connectToNewUser(userId, stream)
          })

          socket.on('user-disconnected', userId => {
            console.log(userId)
          })
        })
        .catch(error => {
          console.log(error)
        })
      myPeer.on('open', id => {
        socket.emit('join-room', 'ahmed', id)
      })
    }
  }, [socket])
  console.log('stream', streams)
  console.log('usersStream')
  //const socket = io("http://localhost:4000/");
  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        {socket ? <h6>connected</h6> : <h6>Not connected</h6>}
        myStream {myStream && <Video stream={myStream} />}
        usersStreams
        {streams.map(s => (
          <Video stream={s} />
        ))}
        {streams.map(s => (
          <p>{JSON.stringify(s.id)}</p>
        ))}
      </header>
    </div>
  )
}

export default App
