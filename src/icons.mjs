// Local, fixed SVG artwork. Metadata never supplies markup or icon URLs.
const paths = {
  pdf: '<path d="M6 3h8l4 4v14H6z M14 3v5h4"/><path d="m8 17 3-5 2 4 3 1-4 1z"/>',
  publisher: '<path d="M3 9 12 4l9 5z M5 20h14 M7 11v7m5-7v7m5-7v7"/>',
  book: '<path d="M5 4h14v16H7a2 2 0 0 1-2-2z M5 17h14 M8 8h8m-8 3h6"/>',
  link: '<path d="m9 15 6-6 M8 16l-1 1a3 3 0 0 1-4-4l5-5a3 3 0 0 1 4 0 M16 8l1-1a3 3 0 0 1 4 4l-5 5a3 3 0 0 1-4 0"/>',
  repository: '<path d="M4 4h16v5H4z M6 9v11h12V9 M10 13h4"/>',
  article: '<path d="M6 4h12v16H6z M9 8h6m-6 4h6m-6 4h4"/>',
  external: '<path d="M13 4h7v7m0-7-9 9m7 0v7H4V6h7"/>',
  library: '<path d="M4 19V5h4v14zm4 0V5h4v14zm6-13 4-1 3 14-4 1z"/>',
  status: '<path d="M12 3 4 7v5c0 5 4 8 8 9 4-1 8-4 8-9V7z M12 8v5m0 3h.01"/>',
  back: '<path d="m10 6-6 6 6 6 M4 12h11a4 4 0 0 0 4-4"/>',
  endnote: '<path d="M4 5h16M4 10h10m-10 5h5m6-2v7m-3-3 3 3 3-3"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};

export function iconMarkup(name) {
  return `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${Object.hasOwn(paths, name) ? paths[name] : paths.link}</svg>`;
}


export const brandIconMarkup = '<svg viewBox="0 0 64 64" width="24" height="24" aria-hidden="true" focusable="false"><rect x="2" y="2" width="60" height="60" rx="14" fill="#082a66" stroke="#28cce6" stroke-width="4"/><path d="M25 21h-7v22h7m14-22h7v22h-7m-11-7h8m-8-8h8" fill="none" stroke="#b8f9ff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="49" cy="15" r="4.5" fill="#ffbe53" stroke="#082a66" stroke-width="1.5"/></svg>';
