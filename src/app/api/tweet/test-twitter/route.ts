// src/app/api/tweet/route.ts
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { tweet, base64Image } = await req.json();
    
    // Convert base64 to buffer without relying on file system
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    try {
      // Upload media directly using buffer
      const mediaId = await twitterClient.v1.uploadMedia(imageBuffer, {
        mimeType: 'image/png',
        type: 'image/png',
      });

      // Post tweet with media
      const result = await twitterClient.v2.tweet({
        text: tweet,
        media: { media_ids: [mediaId] }
      });

      return NextResponse.json({ success: true, tweet: result });
    } catch (twitterError) {
      console.error('Twitter API Error:', twitterError);
      return NextResponse.json(
        { error: 'Failed to post to Twitter. Please check your API credentials.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}