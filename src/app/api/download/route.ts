import { NextRequest, NextResponse } from 'next/server';

// API route for proxying media downloads
// This handles direct URLs and can be extended with external APIs

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Check if it's a direct media URL
    const mediaExtensions = ['.mp4', '.webm', '.mov', '.avi', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp3', '.wav', '.m4a'];
    const pathname = parsedUrl.pathname.toLowerCase();
    const isDirectMedia = mediaExtensions.some(ext => pathname.endsWith(ext));

    if (isDirectMedia) {
      // For direct media URLs, we return the URL and let the client download it
      return NextResponse.json({
        success: true,
        type: 'direct',
        url: url,
        title: url.split('/').pop() || 'media',
      });
    }

    // Check for YouTube/Social Media URLs - require external API
    const isYouTube = parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be');
    const isTwitter = parsedUrl.hostname.includes('twitter.com') || parsedUrl.hostname.includes('x.com');
    const isInstagram = parsedUrl.hostname.includes('instagram.com');
    const isTikTok = parsedUrl.hostname.includes('tiktok.com');

    if (isYouTube || isTwitter || isInstagram || isTikTok) {
      // Return info that an external API is needed
      return NextResponse.json({
        success: true,
        type: 'external',
        url: url,
        platform: isYouTube ? 'YouTube' : isTwitter ? 'Twitter/X' : isInstagram ? 'Instagram' : 'TikTok',
        message: `For ${isYouTube ? 'YouTube' : isTwitter ? 'Twitter/X' : isInstagram ? 'Instagram' : 'TikTok'} downloads, please use a dedicated service like cobalt.tools or savefrom.net`,
        suggestions: [
          { name: 'Cobalt Tools', url: 'https://cobalt.tools', desc: 'Free, open-source media downloader' },
          { name: 'SaveFrom', url: 'https://savefrom.net', desc: 'Online video downloader' },
        ],
      });
    }

    return NextResponse.json({
      success: false,
      error: 'URL type not supported. Try direct media links (.mp4, .jpg, .png, etc.)',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'Media Downloader API' });
}
