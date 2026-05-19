import './Congradulation.css';
import React, { useState, useEffect } from 'react';
import Results from './Results';
import logoCharging from '../logo/chargingLogo.svg';
import { saveQuizResult } from '../services/googleSheetsSave';

const Congradulation = ({ profile, answers, userData, onRestart, onReturnToLastQuestion }) => {
    const [showResultsCharging, setShowResultsCharging] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (showResultsCharging && !showResults) {
            const timer = setTimeout(() => {
                setShowResults(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showResultsCharging, showResults]);

    const handleShowResults = async () => {
        setShowResultsCharging(true);
        await saveQuizResult(userData, answers, profile);
    };

    return (
        <>
            {!showResults && (
                <div className="congradulation-container">
                    {!showResultsCharging && (
                        <>
                            <div className='congradulation-card'>
                                <h2 className="congradulationText">🎉</h2>
                                <h2 className="congradulationText">FÉLICITATIONS</h2>

                                <button
                                    className='buttonShowResults'
                                    onClick={handleShowResults}
                                >
                                    Voir mon profil
                                </button>
                            </div>
                            <button className='buttonReturn' onClick={onReturnToLastQuestion}>Retour</button>
                        </>
                    )}
                    {showResultsCharging && (
                        <div className="congradulation-card">
                            <img src={logoCharging} alt="Loading..." className="spinnerCharging" />
                            <h3 className="chargingText">Votre profil est en cours de création.</h3>
                        </div>
                    )}
                </div>
            )}
            {showResults && <Results profile={profile} answers={answers} onRestart={onRestart} userData={userData} />}
        </>
    );
}

export default Congradulation;