const getMockProfiles = (answers) => {
  const yesCount = answers.filter((a) => a.answer === "yes").length;
  const noCount = answers.filter((a) => a.answer === "no").length;

  const ratio = yesCount / (yesCount + noCount);

  let archetype = "";
  let description = "";

  if (ratio > 0.7) {
    archetype = "🌟 The Enthusiastic Adventurer";
    description = `## 👤 🧑‍💼 Le Gardien Élégant

Vous êtes ce proche qu’on appelle pour un dîner entre amis où tout est parfaitement orchestré — nappes blanches, conversations profondes, et jamais un verre vide. Votre calme est une force, votre rigueur, une promesse.

Votre vibe : 🕊️ Serein • 📚 Rationnel • 🏛️ Authentique

---

## 🏢 🏢 Le Bastion Bienveillant

Imaginez un atelier d’horlogerie suisse au cœur d’un quartier animé : chaque pièce est précise, chaque client traité comme un membre de la famille, et les murs racontent des siècles de savoir-faire. Votre entreprise ne cherche pas à casser les codes — elle les affine, les transmet, et les rend accessibles sans jamais sacrifier la gravité.

Votre vibe : 🕰️ Stable • 🌍 Universel • 🤝 Confiant

**Prédiction :** Vos clients ne vous choisissent pas, ils vous adoptent — et vous deviendrez leur référence silencieuse, celle qu’on murmure à l’oreille quand on veut du solide.

---

## 🧭 Positionnement stratégique

Innovation : moyen  
Accessibilité : élevé  
Émotion : moyen  
Disruption : faible  
Relation humaine : élevé

Vous êtes l’architecte d’une confiance tranquille — pas de feux d’artifice, mais des fondations en béton armé qui font vibrer les cœurs par leur constance.

---

## ✨ Super-pouvoir de marque

**L’Équilibre Silencieux**

Vous transformez la rigueur en rassurance, la tradition en tendresse, et la stabilité en charme discret. Vos clients ne vous achètent pas un produit — ils s’offrent une promesse tenue, jour après jour.

Symbole : 🕊️`;
  } else if (ratio < 0.3) {
    archetype = "🎯 The Thoughtful Realist";
    description = `You're selective about what you commit to, and that's actually a superpower! Your careful approach means you value quality over quantity. You're probably the friend who gives the best advice and always has a well-thought-out plan B (and C, and D).

Your vibe: 🧠 Analytical • 🎨 Intentional • 🌙 Thoughtful

**Prediction:** Your discerning nature will help you avoid a major mishap this year that everyone else falls for. Trust your gut – it's usually right!`;
  } else {
    archetype = "👤 🌪️ L’Architecte Émotionnel";
    description = `Elle marche dans un atelier de design où les idées fusent comme des étincelles, mais chaque geste est pesé comme un coup de pinceau sur une toile vivante. Son rire résonne dans les réunions, mais derrière, c’est un cerveau qui cartographie les émotions humaines comme un GPS du cœur.

Votre vibe : 💡 Innovante • ❤️ Humaine • 🧭 Sécurisante

---

## 🏢 🌍 Le Café des Monde-Mêlés

Imaginez un café ouvert 24h/24 dans une gare internationale : des mugs fumants, des conversations en cinq langues, des tableaux blancs couverts de schémas agiles, et une équipe qui pivote comme un orchestre sans chef — mais qui joue toujours en harmonie. C’est là que les idées sérieuses se transforment en expériences accessibles, sans jamais perdre leur âme.

Votre vibe : 🌐 Internationale • 🚀 Agile • 🤝 Humaine

**Prédiction :** Votre prochaine campagne fera pleurer de rire les investisseurs… et les clients en même temps.

---

## 🧭 Positionnement stratégique

Innovation : élevé  
Accessibilité : élevé  
Émotion : élevé  
Disruption : moyen  
Relation humaine : élevé  

> Votre marque respire comme un souffle frais dans une pièce trop fermée — elle n’explose pas les codes, elle les réinvente avec un sourire et un café à la main.

---

## ✨ Super-pouvoir de marque

**L’Équilibriste Émotionnel**

Vous transformez la complexité en simplicité sans jamais sacrifier la profondeur — comme un chef qui rend un plat étoilé mangeable par tous, sans perdre son âme. Vos clients ne vous choisissent pas, ils vous adoptent.

Symbole : 🤹`;
  }
  return `## ${archetype}\n\n${description}`;
};

export default getMockProfiles;
