import axios from 'axios';
import React, { useState } from 'react';

const ChatPage = ({chatcharacter, gameData, onNewMessage, setChat}) => {

  const [message, setMessage] = useState('');
  // 1. Add new state for loading
  const [isSending, setIsSending] = useState(false);

  const Chat = async () => {
    if (!message.trim() || isSending) return; // Don't send empty or while already sending

    console.log('sending message');
    setIsSending(true); // 2. Set loading to true

    try {
      // Send the chat message
      const res = await axios.post(`/api/v1/${gameData._id}/chat`, {
        "characterName": chatcharacter,
        "message": message
      });
      
      console.log('Message sent:', res);

      // Notify the parent component to refetch all game data
      onNewMessage(); 
      
      // Clear the input field
      setMessage('');

    } catch (error) {
      console.log('couldnt send message', error);
    } finally {
      // 3. Set loading to false after try/catch is complete
      setIsSending(false);
    }
  };

  // Handle 'Enter' key press on the input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevents newline, good practice
      Chat();
    }
  };

  return (
    <div className='min-h-screen w-full bg-neutral-900 bg-[url(d5.png)] bg-cover bg-center font-sans'>
      {/* Set max-height for the viewport */}
      <div className='min-h-screen w-full max-h-[90vh] flex flex-col justify-center items-center bg-black bg-opacity-90 p-4 sm:p-8'>
        
        {/* Main chat card: Uses flex-col to stack header, content, and footer */}
        <div className='w-full min-h-[80vh] max-w-4xl bg-amber-50 shadow-2xl rounded-lg overflow-hidden transform transition-all duration-500 ease-in-out scale-100 flex flex-col'>
          
          {/* 1. Header (Stays at top) - Use relative positioning for centering */}
          <div className='bg-stone-800 p-4 text-center relative flex justify-center items-center shrink-0'>
            <button
              type='button'
              // Position button absolutely within the relative header
              className='absolute left-4 top-1/2 -translate-y-1/2 text-lg font-serif font-bold text-amber-100 tracking-wider bg-stone-600 hover:bg-stone-500 py-2 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={() => setChat(false)}
              disabled={isSending} // 4. Disable button while sending
            >
              Back
            </button>
            <h1 className='text-2xl sm:text-4xl font-serif font-bold text-amber-100 tracking-wider'>{chatcharacter}</h1>
          </div>

          {/* 2. Chat History (Scrollable) */}
          <div className='flex-1 flex flex-col space-y-2 p-4 overflow-y-auto'>
            
            {/* Filter and map messages */}
            {gameData?.chatHistory
              ?.filter(chat => chat.characterName === chatcharacter)
              ?.map((chat, index) => { 
                
                const isAI = chat.sender === 'AI';
                
                return (
                  <div 
                    key={index} // Ideally, use a unique chat.id if available
                    className={`w-3/4 max-w-lg p-4 rounded-lg border shadow-sm
                                ${isAI ? 'ml-auto bg-white border-stone-200' 
                                       : 'mr-auto bg-stone-100 border-stone-200'}`}
                  >
                    <h3 className={`text-lg font-bold font-serif ${isAI ? 'text-red-900' : 'text-stone-800'}`}>
                      {chat.sender}
                    </h3>
                    <p className='text-stone-700 mt-1 text-sm leading-snug'>{chat.message}</p>
                  </div>
                );
              })
            }

            {/* 5. Add the loading dots animation */}
            {isSending && (
              <div className="ml-auto w-auto max-w-lg p-4 rounded-lg border shadow-sm bg-stone-100 border-stone-200">
                <div className="flex space-x-1 justify-center items-center h-5">
                  <div className="h-2 w-2 bg-stone-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-stone-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-stone-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            
          </div>

          {/* 3. Input Box (Stays at bottom) */}
          <div className='bg-stone-800 p-4 text-center shrink-0 flex items-center justify-center flex-wrap'>
            <input
              type="text"
              placeholder="Enter comment here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress} // Correctly placed on the input
              className="flex-1 min-w-[200px] h-12 p-3 rounded bg-stone-700 text-white placeholder:text-[#EAE5D6] border border-dashed border-amber-50 m-1 disabled:opacity-50"
              disabled={isSending} // 4. Disable input while sending
            />
            <button 
              type="button"
              onClick={Chat}
              className='text-xl sm:text-2xl font-serif font-bold text-amber-100 tracking-wider bg-stone-600 hover:bg-stone-500 h-12 py-2 px-6 rounded-md m-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isSending} // 4. Disable button while sending
            >
              Send
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default ChatPage;

