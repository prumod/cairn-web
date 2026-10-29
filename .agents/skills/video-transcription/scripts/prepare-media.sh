#!/usr/bin/env bash
# Split a recording into an MP3 audio track, a silent MP4 video track and
# MP3 parts short enough for one TurboScribe free transcription each.
# Usage: prepare-media.sh <video> <work-dir>
# PART_MAX_SECONDS overrides the part limit (default 1740 s = 29 min).
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <video> <work-dir>" >&2
  exit 2
fi

video=$1
work_dir=$2
part_max=${PART_MAX_SECONDS:-1740}

for tool in ffmpeg ffprobe; do
  if ! command -v "$tool" >/dev/null; then
    echo "$tool is missing. Install it, e.g.: sudo apt install ffmpeg" >&2
    exit 1
  fi
done

mkdir -p "$work_dir"

duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$video")
duration=${duration%.*}
parts=$(((duration + part_max - 1) / part_max))
part_len=$(((duration + parts - 1) / parts))

ffmpeg -v error -y -i "$video" -vn -c:a libmp3lame -q:a 2 "$work_dir/audio.mp3"
ffmpeg -v error -y -i "$video" -an -c:v copy "$work_dir/video_sem_audio.mp4"

manifest="$work_dir/partes.tsv"
printf 'ficheiro\tinicio_s\tduracao_s\n' >"$manifest"
for ((i = 0; i < parts; i++)); do
  start=$((i * part_len))
  name=$(printf 'parte_%02d' $((i + 1)))
  ffmpeg -v error -y -ss "$start" -t "$part_len" -i "$work_dir/audio.mp3" -c copy "$work_dir/$name.mp3"
  len=$((duration - start < part_len ? duration - start : part_len))
  printf '%s\t%s\t%s\n' "$name" "$start" "$len" >>"$manifest"
done

echo "Duration: ${duration}s; $parts audio part(s) of up to ${part_len}s in $work_dir"
cat "$manifest"
