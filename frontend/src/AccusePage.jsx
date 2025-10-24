import axios from 'axios'
import React, { useState } from 'react'
import ResultPage from './ResultPage'

const AccusePage = ({gameData}) => {

    const [win, setWin] = useState(0)
    const [result, setResult] = useState('')

    const MakeAccusation = async (char) => {
        console.log('accusation doinnnn')
        try {
            const res = await axios.post(`/api/v1/${gameData._id}/accuse`, {
                "characterName":char
            })
            console.log(res.data)
            setResult(res.data)
            if(res.data === 'won!!!') {
                setWin(1)
            } else {
                setWin(-1)
            }
        } catch (error) {
            console.log('something went wrong', error)
        }
    }

    if(win !=0) {
        return <ResultPage result={result}/>
    }
    else {
        return (
            <div className='min-h-screen w-full bg-neutral-900 bg-[url(d5.png)] bg-cover bg-center font-sans'>
                <div className='min-h-screen w-full max-h-[90vh] flex flex-col justify-center items-center bg-black bg-opacity-90 p-4 sm:p-8'>
                    <div className='w-full min-h-[80vh] max-w-4xl bg-amber-50 shadow-2xl rounded-lg overflow-hidden transform transition-all duration-500 ease-in-out scale-95 hover:scale-100 flex flex-col'>
                        <div className='bg-stone-800 p-4 text-center mb-5'>
                            <h1 className='text-3xl sm:text-4xl font-serif font-bold text-amber-100 tracking-wider'>Make Prediction</h1>
                        </div>
                        <div className='flex flex-col justify-center items-center'>
                            {gameData.characters.map((character, index) => (
                                <button 
                                type="button"
                                onClick={() => MakeAccusation(character.name)}
                                key={index} className='bg-white p-4 w-[80%] m-4 rounded-md border border-stone-200 shadow-sm hover:shadow-lg transition-shadow duration-300'>
                                <h3 className='text-xl font-bold font-serif text-red-900'>{character.name}</h3>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default AccusePage