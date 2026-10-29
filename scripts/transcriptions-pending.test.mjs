import assert from "node:assert/strict";
import { test } from "node:test";
import { pendingTranscriptions } from "./transcriptions-pending.mjs";

const marker = [
  "[T1](transcriptions/transcricao1_gestao_obras.md), ",
  "[T2](transcriptions/transcricao2_gestao_obras.txt) e ",
  "[notas visuais](<transcriptions/transcricao1_Notas Iniciais Projeto.jpeg>)",
].join("");

const order = ["transcricao1_gestao_obras.md", "b.txt", "a.txt", "untracked.txt"];
const addedAt = (file) => (file === "untracked.txt" ? Infinity : order.indexOf(file));

test("nothing is pending when the marker document links every source", () => {
  const files = [
    "transcricao1_gestao_obras.md",
    "transcricao2_gestao_obras.txt",
    "transcricao1_Notas Iniciais Projeto.jpeg",
  ];

  assert.deepEqual(pendingTranscriptions({ files, marker, addedAt }), {
    pending: [],
    next: null,
  });
});

test("the oldest unlinked source is the next interview after the last cited one", () => {
  const files = ["untracked.txt", "a.txt", "transcricao1_gestao_obras.md", "b.txt"];
  assert.deepEqual(pendingTranscriptions({ files, marker, addedAt }), {
    pending: ["b.txt", "a.txt", "untracked.txt"],
    next: { file: "b.txt", interview: 3 },
  });
});

test("a percent-encoded link counts as incorporated", () => {
  const files = ["notas novas.jpeg"];
  const encoded = "[T1](transcriptions/notas%20novas.jpeg)";
  assert.equal(pendingTranscriptions({ files, marker: encoded, addedAt }).next, null);
});
