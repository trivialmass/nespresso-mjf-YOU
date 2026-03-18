import './Congradulation.css';
import React, { useState, useEffect } from 'react';
import Results from './Results';
import logoCharging from '../logo/chargingLogo.svg';

const Congradulation = ({ profile, answers, onRestart, onReturnToLastQuestion }) => {
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

    return (
        <>
            {!showResults && (
                <div className="congradulation-container">
                    {!showResultsCharging && (
                        <>
                            <div className='congradulation-card'>
                                <h2 className="congradulationText">🎉</h2>
                                <h2 className="congradulationText">Félicitations</h2>

                                <button
                                    className='buttonShowResults'
                                    onClick={() => { setShowResultsCharging(true); }}
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
                            <h3 className="chargingText">Votre profile est en cours de création.</h3>
                        </div>
                    )}
                </div>
            )}
            {showResults && <Results profile={profile} answers={answers} onRestart={onRestart} />}
        </>
    );
}

export default Congradulation;