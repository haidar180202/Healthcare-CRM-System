// Forcing a file change to break the cache
import React, { useEffect, useState } from 'react';
import {
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client/react/hooks';
import { gql } from 'graphql-tag';
import { useNavigate } from 'react-router-dom';

const GET_CHAT_ROOMS = gql`
  query GetChatRooms {
    chatRooms {
      id
      name
    }
  }
`;

const GET_CHAT_ROOM = gql`
  query GetChatRoom($id: String!) {
    chatRoom(id: $id) {
      id
      name
      messages {
        id
        content
        sender {
          id
          email
        }
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($chatRoomId: String!, $content: String!) {
    sendMessage(chatRoomId: $chatRoomId, content: $content) {
      id
    }
  }
`;

const MESSAGE_SENT = gql`
  subscription MessageSent($chatRoomId: String!) {
    messageSent(chatRoomId: $chatRoomId) {
      id
      content
      sender {
        id
        email
      }
    }
  }
`;

function Chat() {
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { data: chatRoomsData, loading: chatRoomsLoading } =
    useQuery(GET_CHAT_ROOMS);
  const {
    data: chatRoomData,
    loading: chatRoomLoading,
    refetch,
  } = useQuery(GET_CHAT_ROOM, {
    variables: { id: selectedChatRoom },
    skip: !selectedChatRoom,
  });
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const { data: subscriptionData } = useSubscription(MESSAGE_SENT, {
    variables: { chatRoomId: selectedChatRoom },
    skip: !selectedChatRoom,
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (subscriptionData) {
      refetch();
    }
  }, [subscriptionData, refetch]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await sendMessage({
      variables: { chatRoomId: selectedChatRoom, content: message },
    });
    setMessage('');
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-200 p-4">
        <h2 className="text-xl font-bold mb-4">Chat Rooms</h2>
        {chatRoomsLoading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {chatRoomsData?.chatRooms.map((room) => (
              <li
                key={room.id}
                className={`p-2 cursor-pointer ${
                  selectedChatRoom === room.id ? 'bg-gray-300' : ''
                }`}
                onClick={() => setSelectedChatRoom(room.id)}
              >
                {room.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="w-3/4 p-4 flex flex-col">
        {chatRoomLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {chatRoomData?.chatRoom.messages.map((msg) => (
                <div key={msg.id} className="mb-2">
                  <strong>{msg.sender.email}:</strong> {msg.content}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 p-2 border rounded-l-md"
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 text-white rounded-r-md"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;