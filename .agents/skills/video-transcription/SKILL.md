---
name: video-transcription
description: Turn an interview recording into a unified ÁUDIO + VISÃO transcription and propagate it to the Cairn product docs, prototype contract and wireframe.
disable-model-invocation: true
---

# Video transcription

Input: the path to a recording. Output: one pull request with `docs/product/transcriptions/transcricao_<N>_gestao_obras.txt` in the format of [`transcricao_3_gestao_obras.txt`](../../../docs/product/transcriptions/transcricao_3_gestao_obras.txt), plus every product document the new interview changes.

`<N>` is the next interview number after the highest one in `docs/product/transcriptions/`. Confirm `<N>` with the user before step 1.

Keep the media and intermediate files in a work directory outside the repository, by default `<video-dir>/<video-stem>-transcricao/`. Commit only the final text files.

## 1. Prepare the media

```sh
.agents/skills/video-transcription/scripts/prepare-media.sh <video> <work-dir>
```

The script writes `audio.mp3`, `video_sem_audio.mp4`, `parte_NN.mp3` and `partes.tsv`. Each part is at most 29 minutes because the TurboScribe free plan accepts files up to 30 minutes and 3 files per day. If there are more than 3 parts, tell the user the upload takes more than one day on the free plan.

## 2. Hand off the transcription

The user does these uploads; the agent cannot. Give the user these steps, then wait until the files exist in `<work-dir>`:

1. Upload each `parte_NN.mp3` to <https://turboscribe.ai/> with the language set to Portuguese.
2. Export each transcript as TXT with timestamps. Save it as `parte_NN.txt`, with the same number as the MP3.
3. Upload `video_sem_audio.mp4` to ChatGPT with the prompt in [`references/video-description-prompt.md`](references/video-description-prompt.md).
4. Save the returned file as `video_description.txt`.

## 3. Merge the tracks

```sh
python3 -I .agents/skills/video-transcription/scripts/timeline.py merge <work-dir>
```

The script shifts each part's timestamps by the part's start time, so the audio is continuous. It then interleaves audio and vision into `linha_temporal_bruta.txt`, sorted by start time, with VISÃO before ÁUDIO on ties. It reports VISÃO gaps. Report each gap longer than 60 s to the user, and record it as a note in the final header.

## 4. Edit the timeline

Work on a copy of `linha_temporal_bruta.txt`. Read [`references/pts-pt.md`](references/pts-pt.md) and [`docs/product/README.md`](../../../docs/product/README.md) first.

1. **Translate.** Translate every VISÃO record into European Portuguese, following PTS-PT. Text visible on screen stays in its original language, in «».
2. **Remove unrelated content.** Delete records, or parts of ÁUDIO records, that do not relate to the Cairn project: side conversations, other classes, recording or connection problems, empty screens, gestures without content. Keep the ÁUDIO wording as transcribed. Write each removal and its reason to `<work-dir>/removidos.txt`.
3. **Keep only the vision that is discussed.** Start from each remaining ÁUDIO record. Find what on screen the speech refers to: an explicit mention or a pointing word («isto», «aqui», «este») said while something is on screen. An ÁUDIO record spans from its instant to the next ÁUDIO instant. A VISÃO record qualifies when its interval comes within 90 s of that span, before or after. In each qualifying record, keep only the elements the speech refers to. Delete every other VISÃO record and write it to `<work-dir>/removidos_visao.txt`.

## 5. Write the transcription file

Write `docs/product/transcriptions/transcricao_<N>_gestao_obras.txt`. Copy the header structure of `transcricao_3_gestao_obras.txt`: source video and duration, legend of record types, and notes. Update the notes to describe steps 4.2 and 4.3 as applied, and the VISÃO gaps from step 3. Then validate:

```sh
python3 -I .agents/skills/video-transcription/scripts/timeline.py check <file> <duration-seconds>
```

## 6. Add the interview to the global transcription

Append a `# Transcrição <N>` section to `docs/product/transcriptions/transcricao_gestao_obras.md`. Follow the form of its Transcrição 2 section: PTS-PT text in numbered topic sections. Cite instants as `T<N> [hh:mm:ss]`. Include only information from the new transcription. Mark unclear passages as transcrição incerta.

## 7. Propose the product changes

Compare the new interview with the Now PRD (GitHub issue #104, `gh issue view 104`), `docs/product/{later,maybe,never}/funcionalidades.md` and `now/termos-por-definir.md`. Present to the user, with T<N> citations:

- new capabilities and the level for each;
- capabilities that change level;
- decisions and terms that change.

Priority is the user's decision. Apply step 8 only to the changes the user approves.

## 8. Update the documents

Follow the conventions in `docs/product/README.md`: a capability that changes level gets a new identifier, and old identifiers are not reused.

1. Update the Later, Maybe and Never feature files, `now/termos-por-definir.md`, and `docs/product/README.md` (counts, the identifier mapping, and the source list). Apply the approved changes to Now to the PRD, issue #104, with `gh issue edit 104`.
2. If identifiers changed, update the identifier note at the top of each document in `docs/product/research/`.
3. Update `apps/web/references/interactive-wireframe.tsx` and `docs/product/system/prototype-coverage.md` as in step 3, items 4 and 5, of `.agents/skills/incorporate-transcription/SKILL.md`.

## 9. Open the pull request

Run `bun run check`. Commit with `scripts/commit-with-hooks.sh`, push with `scripts/push-with-hooks.sh`, and open a pull request titled `docs: process transcription <N>`. In the description, list the approved priority changes, the VISÃO gaps, and what was verified.
