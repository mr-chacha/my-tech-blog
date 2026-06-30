import GithubSlugger from "github-slugger";

export const buildTocFromDom = (container) => {
  if (!container) return [];

  const headings = container.querySelectorAll("h1, h2, h3, h4");

  return Array.from(headings)
    .filter((heading) => heading.id)
    .map((heading) => {
      const level = Number.parseInt(heading.tagName[1], 10);

      return {
        title: heading.textContent.trim(),
        href: `#${heading.id}`,
        isSubItem: level > 1,
        id: heading.id,
        level,
      };
    });
};

export const addHeadingIdsToHtml = (html) => {
  if (!html || typeof document === "undefined") return html;

  const slugger = new GithubSlugger();
  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.querySelectorAll("h1, h2, h3, h4").forEach((heading) => {
    if (!heading.id) {
      heading.id = slugger.slug(heading.textContent);
    }
  });

  return doc.body.innerHTML;
};
