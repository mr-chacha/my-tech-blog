import { defaultSchema } from "rehype-sanitize";

// HTML is parsed first, then sanitized; heading IDs are generated last with a safe prefix.
export const markdownSchema = {
  ...defaultSchema,
  tagNames: [...defaultSchema.tagNames, "video", "source"],
  attributes: {
    ...defaultSchema.attributes,
    video: ["controls", "width", "height", "preload", "poster", "src"],
    source: ["src", "type"],
  },
};
