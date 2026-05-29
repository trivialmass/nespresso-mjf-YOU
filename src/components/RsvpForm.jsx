import React, { useState } from 'react';
import './RsvpForm.css';
import PoolBg from './PoolBg.jsx';
import { rsvp } from '../../client-config/content.js';

const RsvpForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    attending: null,
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAttend = (value) => setForm({ ...form, attending: value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.email || form.attending === null) return;
    onSubmit(form);
  };

  const isValid = form.firstName && form.lastName && form.email && form.attending !== null;

  return (
    <PoolBg overlay={false}>
      <div className="rsvp-card">
        <h1 className="rsvp-title">{rsvp.heading}</h1>
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
          <input
            className="rsvp-input"
            type="tel"
            name="phone"
            placeholder={rsvp.phoneLabel}
            value={form.phone}
            onChange={handleChange}
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
          <button className="rsvp-cta" type="submit" disabled={!isValid}>
            {rsvp.ctaLabel}
          </button>
        </form>
      </div>
    </PoolBg>
  );
};

export default RsvpForm;
