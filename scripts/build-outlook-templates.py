#!/usr/bin/env python3
"""Generate Outlook-ready .eml templates from the mail HTML files.

Each .eml carries `X-Unsent: 1`, so double-clicking it in Outlook (Windows/Mac)
opens a NEW, editable, sendable draft — the team fills in the recipient,
replaces «First_Name» and «Sender_Name», and clicks Send.

Re-run after editing any template in public/assets/mails/.
"""
import os, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "assets", "mails")
OUT = os.path.join(ROOT, "outlook-templates")

# Per-variant subject lines (ASCII-only for header safety; team can edit).
SUBJECTS = {
    "invitation_o_july_8": "Your invitation - Nespresso Terrasse at Montreux Jazz Festival, Wed 8 July",
    "invitation_t_july_8": "Your invitation - Nespresso Terrasse at Montreux Jazz Festival, Wed 8 July",
    "invitation_z_july_8": "Your invitation - Nespresso Terrasse at Montreux Jazz Festival, Wed 8 July",
    "invitation_o_july_9": "Your invitation - Nespresso Terrasse at Montreux Jazz Festival, Thu 9 July",
    "invitation_t_july_9": "Your invitation - Nespresso Terrasse at Montreux Jazz Festival, Thu 9 July",
    "invitation_z_july_9": "Your invitation - Nespresso Terrasse at Montreux Jazz Festival, Thu 9 July",
    "confirmation_july_8": "Your attendance is confirmed - Nespresso x Montreux Jazz Festival, Wed 8 July",
    "confirmation_july_9": "Your attendance is confirmed - Nespresso x Montreux Jazz Festival, Thu 9 July",
}

def to_crlf(s):
    return s.replace("\r\n", "\n").replace("\r", "\n").replace("\n", "\r\n")

os.makedirs(OUT, exist_ok=True)
count = 0
for path in sorted(glob.glob(os.path.join(SRC, "*.html"))):
    base = os.path.splitext(os.path.basename(path))[0]
    if base not in SUBJECTS:
        continue
    html = open(path, encoding="utf-8").read()
    headers = (
        "X-Unsent: 1\r\n"
        f"Subject: {SUBJECTS[base]}\r\n"
        "MIME-Version: 1.0\r\n"
        'Content-Type: text/html; charset="UTF-8"\r\n'
        "Content-Transfer-Encoding: 8bit\r\n"
        "\r\n"
    )
    eml = headers + to_crlf(html)
    out_path = os.path.join(OUT, base + ".eml")
    with open(out_path, "w", encoding="utf-8", newline="") as f:
        f.write(eml)
    print(f"OK  outlook-templates/{base}.eml")
    count += 1

print(f"done — {count} templates")
