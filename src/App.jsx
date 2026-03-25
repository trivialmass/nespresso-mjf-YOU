import React, { useState, useEffect } from "react";
import './App.css';
import logoGame from './logo/logoGame.svg';
import PopupInscription from "./components/PopupInscription";
import Questions from './Questions';

function App() {
  const [showPret, setShowPret] = useState(false);
  const [readyStart, setReadyStart] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [userData, setUserData] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReadyStart(true);
    }, 2000);
  }, []);
  return (
    <>
      {!showQuestions ? (
        <div className="inscriptionsPage">
          <div className={`appSlideUp${readyStart ? " slideUp" : ""}`}>
            <img src={logoGame} alt="Logo" className="logoGame" />
          </div>
          <div className="introduction">
            <h2 className="introductionHeader">HELLO!</h2>
            <p className="introductionText">Notre métier? Apprendre à vous connaître pour imaginer des projets créatifs qui vous ressemblent vraiment.</p>
            <p className="introductionText">Avec le quiz Trivial YOU, nous vous proposons une première rencontre ludique, rapide et inspirante pour mieux vous connaître.</p>
            <p className="introductionText">Quelques questions, un moment amusant… et peut-être le début d’une belle collaboration.</p>
            <p className="introductionText">Bonne partie ! 🎉</p>
            <button className="introductionButton" onClick={() => setShowPopup(true)}>Suivant</button>
          </div>
          {showPopup && <PopupInscription setShowPopup={setShowPopup} setUserData={setUserData} setShowPret={setShowPret} />}
          <div className={`appSlideDown${showPret ? " slideDown" : ""}${!showPret ? " slideUp" : ""}`}>
            <div className="startGameContent">
              <h1 className="startGameHeader">PRÊT·E·S?</h1>
              <button
                onClick={() => {
                  setShowPret(false);
                  setShowQuestions(true);
                }}
                className="startGameButton"
              >
                C'est partit !
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Questions userData={userData}/>
      )}
    </>
  );
}

export default App;