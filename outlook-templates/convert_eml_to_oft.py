#!/usr/bin/env python3
"""Convert EML files to OFT (Outlook Template) format."""

import struct
from email import message_from_file
from email.header import decode_header, make_header
from pathlib import Path
from extract_msg import OleWriter


def decode_str(s):
    if s is None:
        return ''
    return str(make_header(decode_header(s)))


def build_properties_stream(props):
    """Build the __properties_version1.0 stream (8-byte header + 16 bytes per property)."""
    data = b'\x00' * 8  # reserved header for top-level message object
    for prop_type, prop_id, value in props:
        data += struct.pack('<HHI', prop_type, prop_id, 0)  # type, id, flags=0
        if prop_type in (0x0003, 0x000B):  # PT_LONG, PT_BOOLEAN
            data += struct.pack('<I', int(value)) + b'\x00' * 4
        else:  # variable-length: store byte size
            data += struct.pack('<II', len(value), 0)
    return data


def eml_to_oft(eml_path: Path, oft_path: Path):
    with open(eml_path, 'r', encoding='utf-8', errors='replace') as f:
        msg = message_from_file(f)

    subject = decode_str(msg.get('Subject', ''))

    if msg.is_multipart():
        html_body = ''
        for part in msg.walk():
            if part.get_content_type() == 'text/html':
                html_body = (part.get_payload(decode=True) or b'').decode('utf-8', errors='replace')
                break
    else:
        payload = msg.get_payload(decode=True)
        html_body = payload.decode('utf-8', errors='replace') if payload else msg.get_payload() or ''

    PT_UNICODE = 0x001F
    PT_BINARY  = 0x0102
    PT_LONG    = 0x0003
    PT_BOOLEAN = 0x000B

    msg_class_bytes = ('IPM.Note\x00').encode('utf-16-le')
    subject_bytes   = (subject + '\x00').encode('utf-16-le')
    html_bytes      = html_body.encode('utf-8')

    props = [
        (PT_LONG,    0x0E07, 8),              # PR_MESSAGE_FLAGS: MSGFLAG_UNSENT
        (PT_BOOLEAN, 0x0E1B, 0),              # PR_HASATTACH: False
        (PT_UNICODE, 0x001A, msg_class_bytes), # PR_MESSAGE_CLASS
        (PT_UNICODE, 0x0037, subject_bytes),   # PR_SUBJECT
        (PT_BINARY,  0x1013, html_bytes),      # PR_HTML
    ]

    writer = OleWriter()
    writer.addEntry('__properties_version1.0', build_properties_stream(props))
    writer.addEntry('__substg1.0_001A001F', msg_class_bytes)
    writer.addEntry('__substg1.0_0037001F', subject_bytes)
    writer.addEntry('__substg1.0_10130102', html_bytes)
    writer.write(str(oft_path))


def main():
    folder = Path(__file__).parent
    eml_files = sorted(folder.glob('*.eml'))

    if not eml_files:
        print('No EML files found.')
        return

    print(f'Converting {len(eml_files)} file(s)...')
    for eml_path in eml_files:
        oft_path = eml_path.with_suffix('.oft')
        eml_to_oft(eml_path, oft_path)
        print(f'  {eml_path.name} → {oft_path.name}')
    print('Done.')


if __name__ == '__main__':
    main()
