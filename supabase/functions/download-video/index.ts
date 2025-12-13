import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DownloadRequest {
  url: string;
  quality?: string;
  format?: string;
  previewOnly?: boolean;
}

interface CobaltResponse {
  status: string;
  url?: string;
  filename?: string;
  picker?: Array<{ url: string; thumb?: string; type?: string }>;
  error?: { code: string };
  thumb?: string;
  // Additional metadata from Cobalt API
  audio?: string; // Audio-only URL
  audioFilename?: string;
  // Music/sound info
  musicTitle?: string;
  musicAuthor?: string;
}

// Working Cobalt instances with CORS support
const COBALT_INSTANCES = [
  "https://cobalt-api.kwiatekmiki.com",
  "https://cobalt-api.meowing.de",
  "https://capi.3kh0.net",
  "https://cobalt-backend.canine.tools",
];

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, quality = "1080", format = "mp4", previewOnly = false }: DownloadRequest = await req.json();
    
    console.log(`Processing download request for: ${url}`);
    console.log(`Quality: ${quality}, Format: ${format}, PreviewOnly: ${previewOnly}`);

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platform = detectPlatform(url);
    console.log(`Detected platform: ${platform}`);

    if (!platform) {
      return new Response(
        JSON.stringify({ error: "Platform tidak didukung. Gunakan URL TikTok, Instagram, Facebook, atau YouTube." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract metadata from URL
    const metadata = extractMetadata(url, platform);

    // Map quality to Cobalt format
    const videoQuality = quality === "4k" ? "2160" : quality === "1080" ? "1080" : quality === "720" ? "720" : "480";
    
    // Build request body for new Cobalt API (v10+)
    const requestBody = {
      url: url,
      videoQuality: videoQuality,
      audioFormat: "mp3",
      downloadMode: format === "mp3" ? "audio" : "auto",
      filenameStyle: "basic",
    };

    // Try each instance until one works
    for (const instance of COBALT_INSTANCES) {
      try {
        console.log(`Trying instance: ${instance}`);
        
        const cobaltResponse = await fetch(instance, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        console.log(`Instance ${instance} response status: ${cobaltResponse.status}`);

        if (!cobaltResponse.ok) {
          console.log(`Instance ${instance} returned ${cobaltResponse.status}`);
          continue;
        }

        const data: CobaltResponse = await cobaltResponse.json();
        console.log(`Cobalt response from ${instance}:`, JSON.stringify(data));

        if (data.status === "error") {
          console.log(`Instance ${instance} returned error:`, data.error);
          continue;
        }

        // Handle picker response (multiple items like Instagram carousel)
        if (data.status === "picker" && data.picker && data.picker.length > 0) {
          const firstThumb = data.picker[0]?.thumb || data.thumb;
          
          if (previewOnly) {
            return new Response(
              JSON.stringify({
                success: true,
                platform,
                type: "preview",
                metadata: {
                  ...metadata,
                  title: metadata.title || `${platform}_carousel`,
                },
                thumbnail: firstThumb,
                itemCount: data.picker.length,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          return new Response(
            JSON.stringify({
              success: true,
              platform,
              type: "picker",
              metadata: metadata,
              thumbnail: firstThumb,
              options: data.picker.map((item, index) => ({
                id: index,
                url: item.url,
                thumbnail: item.thumb,
                type: item.type || "video",
              })),
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Extract enhanced metadata from filename
        const filenameMetadata = parseFilenameMetadata(data.filename || '', platform);
        
        // Merge all metadata sources
        const title = data.filename 
          ? cleanFilename(data.filename) 
          : metadata.title || `${platform}_video_${Date.now()}`;
        
        // Get author from multiple sources
        const author = metadata.author || filenameMetadata.author;
        
        // Get thumbnail URL - construct from platform if not provided
        const thumbnail = data.thumb || getThumbnailUrl(url, platform, metadata.videoId);

        // Build complete metadata with music info
        const completeMetadata = {
          title: filenameMetadata.title || title,
          author: author,
          videoId: metadata.videoId,
          musicInfo: filenameMetadata.musicInfo || null,
          originalFilename: data.filename,
          sourceUrl: url,
        };

        // Handle preview only request
        if (previewOnly) {
          return new Response(
            JSON.stringify({
              success: true,
              platform,
              type: "preview",
              metadata: completeMetadata,
              thumbnail,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Handle tunnel/redirect response
        if ((data.status === "tunnel" || data.status === "redirect") && data.url) {
          return new Response(
            JSON.stringify({
              success: true,
              platform,
              type: "direct",
              downloadUrl: data.url,
              filename: completeMetadata.title,
              thumbnail,
              metadata: completeMetadata,
              quality,
              format,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Handle legacy response format
        if (data.url) {
          return new Response(
            JSON.stringify({
              success: true,
              platform,
              type: "direct",
              downloadUrl: data.url,
              filename: completeMetadata.title,
              thumbnail,
              metadata: completeMetadata,
              quality,
              format,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

      } catch (instanceError) {
        console.error(`Error with instance ${instance}:`, instanceError);
        continue;
      }
    }

    // All instances failed
    return new Response(
      JSON.stringify({ 
        error: "Tidak dapat memproses video ini. Coba lagi nanti atau gunakan URL yang berbeda.",
        details: "Semua server sedang sibuk atau tidak dapat mengakses video ini."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error processing download:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Gagal memproses video" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function detectPlatform(url: string): string | null {
  const patterns: Record<string, RegExp[]> = {
    youtube: [
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)/i,
    ],
    tiktok: [
      /tiktok\.com\/@[\w.-]+\/video\/\d+/i,
      /tiktok\.com\/t\/\w+/i,
      /vm\.tiktok\.com\/\w+/i,
    ],
    instagram: [
      /instagram\.com\/(?:p|reel|reels|stories)\/[\w-]+/i,
      /instagr\.am\/p\/[\w-]+/i,
    ],
    facebook: [
      /facebook\.com\/.*\/videos\/\d+/i,
      /facebook\.com\/watch\/?\?v=\d+/i,
      /fb\.watch\/\w+/i,
      /facebook\.com\/reel\/\d+/i,
    ],
  };

  for (const [platform, regexList] of Object.entries(patterns)) {
    for (const regex of regexList) {
      if (regex.test(url)) {
        return platform;
      }
    }
  }
  return null;
}

function extractMetadata(url: string, platform: string): { author?: string; videoId?: string; title?: string } {
  const metadata: { author?: string; videoId?: string; title?: string } = {};

  try {
    switch (platform) {
      case "tiktok": {
        // Extract username from TikTok URL: tiktok.com/@username/video/123
        const match = url.match(/tiktok\.com\/@([\w.-]+)\/video\/(\d+)/i);
        if (match) {
          metadata.author = `@${match[1]}`;
          metadata.videoId = match[2];
        }
        break;
      }
      case "instagram": {
        // Extract post ID and username from Instagram URL
        const postMatch = url.match(/instagram\.com\/(?:p|reel|reels)\/([^/?]+)/i);
        if (postMatch) {
          metadata.videoId = postMatch[1];
        }
        // Try to extract username if available in URL
        const userMatch = url.match(/instagram\.com\/([\w.-]+)\/(?:p|reel)/i);
        if (userMatch && userMatch[1] !== 'p' && userMatch[1] !== 'reel' && userMatch[1] !== 'reels') {
          metadata.author = `@${userMatch[1]}`;
        }
        break;
      }
      case "youtube": {
        // Extract video ID from YouTube URL
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/]+)/i);
        if (match) {
          metadata.videoId = match[1];
        }
        // Try to extract channel from shorts URL
        const channelMatch = url.match(/youtube\.com\/@([^/]+)/i);
        if (channelMatch) {
          metadata.author = `@${channelMatch[1]}`;
        }
        break;
      }
      case "facebook": {
        // Extract video ID from Facebook URL
        const videoMatch = url.match(/videos\/(\d+)/i) || url.match(/v=(\d+)/i) || url.match(/reel\/(\d+)/i);
        if (videoMatch) {
          metadata.videoId = videoMatch[1];
        }
        // Try to extract page/user name
        const pageMatch = url.match(/facebook\.com\/([^/]+)\/videos/i);
        if (pageMatch) {
          metadata.author = pageMatch[1];
        }
        break;
      }
    }
  } catch (e) {
    console.log("Error extracting metadata:", e);
  }

  return metadata;
}

// Parse metadata from Cobalt filename and extract music info
function parseFilenameMetadata(filename: string, platform: string): { 
  title?: string; 
  author?: string; 
  musicInfo?: { title?: string; author?: string } 
} {
  const result: { title?: string; author?: string; musicInfo?: { title?: string; author?: string } } = {};
  
  if (!filename) return result;
  
  // Clean filename
  const cleanName = filename.replace(/\.[^/.]+$/, ""); // Remove extension
  
  switch (platform) {
    case "tiktok": {
      // Format: tiktok_username_videoid or similar
      const parts = cleanName.split('_');
      if (parts.length >= 2) {
        result.author = `@${parts[1]}`;
        if (parts.length > 2) {
          result.title = parts.slice(2).join(' ');
        }
      }
      // TikTok often has music in format: original sound - artistname
      const soundMatch = cleanName.match(/original\s+sound\s*[-–]\s*(.+)/i);
      if (soundMatch) {
        result.musicInfo = { author: soundMatch[1].trim() };
      }
      break;
    }
    case "instagram": {
      // Format: instagram_username_postid
      const parts = cleanName.split('_');
      if (parts.length >= 2) {
        result.author = `@${parts[1]}`;
      }
      break;
    }
    case "youtube": {
      // Format: youtube_title_videoid or Video Title [videoid]
      const bracketMatch = cleanName.match(/^(.+?)\s*\[([^\]]+)\]$/);
      if (bracketMatch) {
        result.title = bracketMatch[1].trim();
      } else {
        result.title = cleanName.replace(/youtube[_-]/i, '').replace(/[_-]+/g, ' ').trim();
      }
      break;
    }
    case "facebook": {
      // Format: facebook_pagename_videoid
      const parts = cleanName.split('_');
      if (parts.length >= 2) {
        result.author = parts[1];
      }
      break;
    }
  }
  
  // Try to detect music/audio info from common patterns
  // Pattern: "Song Title - Artist Name" or "Artist - Song"
  const musicPatterns = [
    /♪\s*(.+?)\s*[-–]\s*(.+)/i,           // ♪ Song - Artist
    /🎵\s*(.+?)\s*[-–]\s*(.+)/i,           // 🎵 Song - Artist
    /(?:song|track|music)[:\s]+(.+?)\s*[-–]\s*(.+)/i,
    /(?:by|feat\.?|ft\.?)\s+(.+)/i,       // by Artist or feat. Artist
  ];
  
  for (const pattern of musicPatterns) {
    const match = cleanName.match(pattern);
    if (match) {
      if (match[2]) {
        result.musicInfo = { title: match[1].trim(), author: match[2].trim() };
      } else if (match[1]) {
        result.musicInfo = { author: match[1].trim() };
      }
      break;
    }
  }
  
  return result;
}

function cleanFilename(filename: string): string {
  // Remove file extension and clean up the filename
  return filename
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[_-]+/g, " ")   // Replace underscores/dashes with spaces
    .trim();
}

function getThumbnailUrl(url: string, platform: string, videoId?: string): string | undefined {
  if (!videoId) return undefined;
  
  switch (platform) {
    case "youtube":
      // YouTube thumbnail URLs
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    default:
      return undefined;
  }
}
