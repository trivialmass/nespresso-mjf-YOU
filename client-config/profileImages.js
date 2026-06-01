// Frontend-only — Vite resolves these at build time. Do NOT import in server.js.
import yuzuImg from './assets/nespresso-yuzu.avif';
import pinaColadaImg from './assets/nespresso-pina-colada.png';
import martiniImg from './assets/nespresso-martini.webp';

export const PROFILE_IMAGES = {
  bold:      yuzuImg,
  electric:  yuzuImg,
  pincolada: pinaColadaImg,
  classic:   martiniImg,
  pure:      martiniImg,
};
