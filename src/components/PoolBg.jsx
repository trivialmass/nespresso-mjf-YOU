import React from 'react';
import './PoolBg.css';
import { poolBg } from '../../client-config/brand.js';

/**
 * Full-screen animated pool background wrapper.
 * overlay=false → blue + GIF only (RSVP screen)
 * overlay=true  → blue + GIF + navy 70% overlay (Tutorial, Loading, Results)
 */
const PoolBg = ({ overlay = false, children }) => (
  <div className="pool-bg">
    <img src={poolBg} className="pool-bg__gif" alt="" aria-hidden="true" />
    {overlay && <div className="pool-bg__overlay" />}
    <div className="pool-bg__content">
      {children}
    </div>
  </div>
);

export default PoolBg;
