import React, { useState } from 'react';
import './RsvpForm.css';
import { rsvp } from '../../client-config/content.js';

const RsvpForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    attending: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAttend = (value) => {
    setForm({ ...form, attending: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.email || form.attending === null) return;
    onSubmit(form);
  };

  const isValid = form.firstName && form.email && form.attending !== null;

  return (
    <div className="rsvp-page">
      <div className="rsvp-band">
        <p className="rsvp-eyebrow">{rsvp.eyebrow}</p>
        <h1 className="rsvp-heading">{rsvp.heading}</h1>
      </div>
      <form className="rsvp-form" onSubmit={handleSubmit}>
        <p className="rsvp-subheading">{rsvp.subheading}</p>
        <div className="rsvp-fields">
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
        </div>
        <div className="rsvp-attend-buttons">
          <button
            type="button"
            className={`rsvp-attend ${form.attending === true ? 'selected' : ''}`}
            onClick={() => handleAttend(true)}
          >
            {rsvp.attendYes}
          </button>
          <button
            type="button"
            className={`rsvp-attend ${form.attending === false ? 'selected' : ''}`}
            onClick={() => handleAttend(false)}
          >
            {rsvp.attendNo}
          </button>
        </div>
        <button className="rsvp-cta" type="submit" disabled={!isValid}>
          {rsvp.ctaLabel}
        </button>
      </form>
    </div>
  );
};

export default RsvpForm;
