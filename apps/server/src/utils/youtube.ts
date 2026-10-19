import { Innertube } from "youtubei.js";

declare global { 
  var youtube: Innertube
}

export async function getInnertubeInstance() { 
  if (global.youtube) {
    return global.youtube
  }

  global.youtube = await Innertube.create();
  return global.youtube
}

export async function getYouTubeVideoTitle(
  url: string
) { 
  const videoId = extractYouTubeVideoId(url);
  const youtube = await getInnertubeInstance();
  const video = await youtube.getBasicInfo(videoId);
  
  return video.basic_info.title ?? "";
}

export function extractYouTubeVideoId(url: string): string {
  try {
    const parsedUrl = new URL(url); // parse the url

    // for short youtu.be/<id>
    if (parsedUrl.hostname === "youtu.be") {
      const id = parsedUrl.pathname.slice(1);

      if (!id) {
        throw new Error("Invalid YouTube URL");
      }

      return id;
    }

    // for normal youtube url https://www.youtube.com/watch?v=<id>
    if (
      parsedUrl.hostname === "youtube.com" || // normal youtube url
      parsedUrl.hostname === "www.youtube.com" // normal youtube url with www
    ) {
      const id = parsedUrl.searchParams.get("v"); // get the id from the url

      // if id is not found then throw error
      if (!id) {
        throw new Error("Invalid YouTube URL");
      }

      return id;
    }

    // if url is not supported then throw error
    throw new Error("Unsupported YouTube URL");
  } catch {
    // if url is invalid then throw error
    throw new Error("Invalid YouTube URL");
  }
}