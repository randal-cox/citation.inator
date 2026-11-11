import { compileCitations } from "../src/compiler.mjs";

export const demoStyles = {
  default: "Default",
  "chicago-author-date": "Chicago author–date",
  apa: "APA 7",
  mla: "MLA 9",
  harvard: "Cite Them Right Harvard",
  vancouver: "Vancouver"
};

export function compileDemoStyles(source, cache, namespace) {
  const baseline = compileCitations(source, cache, { namespace });
  const styles = { default: baseline.html };
  for (const citationStyle of Object.keys(demoStyles).slice(1)) {
    const endnotesHeading = citationStyle === "mla" ? "Works Cited" : "References";
    styles[citationStyle] = compileCitations(source, cache, { namespace, citationStyle, endnotesHeading }).html;
  }
  return { ...baseline, styles };
}
