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
