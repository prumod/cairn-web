"""Build and check the unified ÁUDIO + VISÃO timeline.

merge: join the TurboScribe part transcripts with continuous timestamps and
       interleave them with the video description.
    python3 -I timeline.py merge <work-dir>
    reads  partes.tsv, parte_NN.txt, video_description.txt
    writes linha_temporal_bruta.txt
check: validate the record format and order of a timeline file.
    python3 -I timeline.py check <file> [duration-seconds]
"""

import csv
import re
import sys
from pathlib import Path

TS = r"(?:\d{1,2}:)?\d{1,2}:\d{2}(?:[.,]\d+)?"
LEAD = re.compile(
    rf"^\s*[\[(]?\s*(?P<a>{TS})(?:\s*(?:-|–|-->)\s*(?P<b>{TS}))?\s*[\])]?\s*[:\-–]?\s*(?P<text>.*)$"
)
RECORD = re.compile(
    r"^\[(\d{2}:\d{2}:\d{2})(?: - (\d{2}:\d{2}:\d{2}))?\] \[(ÁUDIO|VISÃO)\] \S"
)


def seconds(ts):
    parts = [float(p.replace(",", ".")) for p in ts.split(":")]
    total = 0.0
    for p in parts:
        total = total * 60 + p
    return round(total)


def hms(s):
    return f"{s // 3600:02d}:{s % 3600 // 60:02d}:{s % 60:02d}"


def parse(path, offset=0):
    """Return [(start, end|None, text)]; untimed lines continue the previous record."""
    records = []
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        m = LEAD.match(line)
        if m:
            a = seconds(m["a"]) + offset
            b = seconds(m["b"]) + offset if m["b"] else None
            records.append([a, b, m["text"].strip()])
        elif records:
            records[-1][2] = f"{records[-1][2]} {line.strip()}".strip()
    if not records:
        sys.exit(f"{path}: no timestamped lines. Export the transcript with timestamps.")
    return records


def merge(work_dir):
    work = Path(work_dir)
    with open(work / "partes.tsv", encoding="utf-8") as f:
        parts = list(csv.DictReader(f, delimiter="\t"))
    duration = sum(int(p["duracao_s"]) for p in parts)

    rows = []
    for p in parts:
        for a, _, text in parse(work / f"{p['ficheiro']}.txt", int(p["inicio_s"])):
            rows.append((a, 1, f"[{hms(a)}] [ÁUDIO] {text}"))

    vision = parse(work / "video_description.txt")
    gaps, cursor = [], 0
    for a, b, text in vision:
        b = b if b is not None else a
        if a > cursor + 5:
            gaps.append((cursor, a))
        cursor = max(cursor, b)
        rows.append((a, 0, f"[{hms(a)} - {hms(b)}] [VISÃO] {text}"))
    if duration > cursor + 5:
        gaps.append((cursor, duration))

    rows.sort(key=lambda r: (r[0], r[1]))
    out = work / "linha_temporal_bruta.txt"
    out.write_text("\n\n".join(r[2] for r in rows) + "\n", encoding="utf-8")

    print(f"Wrote {out}: {sum(r[1] for r in rows)} ÁUDIO, {sum(1 - r[1] for r in rows)} VISÃO records.")
    print(f"Audio duration: {hms(duration)}; vision coverage ends at {hms(cursor)}.")
    for a, b in gaps:
        print(f"VISÃO gap: {hms(a)} - {hms(b)}")


def check(path, duration=None):
    errors, last = [], (-1, 0)
    text = Path(path).read_text(encoding="utf-8")
    body = text[text.find("\n[") + 1 :] if not text.startswith("[") else text
    for block in body.strip().split("\n\n"):
        first = block.splitlines()[0]
        m = RECORD.match(first)
        if not m:
            errors.append(f"bad record: {first[:80]}")
            continue
        a = seconds(m[1])
        if m[3] == "VISÃO" and (m[2] is None or seconds(m[2]) < a):
            errors.append(f"bad VISÃO interval: {first[:40]}")
        key = (a, 0 if m[3] == "VISÃO" else 1)
        if key < last:
            errors.append(f"out of order: {first[:40]}")
        last = max(last, key)
        if duration and a > int(duration):
            errors.append(f"after end of video: {first[:40]}")
    print("\n".join(errors) or f"{path}: OK")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "merge":
        merge(sys.argv[2])
    elif len(sys.argv) in (3, 4) and sys.argv[1] == "check":
        check(*sys.argv[2:])
    else:
        sys.exit(__doc__)
