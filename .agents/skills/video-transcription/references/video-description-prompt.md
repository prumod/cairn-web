Analyze the attached MP4 video and create a detailed, timestamped visual description of everything happening on screen.

Objective
Produce a downloadable plain-text file named video_description.txt documenting the video's visible content chronologically, with accurate timestamps.

Instructions

1. Inspect the entire video from beginning to end, without intentionally skipping sections.
2. Use native video analysis if available. Otherwise, use FFmpeg to extract timestamped frames and visually inspect them.
3. Start with at least 1 frame per second. Increase to 2–4 frames per second during fast-changing scenes, software interactions, or complex actions where practical.
4. Describe what is actually visible, including:
   - People, objects, environments, and movements
   - Actions and interactions
   - Scene transitions and camera movements
   - Software interfaces, windows, menus, buttons, and cursor activity
   - Visible text, notifications, labels, and messages
   - Important visual changes, including small details
5. Use timestamps corresponding to the original MP4, not extracted-frame numbering.
6. Group consecutive frames into meaningful events. Avoid repeating descriptions when nothing changes.
7. Use precise, factual language. Do not invent actions, text, or details that cannot be verified visually.
8. Prioritize visual descriptions rather than audio transcription.
9. Process long videos in chronological batches, preserving continuity between batches.
10. Use the capabilities available in my ChatGPT subscription. Do not call paid external APIs or require additional subscriptions.

Output format
[00:00:00 - 00:00:03] A browser window is visible, displaying the Google homepage.

[00:00:03 - 00:00:05] The cursor moves to the search field and clicks inside it.

[00:00:05 - 00:00:08] Text is typed into the search field.

[00:00:08 - 00:00:11] Search results appear, displaying several links.

Accuracy and completeness requirements

- Cover the full video duration.
- Capture every meaningful visual event detectable at the inspected frame rate.
- Include exact visible text when readable and relevant.
- Describe sequences of actions step by step.
- Be especially detailed for software demonstrations and screen recordings.
- Identify any time intervals that could not be inspected.
- Do not claim to have inspected frames or sections that were not actually analyzed.

Final deliverable
Create and attach video_description.txt as a downloadable file.
Before finishing, verify that timestamps are in chronological order, the descriptions accurately represent inspected video content, and the final timestamp reaches the end of the video.
Return the file itself, not just the text in the chat. If a complete analysis is technically impossible, clearly explain the limitation and provide the actual verified coverage rather than fabricating the missing content.
Proceed with the attached video without asking for additional confirmation.
