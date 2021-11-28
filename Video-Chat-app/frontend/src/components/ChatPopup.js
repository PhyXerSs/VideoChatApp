import React, { useEffect, useState } from 'react';
import { Launcher } from 'popup-chat-react';
import './ChatPopup.css'

function ChatPopup(props) {
  const { socket, chatId } = props;
  const [state, setState] = useState({
    messageList: [],
    newMessagesCount: 0,
    isOpen: false,
    fileUpload: true,
  });

  function onMessageWasSent(message) {
    setState(state => ({
      ...state,
      messageList: [...state.messageList, message]
    }));
    socket.emit('sendMessage',{
        to:chatId,
        message:message.data.text
    })
  }

  function onFilesSelected(fileList) {
    const objectURL = window.URL.createObjectURL(fileList[0]);

    setState(state => ({
      ...state,
      messageList: [
        ...state.messageList,
        {
          type: 'file', author: 'me',
          data: {
            url: objectURL,
            fileName: fileList[0].name,
          }
        }
      ]
    }));
  }

  function sendMessage(text) {
    
    //   let MessagesCount = !state.isOpen ? state.newMessagesCount +1 : 0 ;
      console.log(state.newMessagesCount);
      setState(state => ({
        ...state,
        newMessagesCount: state.newMessagesCount+1,
        messageList: [
          ...state.messageList,
          {
            author: 'them',
            type: 'text',
            data: { text }
          }
        ],
      }));
      
    
  }

  function onClick() {
    setState(state => ({
      ...state,
      isOpen: !state.isOpen,
      newMessagesCount: 0
    }));
  }

  useEffect(()=>{
    console.log(chatId)
    socket.on('reciveMessage',(message)=>{
        sendMessage(message)
    })
  },[])
  

  return (
    <div className="chat-popup">
      {/* <Header /> */}

      {/* <TestArea
        onMessage={sendMessage}
      /> */}

      <Launcher 
        agentProfile={{
          teamName: 'popup-chat-react',
          imageUrl: 'https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png'
        }}
        onMessageWasSent={onMessageWasSent}
        onFilesSelected={onFilesSelected}
        messageList={state.messageList}
        newMessagesCount={state.newMessagesCount}
        onClick={onClick}
        isOpen={state.isOpen}
        showEmoji={false}
        fileUpload={state.fileUpload}
        
        placeholder='placeholder'
      />

      {/* <img className="demo-monster-img" src='{monsterImgUrl}' /> */}
      {/* <Footer /> */}
    </div>
  );
}

export default ChatPopup;