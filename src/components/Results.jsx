import React from 'react';
import './Results.css';

const Results = ({ profile, answers, onRestart, userData }) => {
  const yesCount = answers.filter(a => a.answer === 'yes').length;
  const noCount = answers.filter(a => a.answer === 'no').length;

  // Parse the profile: ## = profile title, rest = content
  const lines = profile.split('\n');
  let title = 'Votre profil';
  let content = profile;
  
  if (lines[0].startsWith('##')) {
    title = lines[0].replace(/^##\s*/, '');
    content = lines.slice(1).join('\n');
  }

  const renderContent = (text) => {
    return text.split('\n\n').map((paragraph, index) => {
      const trimmed = paragraph.trim();
      
      if (!trimmed) return null;

      // ### sub-section headers (Votre type d'événement, Notre projet)
      if (trimmed.startsWith('###')) {
        const headerText = trimmed.replace(/^###\s*/, '');
        return <h3 key={index} className="profile-sub-header">{headerText}</h3>;
      }

      // › list items
      if (trimmed.includes('\n›') || trimmed.startsWith('›')) {
        return (
          <ul key={index} className="profile-list">
            {trimmed.split('\n').filter(l => l.trim()).map((line, i) => (
              <li key={i}>{line.replace(/^›\s*/, '')}</li>
            ))}
          </ul>
        );
      }
      
      // Regular paragraph
      return <p key={index}>{trimmed}</p>;
    });
  };

  return (
    <div className="results-container">
      <div className="results-card">
        <div className="results-header">
          <h1>{title}</h1>
        </div>

        <div className="results-content">
          <div className="profile-text">
            {renderContent(content)}
          </div>
        </div>

        <div className="results-actions">
          <button className="restart-button" onClick={onRestart}>
            Refaites le quiz
          </button>
          <button className='share-button' onClick={() => {
            const mailtoLink = `mailto:${encodeURIComponent(userData.userData[0].email)}?subject=Je viens de répondre au quiz « trivial YOU ! ». Va jeter un œil à mon profil :&body=${encodeURIComponent(title)}, ${encodeURIComponent(content)}`;
            window.location.href = mailtoLink;
          }}>
            Partager les résultats
          </button>
        </div>
      </div>
      <div className='results-subtext'>
        <p>Votre profil trivial YOU vous a été envoyé par email.</p>
        <p>Merci pour votre participation!</p>
        <a href='https://trivialmass.ch/' target="_blank" rel="noopener noreferrer">trivialmass.com</a>
      </div>
    </div>
  );
};

export default Results;
