import './PopupInscription.css';
import React, { useState } from 'react';

function PopupInscription({ setShowPopup, setUserData, setShowPret }) {
    const [checkbox, setCheckbox] = useState(false);
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!name || !company || !email) {
            setError('Veuillez remplir tous les champs.');
            return;
        }
        if (!checkbox) {
            setError('Veuillez accepter les conditions générales.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Veuillez entrer une adresse email valide.');
            return;
        }
        setUserData(prevData => [
            ...prevData,
            { name, company, email }
        ]);
        setError('');
        setShowPret(true);
        setShowPopup(false);
    };

    return (
        <div className="popupInscription">
            <div className='popupContent'>
                <div className='closeButtonContainer'>
                    <div onClick={() => setShowPopup(false)} className="closeButton" tabIndex="0" role="button" aria-label="Close">×</div>
                </div>
                <h2 className='popupHeader'>S’INSCRIRE</h2>
                <div className="inputFields">
                    <input
                        className='popupInput'
                        type="text"
                        placeholder="Prénom Nom"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <input
                        className='popupInput'
                        type="text"
                        placeholder="Entreprise"
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                    />
                    <input
                        className='popupInput'
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <p className="popupInformation">Les données d’inscription sont utilisées uniquement dans le cadre du jeu entre Trivial Mass et le participant. Elles ne sont ni exploitées commercialement ni transmises à des tiers.</p>
                <div className="consentContainer">
                    <input
                        type="checkbox"
                        id="consent"
                        className="consentButton"
                        checked={checkbox}
                        onChange={() => setCheckbox(!checkbox)}
                    />
                    <label className="consentLabel" htmlFor="consent">
                        J’accepte les conditions générales
                    </label>
                </div>
                <button
                    onClick={handleSubmit}
                    className="inscriptionButton"
                >
                    Je m’inscris et je joue
                </button>
            </div>
        </div>
    );
}

export default PopupInscription;