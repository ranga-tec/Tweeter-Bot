// src/app/api/tweet/route.ts
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import * as path from 'path';
import fs from 'fs';

// Create read-write client
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

// Get read-write v2 client
const rwClient = client.readWrite;

export async function POST(req: Request) {
  try {
    const { tweet, imageUrl } = await req.json();

    // Convert the public URL to a file path
    const imageName = path.basename(imageUrl);
    const filePath = path.join(process.cwd(), 'public', 'temp', imageName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('Image file not found');
    }

    console.log('Uploading media...', filePath);

    try {
      // First, verify credentials
      const verifyResponse = await client.v1.verifyCredentials();
      console.log('Credentials verified:', verifyResponse.screen_name);

      // Upload media
      const mediaId = await client.v1.uploadMedia(filePath, {
        mimeType: 'image/png',
        target: 'tweet'
      });

      console.log('Media uploaded, ID:', mediaId);

      // Post tweet with media
      const result = await rwClient.v2.tweet({
        text: tweet,
        media: { media_ids: [mediaId] }
      });

      console.log('Tweet posted:', result);

      // Clean up: delete the temporary file
      fs.unlinkSync(filePath);

      return NextResponse.json({ success: true, tweet: result });
    } catch (twitterError) {
      console.error('Twitter API Error:', {
        error: twitterError,
        message: twitterError.message,
        code: twitterError.code,
        data: twitterError.data
      });
      throw twitterError;
    }
  } catch (error) {
    console.error('Error posting tweet:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to post tweet", details: error },
      { status: 500 }
    );
  }
}
