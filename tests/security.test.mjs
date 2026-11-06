import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { markdownSchema } from "../common/util/markdown-schema.mjs";
import { serializeJsonLd, safeHttpUrl } from "../common/util/security.mjs";
import { isPublicPost, timestampToDate, formatPostDate, sortPostsByRecent } from "../common/util/post-data.mjs";
import { validatePostInput } from "../lib/post-input.mjs";
import { validateUpload, readUploadJson, MAX_UPLOAD_BODY_BYTES } from "../lib/upload-validation.mjs";

export const validPost = () => ({ title: "제목", content: "본문", category: "React", tags: [], file: [], published: true, isPrivate: false });

test("privacy flags fail closed for inconsistent legacy posts", () => {
  assert.equal(isPublicPost({}), true);
  assert.equal(isPublicPost(null), false);
  assert.equal(isPublicPost({ published: false }), false);
  assert.equal(isPublicPost({ published: true, isPrivate: true }), false);
});

test("sanitizer blocks scripts, handlers, SVG, frames and executable URLs while keeping tables/video", () => {
  const html = renderToStaticMarkup(createElement(ReactMarkdown, {
    remarkPlugins: [remarkGfm], rehypePlugins: [rehypeRaw, [rehypeSanitize, markdownSchema], [rehypeSlug, { prefix: "user-content-" }]],
    children: '# 제목\n\n<table><tr><td>표</td></tr></table><video controls onerror="alert(1)"><source src="https://example.com/v.mp4" type="video/mp4"></video><img src="x" onerror="alert(1)"><script>alert(1)</script><svg onload="alert(1)"></svg><iframe src="https://evil.test"></iframe><a href="javascript:alert(1)">link</a>',
  }));
  assert.doesNotMatch(html, /onerror|onload|<script|<svg|<iframe|javascript:/i);
  assert.match(html, /<table>/); assert.match(html, /<video controls/); assert.match(html, /<source src="https:\/\/example.com/);
  assert.match(html, /<h1 id="user-content-제목">/);
});

test("JSON-LD cannot close its enclosing script", () => {
  const value = { headline: '</script><script>alert(1)</script>' };
  const serialized = serializeJsonLd(value);
  assert.doesNotMatch(serialized, /</);
  assert.deepEqual(JSON.parse(serialized), value);
});

test("post writes allow only editable fields and reject malformed or inconsistent data", () => {
  const result = validatePostInput({ ...validPost(), createdAt: 'bad', viewCount: 0, authorId: 'forged', isRecommended: false });
  for (const key of ['createdAt','updatedAt','viewCount','likeCount','commentCount','authorId','author','isRecommended']) assert.equal(key in result, false);
  assert.throws(() => validatePostInput({ ...validPost(), published: false }));
  assert.throws(() => validatePostInput({ ...validPost(), title: {} }));
  assert.throws(() => validatePostInput({ ...validPost(), image: 'javascript:alert(1)' }));
  assert.throws(() => validatePostInput({ ...validPost(), tags: ['x'.repeat(51)] }));
});

test("URLs reject executable schemes", () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', '//evil.test', 'invalid']) assert.equal(safeHttpUrl(url), '');
  assert.equal(safeHttpUrl('https://example.com/a'), 'https://example.com/a');
});

test("timestamp handling supports epoch, malformed legacy values and Seoul dates without double offsets", () => {
  assert.equal(timestampToDate({ _seconds: 0 }).getTime(), 0);
  assert.equal(timestampToDate({ _methodName: 'serverTimestamp' }), null);
  assert.equal(formatPostDate('2026-11-05T16:00:00Z', true), '2026-11-06');
  assert.deepEqual(sortPostsByRecent([{ id: 'a', createdAt: '2026-01-01' }, { id: 'b', updatedAt: '2026-02-01' }]).map((p) => p.id), ['b','a']);
});

test("upload checks actual bytes and generates keys independently of caller filenames", async () => {
  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
  const result = await validateUpload({ fileName: '../../overwrite.html', fileType: 'image/png', fileData: png });
  assert.match(result.key, /^images\/[a-f0-9-]+\.png$/);
  assert.equal(result.type, 'image/png');
  await assert.rejects(validateUpload({ fileType: 'image/jpeg', fileData: png }));
  await assert.rejects(validateUpload({ fileType: 'image/svg+xml', fileData: Buffer.from('<svg/>').toString('base64') }));
  await assert.rejects(validateUpload({ fileType: 'image/png', fileData: 'a'.repeat(5 * 1024 * 1024) }), (error) => error.status === 413);
});

test("upload body cap applies to streamed requests without content-length", async () => {
  const request = new Request('https://example.com', { method: 'POST', duplex: 'half', body: new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(MAX_UPLOAD_BODY_BYTES + 1)); controller.close(); } }) });
  await assert.rejects(readUploadJson(request), (error) => error.status === 413);
});
