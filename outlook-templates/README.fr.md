# Modèles d'e-mails Outlook

Modèles Outlook prêts à l'envoi pour les invitations et confirmations Nespresso × Montreux Jazz Festival.

Chaque fichier est un `.eml` qui s'ouvre dans Outlook avec le bon design, l'objet et le lien déjà en place. Vous l'enregistrez une fois comme **Modèle** Outlook, puis vous composez chaque e-mail à partir de ce modèle.

## Mode d'emploi (procédure testée)

### Une seule fois par variante — créer le modèle
1. **Double-cliquez** sur le fichier `.eml` de la variante voulue → il s'ouvre dans Outlook.
2. **Fichier → Enregistrer sous → Modèle Outlook (`*.oft`)**.

### À chaque envoi
1. **Nouveaux éléments → Autres éléments → Choisir un formulaire…**
2. Dans **Regarder dans**, choisissez **Modèles utilisateur dans le système de fichiers** → sélectionnez votre modèle.
3. Dans le champ **À**, saisissez l'adresse e-mail du destinataire.
4. Dans le corps du message, remplacez les deux espaces réservés :
   - `«First_Name»` → le prénom du destinataire
   - `«Sender_Name»` → votre nom (l'expéditeur)
5. Cliquez sur **Envoyer**.

> Composer **à partir du modèle** (plutôt que de modifier le `.eml` directement) vous donne un nouveau message propre à chaque fois et n'écrase jamais le modèle d'origine.

> **Images :** les bandeaux et le logo se chargent depuis le serveur en ligne ; le destinataire doit donc autoriser l'affichage des images (Outlook affiche une invite « Télécharger les images » la première fois). Rien n'est joint — l'e-mail reste léger.

> **Ne modifiez pas le lien du bouton.** Chaque fichier d'invitation contient son propre lien « Confirmez votre présence » (voir le tableau). Envoyer le mauvais fichier = mauvais lien de réponse.

## Quel fichier utiliser

### Invitations
La lettre (`o` / `t` / `z`) définit le nombre d'invités que le destinataire peut amener ; le jour définit la date et la programmation.

| Fichier | Jour | Programmation | Invités autorisés |
|---------|------|---------------|-------------------|
| `invitation_z_july_8.eml` | Mer. 8 juillet, 17h00 | Sacha Keable & Tyla | 0 (destinataire seul) |
| `invitation_o_july_8.eml` | Mer. 8 juillet, 17h00 | Sacha Keable & Tyla | 1 |
| `invitation_t_july_8.eml` | Mer. 8 juillet, 17h00 | Sacha Keable & Tyla | 2 |
| `invitation_z_july_9.eml` | Jeu. 9 juillet, 17h00 | Joy Crookes & John Legend | 0 (destinataire seul) |
| `invitation_o_july_9.eml` | Jeu. 9 juillet, 17h00 | Joy Crookes & John Legend | 1 |
| `invitation_t_july_9.eml` | Jeu. 9 juillet, 17h00 | Joy Crookes & John Legend | 2 |

### Confirmations
Envoyées après qu'une personne a confirmé sa présence. Aucun lien de réponse.

| Fichier | Jour |
|---------|------|
| `confirmation_july_8.eml` | Mer. 8 juillet, 17h00 |
| `confirmation_july_9.eml` | Jeu. 9 juillet, 17h00 |

## Régénération

Ces fichiers sont générés à partir du HTML source dans [`public/assets/mails/`](../public/assets/mails/). Si un modèle change, régénérez-les :

```bash
python3 scripts/build-outlook-templates.py
```
