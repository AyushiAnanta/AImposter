import React, { useEffect, useState } from 'react'
import axios from 'axios';
import GamePage from './GamePage';
import Loader from './Loader';
const Homepage = () => {
  const [loading, setLoading] = useState(false)
  const [context_ID, setContext_ID] = useState('')
  const [game, setGame] = useState(false)
  useEffect(() => {
        console.log('The loading state has changed to:', loading);
    }, [loading]);
    useEffect(() => {
        console.log('The game state has changed to:', game);
    }, [game]);
    useEffect(() => {
        console.log('The context_ID has is:', context_ID);
    }, [context_ID]);
    const startGame = async () => {
      setLoading(true)
      
        try {
            const res = await axios.post('/api/v1/',{
                "character_count": 4
            }
      );
      setLoading(false)
      
      console.log(' success:', res.data);
      setContext_ID(res.data?.data._id)
      setGame(true)
      
    } catch (error) {
      console.log('failed:', error.response?.data || error.message);
    }
    }

    if(loading) {
      return <Loader />
    } else if(game) {
      return <GamePage context_ID={context_ID}/>
    }
    else {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center fixed bg-[url(d1.png)] bg-no-repeat bg-cover bg-center">
      
        <h1 className='text-6xl special-elite-regular font-bold text-neutral-900 m-5'>AImposter</h1>
        <h5 className='text-2xl special-elite-regular font-bold text-neutral-700 px-3 align-center text-center'>Every character has a story, One of them is fiction.</h5>
        <button
        type="button"
        onClick={startGame}
        className="p-5 m-5 special-elite-regular text-neutral-400 bg-neutral-950 font-bold hover:bg-neutral-800 transition-all duration-200 rounded-3xl">Investigate</button>
    </div>
  )}
}

export default Homepage