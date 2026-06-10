# Outlook email templates

Ready-to-send Outlook templates for the Nespresso × Montreux Jazz Festival invitations and confirmations.

Each file is an `.eml` that opens in Outlook with the right design, subject, and link already in place. You save it once as an Outlook **Modèle** (template), then compose every mail from that modèle.

## How to use (tested workflow)

### One-time per variant — create the modèle
1. **Double-click** the `.eml` file for the variant you need → it opens in Outlook.
2. **Fichier → Enregistrer sous → Modèle Outlook (`*.oft`)**
   *(File → Save As → Outlook Template)*.

### Every time you send
1. **Nouveaux éléments → Autres éléments → Choisir un formulaire…**
   *(New Items → More Items → Choose Form…)*
2. In **Regarder dans / Look In**, choose **Modèles utilisateur dans le système de fichiers**
   *(User Templates in File System)* → pick your modèle.
3. In the **À / To** field, type the recipient's email address.
4. In the body, replace the two placeholders:
   - `«First_Name»` → the recipient's first name
   - `«Sender_Name»` → your name (the sender)
5. Click **Envoyer / Send**.

> Composing **from the modèle** (rather than editing the `.eml` directly) gives you a clean new message each time and never overwrites the original template.

> **Images:** the banners and logo load from the live server, so the recipient needs images enabled (Outlook shows a "Download pictures / Télécharger les images" prompt the first time). Nothing is attached — the email stays lightweight.

> **Do not change the button link.** Each invitation file has its own "Confirm your attendance" link baked in (see the table). Sending the wrong file = wrong RSVP link.

## Which file to use

### Invitations
The letter (`o` / `t` / `z`) sets how many guests the recipient may bring; the day sets the date and the line-up.

| File | Day | Line-up | Guests allowed |
|------|-----|---------|----------------|
| `invitation_z_july_8.eml` | Wed 8 July, 17:00 | Sacha Keable & Tyla | 0 (recipient only) |
| `invitation_o_july_8.eml` | Wed 8 July, 17:00 | Sacha Keable & Tyla | 1 |
| `invitation_t_july_8.eml` | Wed 8 July, 17:00 | Sacha Keable & Tyla | 2 |
| `invitation_z_july_9.eml` | Thu 9 July, 17:00 | Joy Crookes & John Legend | 0 (recipient only) |
| `invitation_o_july_9.eml` | Thu 9 July, 17:00 | Joy Crookes & John Legend | 1 |
| `invitation_t_july_9.eml` | Thu 9 July, 17:00 | Joy Crookes & John Legend | 2 |

### Confirmations
Sent after someone confirms. No RSVP link.

| File | Day |
|------|-----|
| `confirmation_july_8.eml` | Wed 8 July, 17:00 |
| `confirmation_july_9.eml` | Thu 9 July, 17:00 |

## Regenerating

These files are generated from the source HTML in [`public/assets/mails/`](../public/assets/mails/). If a template changes, rebuild them:

```bash
python3 scripts/build-outlook-templates.py
```
