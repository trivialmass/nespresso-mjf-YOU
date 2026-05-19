// Mock profile mirrors the server-side deterministic matching for dev mode.
// Returns a fixed profile so the UI renders correctly without a backend.
const getMockProfiles = (_answers) => {
  return `## L'artisan local

### VOTRE TYPE D'ÉVÉNEMENT : L'APÉRITIF DE LANCEMENT

Votre marque, c'est cet apéritif où l'hôte connaît tout le monde par son prénom. Pas besoin de gros buzz : les bonnes personnes sont là, et elles reviendront.

### NOTRE PROJET POUR VOUS

› Une identité visuelle qui sent la bonne hospitalité (logo, charte, supports imprimés)
› Un site vitrine accueillant comme une porte qu'on laisse ouverte
› Un apéritif annuel pour réunir vos habitués et leur permettre d'amener leurs amis`;
};

export default getMockProfiles;
