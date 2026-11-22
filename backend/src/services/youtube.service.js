const config = require("../config");

const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

const decodeEntities = (s = "") =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

async function searchVideos({ query, maxResults = 5 }) {
  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    videoEmbeddable: "true",
    order: "relevance",
    maxResults: String(maxResults),
    q: query,
    key: config.youtubeApiKey,
  });

  const res = await fetch(`${SEARCH_URL}?${params}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API error ${res.status}: ${body}`);
  }
  const data = await res.json();

  return (data.items || []).map((item) => {
    const t = item.snippet.thumbnails;
    return {
      videoId: item.id.videoId,
      title: decodeEntities(item.snippet.title),
      description: decodeEntities(item.snippet.description),
      channelTitle: decodeEntities(item.snippet.channelTitle),
      publishedAt: item.snippet.publishedAt,
      thumbnail: (t.medium || t.high || t.default).url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    };
  });
}

module.exports = { searchVideos };
