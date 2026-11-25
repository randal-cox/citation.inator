/* draft.inator: front matter, kept byte for byte. The editor edits a page's body; the YAML block above it (between
   `---` lines) goes back exactly as it was. Plain browser JavaScript; also runs in Node. */

/**
 * Split a Markdown file into its front matter (with its delimiters and the line break after them) and its body.
 * A file without front matter has an empty `frontMatter`. joinFrontMatter(splitFrontMatter(t)) === t, always.
 * @param {string} text
 * @returns {{ frontMatter: string, body: string }}
 */
export function splitFrontMatter(text) {
  const m = /^(﻿?---[ \t]*\r?\n(?:[\s\S]*?\r?\n)?(?:---|\.\.\.)[ \t]*(?:\r?\n|$))/.exec(text);
  return m ? { frontMatter: m[1], body: text.slice(m[1].length) } : { frontMatter: '', body: text };
}

/** @param {{ frontMatter?: string, body?: string }} parts */
export function joinFrontMatter({ frontMatter = '', body = '' }) {
  return frontMatter + body;
}
