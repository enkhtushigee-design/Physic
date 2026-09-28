import { describe, expect, it } from "vitest";
import { isValidVideoId, parseYouTubeVideoId, youtubeEmbedUrl } from "./youtube";

// Туршилтын ID — бодит видеотой холбоогүй, зөвхөн хэлбэрийн хувьд зөв.
const ID = "Abc_123-xYz";

describe("parseYouTubeVideoId", () => {
  it.each([
    [`https://www.youtube.com/watch?v=${ID}`],
    [`https://youtube.com/watch?v=${ID}&t=42s`],
    [`https://m.youtube.com/watch?feature=share&v=${ID}`],
    [`https://youtu.be/${ID}`],
    [`https://youtu.be/${ID}?si=tracking`],
    [`https://www.youtube.com/shorts/${ID}`],
    [`https://www.youtube.com/embed/${ID}`],
    [`https://www.youtube.com/live/${ID}`],
    [`https://www.youtube-nocookie.com/embed/${ID}`],
    [`www.youtube.com/watch?v=${ID}`],
    [`youtu.be/${ID}`],
    [`  ${ID}  `],
  ])("%s → ID", (input) => {
    expect(parseYouTubeVideoId(input)).toBe(ID);
  });

  it.each([
    [""],
    ["hello"],
    ["https://example.com/watch?v=Abc_123-xYz"],
    ["https://evil.com/youtu.be/Abc_123-xYz"],
    ["https://youtube.com.evil.com/watch?v=Abc_123-xYz"],
    ["https://www.youtube.com/watch?v=short"],
    ["https://www.youtube.com/watch?v=Abc_123-xYz1"],
    ["https://www.youtube.com/@channel"],
    ["https://www.youtube.com/playlist?list=PL123"],
    ["javascript:alert(1)"],
    ["https://www.youtube.com/watch?v=<script>"],
    ["ftp://youtube.com/watch?v=Abc_123-xYz"],
  ])("%s → null", (input) => {
    expect(parseYouTubeVideoId(input)).toBeNull();
  });
});

describe("youtubeEmbedUrl", () => {
  it("builds the official embed URL", () => {
    expect(youtubeEmbedUrl(ID)).toBe(`https://www.youtube.com/embed/${ID}?rel=0&modestbranding=1`);
    expect(youtubeEmbedUrl(ID, { autoplay: true })).toContain("autoplay=1");
  });

  it("refuses invalid ids", () => {
    expect(() => youtubeEmbedUrl("x\"><script>")).toThrow();
    expect(isValidVideoId("../../etc")).toBe(false);
  });
});
