import React, { useState } from 'react';
import './RsvpForm.css';
import PoolBg from './PoolBg.jsx';
import { rsvp, privacy } from '../../client-config/content.js';

const RsvpForm = ({ invitation, onSubmit }) => {
  const { dayLabel, concerts, maxGuests } = invitation;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    attending: null,
    guestCount: 0,
  });
  const [consent, setConsent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAttend = (value) => setForm({ ...form, attending: value, guestCount: value ? form.guestCount : 0 });
  const handleGuestCount = (count) => setForm({ ...form, guestCount: count });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || form.attending === null) return;
    onSubmit(form);
  };

  const isValid = form.firstName && form.lastName && form.email && form.attending !== null && consent;

  return (
    <PoolBg overlay={false}>
      <div className="rsvp-card">
        <h1 className="rsvp-title">{rsvp.heading}</h1>
        {dayLabel && (
          <p className="rsvp-date-label">{dayLabel}<br /><span className="rsvp-concerts">{concerts}</span></p>
        )}
        <form onSubmit={handleSubmit}>
          <input
            className="rsvp-input"
            type="text"
            name="firstName"
            placeholder={rsvp.firstNameLabel}
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <input
            className="rsvp-input"
            type="text"
            name="lastName"
            placeholder={rsvp.lastNameLabel}
            value={form.lastName}
            onChange={handleChange}
            required
          />
          <input
            className="rsvp-input"
            type="email"
            name="email"
            placeholder={rsvp.emailLabel}
            value={form.email}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className={`rsvp-radio${form.attending === true ? ' rsvp-radio--selected' : ''}`}
            onClick={() => handleAttend(true)}
          >
            <span className="rsvp-radio__dot" />
            {rsvp.attendYes}
          </button>
          <button
            type="button"
            className={`rsvp-radio${form.attending === false ? ' rsvp-radio--selected' : ''}`}
            onClick={() => handleAttend(false)}
          >
            <span className="rsvp-radio__dot" />
            {rsvp.attendNo}
          </button>

          {form.attending === true && maxGuests > 0 && (
            <div className="rsvp-guests">
              <p className="rsvp-guests__label">{rsvp.guestLabel}</p>
              <div className="rsvp-guests__options">
                {Array.from({ length: maxGuests + 1 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`rsvp-guests__btn${form.guestCount === i ? ' rsvp-guests__btn--selected' : ''}`}
                    onClick={() => handleGuestCount(i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="rsvp-privacy">{privacy.notice}</p>
          <div className="rsvp-consent">
            <input
              type="checkbox"
              id="rsvp-consent"
              checked={consent}
              onChange={() => setConsent(c => !c)}
            />
            <label htmlFor="rsvp-consent">{privacy.consentLabel}</label>
          </div>

          <button className="rsvp-cta" type="submit" disabled={!isValid}>
            {rsvp.ctaLabel}
          </button>
        </form>
      </div>
    </PoolBg>
  );
};

export default RsvpForm;
