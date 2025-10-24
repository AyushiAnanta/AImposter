import React from 'react'

const ResultPage = ({result}) => {
  return (
    <div className='min-h-screen w-full bg-neutral-900 bg-[url(d5.png)] bg-cover bg-center font-sans'>
        <div className='min-h-screen w-full max-h-[90vh] flex flex-col justify-center items-center bg-black bg-opacity-90 p-4 sm:p-8'>
            <div className='w-full min-h-[80vh] max-w-4xl bg-amber-50 shadow-2xl rounded-lg overflow-hidden transform transition-all duration-500 ease-in-out scale-100 flex flex-col justify-center'>
                <div className='fixed mt-0 bg-stone-800 p-4 text-center relative flex justify-center items-center shrink-0'>
                <h1 className='text-4xl sm:text-4xl font-serif font-bold text-amber-100 tracking-wider'>{result.data}</h1>
                </div>
                <div className='flex-1 flex flex-col justify-center items-center border-2 border-dashed border-stone-300 pb-6 p-4 m-2 '>
                    <h2 className="text-3xl text-center font-serif font-bold text-stone-800 mb-3">Truth</h2>
                    <p className='text-stone-700 font-semibold leading-relaxed text-justify'>{result.message.truth}</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ResultPage