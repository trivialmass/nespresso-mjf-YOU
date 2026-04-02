import React from 'react';
import './Results.css';

const Results = ({ profile, answers, onRestart, userData }) => {
  const yesCount = answers.filter(a => a.answer === 'yes').length;
  const noCount = answers.filter(a => a.answer === 'no').length;

  // Parse the profile to extract title if it has markdown heading
  const lines = profile.split('\n');
  let title = 'Your Personality Profile';
  let content = profile;
  
  // Extract emoji and title from first line
  if  (lines[0].startsWith('##')) {
    title = lines[0].replace(/^##\s*/, '');
    content = lines.slice(1).join('\n');
  }

  const renderContent = (text) => {
    return text.split('\n\n').map((paragraph, index) => {
      const trimmed = paragraph.trim();
      
      // Skip empty paragraphs
      if (!trimmed) return null;
      
      // Horizontal rule
      if (trimmed === '---') {
        return <hr key={index} className="profile-divider" />;
      }
      
      // Section headers with emoji
      if (trimmed.match(/##/)) {
        const headerText = trimmed.replace(/^##\s*/, '');
        return <h2 key={index} className="profile-section-header">{headerText}</h2>;
      }
      
      // Vibe section
      if (trimmed.startsWith('Votre vibe :')) {
        const vibes = trimmed.replace('Votre vibe :', '').split('•').filter(v => v.trim());
        return (
          <div key={index} className="vibe-tags">
            {vibes.map((vibe, i) => (
              <span key={i} className="vibe-tag">{vibe.trim()}</span>
            ))}
          </div>
        );
      }
      
      // Blockquote
      if (trimmed.startsWith('>')) {
        return (
          <blockquote key={index} className="profile-quote">
            {trimmed.replace(/^>\s*/, '')}
          </blockquote>
        );
      }
      
      // Strategic positioning (metrics)
      if (trimmed.includes(':') && trimmed.match(/(élevé|moyen|faible)/)) {
        const [label, value] = trimmed.split(':').map(s => s.trim());
        return (
          <div key={index} className="metric-item">
            <span className="metric-label">{label}</span>
            <span className={`metric-value metric-${value.toLowerCase()}`}>{value}</span>
          </div>
        );
      }
      
      // Bold text with prediction
      if (trimmed.startsWith('**')) {
        const match = trimmed.match(/\*\*(.*?)\*\*\s*(.*)/);
        if (match) {
          return (
            <div key={index} className="profile-highlight">
              <strong>{match[1]}</strong>
              <p>{match[2]}</p>
            </div>
          );
        }
      }
      
      // Symbol line
      if (trimmed.startsWith('Symbole :')) {
        return (
          <div key={index} className="profile-symbol">
            {trimmed}
          </div>
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
        <p>Votre profile trivial YOU vous a été envoyé par email.</p>
        <p>Merci pour votre participation!</p>
        <a href='https://trivialmass.ch/' target="_blank" rel="noopener noreferrer">trivialmass.com</a>
      </div>
    </div>
  );
};

export default Results;
