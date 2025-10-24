import React from 'react';
import './Loader.css'; // Make sure this CSS file exists

const LoadingPage = () => {
  return (
    <div className="bg-black flex flex-wrap place-content-center h-[100vh] w-[100vw]  m-0">
      <aside className="container-loader">
        <article
          style={{ '--color': '#ff6347', '--i': '13px', '--d': '6.8s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#00ced1', '--i': '19px', '--d': '3.5s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#adff2f', '--i': '11px', '--d': '4.9s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#9370db', '--i': '17px', '--d': '9.3s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#ff1493', '--i': '14px', '--d': '2.7s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#00bfff', '--i': '10px', '--d': '5.1s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#7fff00', '--i': '16px', '--d': '6.6s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#dc143c', '--i': '18px', '--d': '7.2s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#8a2be2', '--i': '12px', '--d': '8.4s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#48d1cc', '--i': '20px', '--d': '3.9s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#ff4500', '--i': '15px', '--d': '4.6s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#00ff7f', '--i': '19px', '--d': '5.7s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#ba55d3', '--i': '11px', '--d': '7.1s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#1e90ff', '--i': '13px', '--d': '9.7s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#ffa500', '--i': '10px', '--d': '6.2s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#ff69b4', '--i': '14px', '--d': '3.4s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#00fa9a', '--i': '17px', '--d': '8.9s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#9400d3', '--i': '12px', '--d': '7.6s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#ffb6c1', '--i': '16px', '--d': '4.3s' }}
          className="ball"
        ></article>
        <article
          style={{ '--color': '#20b2aa', '--i': '18px', '--d': '2.8s' }}
          className="ball"
        ></article>
      </aside>
    </div>
  );
};

export default LoadingPage;