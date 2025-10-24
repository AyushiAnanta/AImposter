import { TypeAnimation } from 'react-type-animation';
 
const Loader = () => {
  return (
    <div className='special-elite-regular fixed bg-[url(d2.png)] bg-no-repeat bg-cover bg-center flex flex-col items-center justify-center text-black h-full w-full' >
        <div className="w-16 h-16 p-4 border-4 border-dashed rounded-full animate-spin border-amber-800"></div>
    <TypeAnimation  className='text-center'
      sequence={[
  'Every story has a flaw...',
  1500,
  'One of them is not who they seem...',
  1500,
  'A clever lie often mimics the truth.',  // New line
  1500,
  'Listen carefully to what isn\'t said.', // New line
  1500,
  'Trust your instincts, but verify everything.',
  1500,
  'Doubt is your most valuable tool.',     // New line
  1500,
  'Don\'t let the imposter fool you.',
  2500, // Slightly longer pause at the end

        () => {
          console.log('Sequence completed');
        },
      ]}
      wrapper="span"
      cursor={true}
      repeat={Infinity}
      style={{ fontSize: '2em', display: 'inline-block' }}
      speed={20}
    /></div>
  );
};

export default Loader