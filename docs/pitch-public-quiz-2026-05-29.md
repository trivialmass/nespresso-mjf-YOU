# Pitch — Public Quiz & Invitation Upgrade
**Nespresso × Montreux Jazz Festival** · Trivialmass · May 2026

---

## The Idea

The quiz doesn't have to stop at the invitation list.

Right now, the *Quel est votre profil café ?* experience is reserved for invited guests. We propose two complementary upgrades that extend its reach — before and beyond the event.

---

## 1. Smarter Invitations

Today, every invited guest receives the same link. We propose upgrading to **personalised invitation links** — each guest receives a unique URL that unlocks their private experience.

**What changes for guests:** nothing visible. They click their link, fill in the RSVP, and discover their coffee profile exactly as before.

**What it enables behind the scenes:**
- Each link is valid for a specific person and expires after the event
- The July 8th priority batch can automatically see a **+1 option** in their RSVP — others don't
- Invalid or expired links show a clear, branded error message rather than a broken experience
- The team gains full visibility: who opened their link, who RSVP'd, when

**How it fits into the existing email workflow:**
The invitation email template already uses Outlook mail merge fields (`«First_Name»`, `«Sender_Name»`). Adding personalised links requires only one change to the template — appending `?key=«Invitation_Key»` to the existing button URL. No new tools or processes are needed. We provide the client with a ready-to-use CSV (one row per guest, with their unique key pre-generated); the mail merge handles the rest exactly as today.

---

## 2. A Public Version of the Quiz

A stripped-down version of the same quiz — no RSVP, open to anyone — can be shared freely by invited guests, influencers, and Nespresso's own channels (newsletter, social media).

**The experience:**
1. Visitor takes the 3-question swipe quiz
2. They discover their signature coffee recipe
3. A simple message invites them to come taste it live:
   > *"Découvrez votre recette café signature — et venez la déguster à la Nespresso Terrasse, Montreux Jazz Festival."*
4. They can enter a **prize draw** to win a VIP pack: 2 terrace invitations + 2 signature cocktails

The winner is selected manually by the Nespresso team from all entries.

---

## Why It Works

| | Private (invited guests) | Public (open) |
|---|---|---|
| Access | Personalised link | Open URL |
| RSVP | Yes | No |
| Coffee profile | ✓ | ✓ |
| Prize draw | — | ✓ |
| +1 option | Selected guests (July 8th batch) | — |

- **Invited guests become ambassadors** — sharing a branded quiz is a natural, low-friction act
- **Influencers get shareable content** — a personalised result they want to post
- **Nespresso extends reach** without paid media, anchored to a concrete CTA (visit the terrace)
- **The prize draw creates urgency** and a reason to submit contact details ahead of the event

---

## Questions & Answers

**On transmet quoi à Nespresso ? Juste un fichier OFT, et ils modifient le nom ?**

Nespresso reçoit deux fichiers : le template OFT mis à jour (avec les champs de fusion déjà en place — y compris le champ clé) et un fichier Excel/CSV prêt à l'emploi, avec une ligne par invité (prénom, expéditeur, email, clé unique). Ils n'ont rien à modifier manuellement. Ils lancent le publipostage dans Outlook exactement comme aujourd'hui pour le champ `«First_Name»` — c'est le même processus, on ajoute simplement une colonne au tableau.

**Comment le lien est-il nominatif ?**

Chaque ligne du fichier Excel contient une clé unique générée par nous. Lors du publipostage, Outlook remplace automatiquement `«Invitation_Key»` dans l'URL du bouton par la clé de cette personne. Chaque email envoyé contient donc une URL différente. Cette clé est enregistrée côté serveur : quand l'invité clique, l'application reconnaît son invitation et lui affiche le bon formulaire (avec ou sans option +1 selon son profil).

**Fait-on un OFT par personne ?**

Non. Un seul template OFT pour tous. Le publipostage gère la personnalisation automatiquement — un template + un tableau Excel = N emails personnalisés. Aucune intervention manuelle par personne.

**Comment s'assure-t-on que tous les liens fonctionnent, sans aucune erreur d'accès ?**

C'est le point le plus important, et voici le protocole qu'on propose :

1. **Avant tout envoi :** on charge toutes les clés dans la base de données — les liens sont actifs avant même que le premier email parte.
2. **Test bout en bout :** on génère 3 à 5 lignes de test dans le fichier Excel et on effectue un vrai publipostage vers des adresses internes (Trivialmass + Nespresso si souhaité). On clique chaque lien reçu dans Outlook Desktop, Apple Mail et sur mobile pour vérifier que l'URL est correctement formée dans toutes les versions du bouton (VML Outlook et HTML).
3. **Checklist de validation** fournie au client avant l'envoi : liens testés ✓, base de données chargée ✓, expiration configurée ✓.
4. **Filet de sécurité :** si un lien est cassé ou mal copié, l'application affiche une page d'erreur claire avec un message de contact — l'invité n'est jamais bloqué sans explication.
5. **Monitoring post-envoi :** on reste disponibles le jour J pour corriger immédiatement tout cas isolé signalé.

---

## Ce qu'il nous faudrait confirmer

- Feu vert sur la version publique (organique ou avec tirage au sort)
- Contenu du pack VIP pour la communication du tirage
- Nombre approximatif d'invités par vague (pour la génération des clés)
- Date d'expiration souhaitée pour les liens d'invitation

---

*L'implémentation technique est entièrement cadrée et prête à démarrer dès validation client.*
