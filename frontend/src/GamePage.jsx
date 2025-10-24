import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChatPage from './ChatPage';
import AccusePage from './AccusePage';


// Main Game Page Component
const GamePage = ({context_ID}) => {
  const [gameData, setGameData] = useState(null);
  const [chat , setChat] =useState(false)
  const [chatcharacter, setChatcharacter] = useState('')
  const [accuse, setAccuse] = useState(false)
  
    // Fetches the game data from the API when the component mounts.
    const fetchGameContext = async () => {
      try {
        // Using the provided endpoint to fetch the specific game context.
        const response = await axios.get(`/api/v1/${context_ID}`);
        setGameData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch game data:', error);
        // You can add logic here to display an error message to the user.
      }
    };
useEffect(() => {
    fetchGameContext();
  }, []); // The empty dependency array ensures this effect runs only once on mount.

useEffect(() => {
  console.log('gameDataaaaaaaa',gameData)
},[gameData],[context_ID])

  const handleChatUpdate = (newGameData) => {
    fetchGameContext();
  };

  const Chat = async (character) => {
    setChatcharacter(character)
    setChat(true)
  }
  useEffect(() => {
    console.log('character to talk to:', chatcharacter)
    console.log('chatting? ',chat)
  },[chatcharacter, chat])

  // Location Icon SVG
  const LocationIcon = () => (
    <svg className="w-5 h-5 inline-block mr-2 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
    </svg>
  );

  if(accuse) {
      return <AccusePage gameData={gameData}/>
  } else {
      if(chat) { 
        return <ChatPage chatcharacter={chatcharacter} gameData={gameData} onNewMessage={handleChatUpdate} setChat={setChat}/>
      } else if(gameData) {
      return (
        <div className='min-h-screen w-full bg-neutral-900 bg-[url(d5.png)] bg-cover bg-center font-sans'>
          <div className='min-h-screen w-full flex flex-col justify-center items-center bg-black bg-opacity-50 p-4 sm:p-8'>
            
            {/* Render loading spinner while waiting for data, otherwise render the game content */}
            (
              <div className='w-full max-w-4xl bg-amber-50 shadow-2xl rounded-lg overflow-hidden transform transition-all duration-500 ease-in-out scale-95 hover:scale-100'>
                
                {/* Case File Header */}
                <div className='bg-stone-800 p-4 text-center'>
                  <h1 className='text-3xl sm:text-4xl font-serif font-bold text-amber-100 tracking-wider'>{gameData.theme}</h1>
                </div>
                
                <div className="p-6 sm:p-8">
                  {/* Story Section */}
                  <div className='mb-6 border-b-2 border-dashed border-stone-300 pb-6'>
                    <h2 className="text-2xl font-serif font-semibold text-stone-800 mb-3">The Incident Report</h2>
                    <p className='text-stone-700 leading-relaxed text-justify'>{gameData.story}</p>
                    <div className="mt-4 text-sm text-stone-600 italic">
                      <LocationIcon />
                      <strong>Location:</strong> {gameData.location}
                    </div>
                  </div>

                  {/* Suspects Section */}
                  <div>
                    <h2 className="text-2xl font-serif font-semibold text-stone-800 mb-4 text-center sm:text-left">Persons of Interest</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
                      {gameData.characters.map((character, index) => (
                        <button 
                        type="button"
                        onClick={() => Chat(character.name)}
                        key={index} className='bg-white p-4 rounded-md border border-stone-200 shadow-sm hover:shadow-lg transition-shadow duration-300'>
                          <h3 className='text-xl font-bold font-serif text-red-900'>{character.name}</h3>
                          <p className='text-stone-600 mt-2 text-sm leading-snug'>{character.bio}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-stone-800 px-10 py-5 text-center">
                  <button 
                  type='button'
                  onClick={() => setAccuse(true)}
                  className="text-3xl text-stone-200 font-bold font-serif">Make Accusation</button>
                </div> 
                {/* Case File Footer */}
                <div className="bg-stone-200 px-6 py-3 text-right">
                  <p className="text-xs text-stone-500 font-mono">CASE FILE: #{gameData._id}</p>
                </div>
              </div>
            )

          </div>
        </div>
        
      );}}
}

export default GamePage