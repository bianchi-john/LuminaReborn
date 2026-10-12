import sanitizeHtml from 'sanitize-html';

const linkTransform: sanitizeHtml.Transformer = (tagName, attribs) => ({
  tagName,
  attribs: { href: attribs.href ?? '', rel: 'noopener noreferrer nofollow', target: '_blank' },
});

/** Only images from the archive itself (resized versions), never external addresses or data URLs. */
const INTERNAL_IMAGE = /^\/media\/([a-z2-9]{16})\/(anteprima|miniatura)$/;

/** Rich text for long fields (commentary, description, inscriptions...). */
const BLOCK_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'sup', 'sub', 'ul', 'ol', 'li', 'blockquote', 'a', 'h3', 'h4', 'img'],
  allowedAttributes: { a: ['href', 'rel', 'target'], img: ['src', 'alt'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: [] },
  allowProtocolRelative: false,
  transformTags: { a: linkTransform, div: 'p', h1: 'h3', h2: 'h3', h5: 'h4', h6: 'h4' },
  exclusiveFilter: (frame) =>
    (frame.tag === 'img' && !INTERNAL_IMAGE.test(frame.attribs.src ?? '')) ||
    (frame.tag === 'p' && !frame.text.trim() && !frame.mediaChildren.length),
};

/** Inline rich text (titles, bibliographic references, exhibition titles). */
const INLINE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'strong', 'i', 'em', 'u', 'sup', 'sub', 'a'],
  allowedAttributes: { a: ['href', 'rel', 'target'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  transformTags: { a: linkTransform },
};

const TEXT_OPTIONS: sanitizeHtml.IOptions = { allowedTags: [], allowedAttributes: {} };

export type HtmlKind = 'block' | 'inline';

/**
 * Rich text keeping only the given images (those of the record): the commentary
 * cannot show images of other works, which might not be published.
 */
export function soloImmagini(value: string | null, codici: ReadonlySet<string>): string | null {
  if (!value || !value.includes('<img')) return value;
  const cleaned = sanitizeHtml(value, {
    ...BLOCK_OPTIONS,
    exclusiveFilter: (frame) =>
      (frame.tag === 'img' && !codici.has(INTERNAL_IMAGE.exec(frame.attribs.src ?? '')?.[1] ?? '')) ||
      (frame.tag === 'p' && !frame.text.trim() && !frame.mediaChildren.length),
  }).trim();
  return cleaned === '' ? null : cleaned;
}

export function cleanHtml(value: string | null | undefined, kind: HtmlKind): string | null {
  if (value === null || value === undefined) return null;
  const cleaned = sanitizeHtml(value, kind === 'block' ? BLOCK_OPTIONS : INLINE_OPTIONS)
    .replace(/&nbsp;/g, ' ')
    .replace(/(<br \/>\s*)+$/g, '')
    .trim();
  return cleaned === '' ? null : cleaned;
}

/** Plain text from HTML (for sorting, <title>, image alt text). */
export function htmlToText(value: string | null | undefined): string {
  if (!value) return '';
  return sanitizeHtml(value, TEXT_OPTIONS)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
