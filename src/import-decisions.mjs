import { importHash } from "./import-hash.mjs";
import { normalizeIdentifier } from "./records.mjs";

/** Normalize the three supported host decision forms without changing their wire representation. */
export function decisionTargets(decision, match) {
  return (
    decision?.targets ??
    decision?.recordIds?.map((recordId) => ({ recordId })) ??
    (decision?.action === "placeholder"
      ? match.items.map(() => ({ placeholder: true }))
      : undefined)
  );
}

/** Reserve IDs in the host's decision order, just as the edit planner does. */
export function createPlaceholderAllocator(review, existingIds) {
  const taken = new Set(existingIds);
  return (citationIndex, itemIndex, requestedId) => {
    const base =
      "pending-" +
      importHash(
        review.sourceHash + ":" + citationIndex + ":" + itemIndex,
      ).slice(0, 20);
    let id = requestedId ?? base;
    if (requestedId === undefined) {
      let counter = 0;
      while (taken.has(id)) id = base + "-" + ++counter;
    }
    if (
      typeof id !== "string" ||
      normalizeIdentifier("local:" + id)?.value !== id ||
      taken.has(id)
    ) {
      throw new TypeError(
        "Placeholder IDs must be valid and distinct from existing records.",
      );
    }
    taken.add(id);
    return id;
  };
}

/** A whole citation must map to one exact, contiguous source span before it can be rewritten. */
export function citationSourceSpan(citation, sourceLength, source) {
  const fragments = citation.sourceFragments ?? [
    { sourceStart: citation.start, sourceEnd: citation.end, exact: true },
  ];
  const start = fragments[0]?.sourceStart;
  let end = start;
  let safe = fragments.length > 0 && Number.isInteger(start) && start >= 0;
  for (const fragment of fragments) {
    safe &&=
      fragment.exact === true &&
      fragment.link === undefined &&
      Number.isInteger(fragment.sourceStart) &&
      Number.isInteger(fragment.sourceEnd) &&
      fragment.sourceStart === end &&
      fragment.sourceEnd > fragment.sourceStart &&
      fragment.sourceEnd <= sourceLength;
    end = fragment.sourceEnd;
  }
  safe &&=
    typeof citation.raw === "string" && end - start === citation.raw.length;
  if (source !== undefined) safe &&= source.slice(start, end) === citation.raw;
  return { start, end, safe };
}
