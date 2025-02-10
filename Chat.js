import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import axios from 'axios';
import './Chat.css';

let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [privateMessage, setPrivateMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [files, setFiles] = useState([]);
  const ENDPOINT = 'http://localhost:5000';

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setName(name);
    setRoom(room);

    socket.emit('join', { name, room }, (error) => {
      if (error) {
        alert(error);
      }
    });

    return () => {
      socket.emit('disconnect');
      socket.off();
    }
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages(messages => [...messages, message]);
    });

    socket.on('privateMessage', (message) => {
      alert(`Private message from ${message.user}: ${message.text}`);
    });

    socket.on('roomData', ({ users }) => {
      setUsers(users);
    });
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message) {
      socket.emit('sendMessage', message, () => setMessage(''));
    }
  }

  const sendPrivateMessage = (event) => {
    event.preventDefault();

    if (privateMessage && recipient) {
      socket.emit('sendPrivateMessage', { message: privateMessage, recipient }, () => setPrivateMessage(''));
    }
  }

  const handleFileChange = (event) => {
    setFiles(event.target.files);
  }

  const handleFileUpload = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }
    formData.append('user', name);
    formData.append('room', room);

    try {
      await axios.post(`${ENDPOINT}/api/chat/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('File uploaded successfully');
    } catch (err) {
      console.error(err);
      alert('File upload failed');
    }
  }

  return (
    <div className="outerContainer">
      <div className="container">
        <div className="infoBar">
          <div className="leftInnerContainer">
            <h3>{room}</h3>
          </div>
          <div className="rightInnerContainer">
            <a href="/">Close</a>
          </div>
        </div>
        <div className="messages">
          {messages.map((message, i) => <div key={i}><b>{message.user}</b>: {message.text}</div>)}
        </div>
        <div className="inputContainer">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
        <div className="privateMessageContainer">
          <input
            placeholder="Recipient"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
          />
          <input
            placeholder="Private Message"
            value={privateMessage}
            onChange={(event) => setPrivateMessage(event.target.value)}
            onKeyPress={event => event.key === 'Enter' ? sendPrivateMessage(event) : null}
          />
          <button onClick={sendPrivateMessage}>Send Private Message</button>
        </div>
        <div className="fileUploadContainer">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
          />
          <button onClick={handleFileUpload}>Upload Files</button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
``