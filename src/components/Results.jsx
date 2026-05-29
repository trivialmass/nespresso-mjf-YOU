import React from 'react';
import './Results.css';
import PoolBg from './PoolBg.jsx';

const Results = ({ profile }) => (
  <PoolBg overlay>
    <div className="results-frame">

      {/* White card — Figma: left:30 top:54 w:327 h:631 br:32 */}
      <div className="results-card">

        {/* Drink photo — top 298px of card */}
        {profile?.image
          ? <img src={profile.image} alt={profile.drink} className="results-card__photo" />
          : <div className="results-card__photo results-card__photo--placeholder" />
        }

        {/* Drink name + tagline — card-relative top:325 left:20 w:284 */}
        <div className="results-card__title-block">
          <h1 className="results-card__drink-name">{profile?.drink}</h1>
          <p className="results-card__tagline">{profile?.tagline}</p>
        </div>

        {/* Description — card-relative top:415 left:20 w:284 */}
        <p className="results-card__description">{profile?.description}</p>

      </div>

      {/* Nespresso × MJF logo — Figma: left:168 top:748 (centered) */}
      <div className="results-logo" aria-label="Nespresso × MJF">
        <svg width="53" height="54" viewBox="0 0 53 54" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_results)">
            <path d="M0 0V54H53V0H0Z" fill="#1C2869"/>
            <path d="M7.8348 12.505V12.3059C13.4886 10.2961 20.2657 11.9362 23.9538 15.605C24.5248 16.098 26.5374 18.3164 27.3237 19.2645C29.0928 21.3786 31.4611 24.7346 33.4736 27.3607V16.6574H36.3473V37.8649C33.1366 35.1914 29.8885 29.8919 27.4547 26.697C27.4547 26.697 22.737 20.2315 20.7619 17.9277C19.2361 16.0222 16.5964 13.927 14.743 13.235C12.2717 12.23 9.76309 12.0784 7.82544 12.505H7.8348Z" fill="white"/>
            <path d="M45.1651 41.6947C39.5113 43.7046 32.7342 42.0645 29.0367 38.3956C28.4657 37.9026 26.4532 35.6842 25.6763 34.7362C23.9071 32.622 21.5388 29.266 19.5263 26.64V37.3433H16.6526V16.1357C19.8633 18.8092 23.1114 24.1087 25.5358 27.3036C25.5358 27.3036 30.2536 33.7692 32.2287 36.0729C33.7545 37.9784 36.3942 40.0736 38.2382 40.7657C40.7095 41.7706 43.2181 41.9223 45.1558 41.4956V41.6947H45.1651Z" fill="white"/>
          </g>
          <defs>
            <clipPath id="clip0_results">
              <rect width="53" height="54" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </div>

    </div>
  </PoolBg>
);

export default Results;


export default Results;
