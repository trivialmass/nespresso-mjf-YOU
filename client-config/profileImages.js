// Frontend-only — Vite resolves these at build time. Do NOT import in server.js.
import yuzuImg from './assets/nespresso-yuzu.jpg';
import pinaColadaImg from './assets/nespresso-pina-colada.jpg';
import martiniImg from './assets/nespresso-martini.jpg';

export const PROFILE_IMAGES = {
  bold:      yuzuImg,
  electric:  yuzuImg,
  pincolada: pinaColadaImg,
  classic:   martiniImg,
  pure:      martiniImg,
};
