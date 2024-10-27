// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import axios from "axios";
import * as fs from 'fs';
import * as path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error("No image URL received from OpenAI");
    }

    // Download the image
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });

    // Create a unique filename
    const timestamp = Date.now();
    const imageName = `generated-${timestamp}.png`;
    
    // Save to public/temp directory
    const publicPath = path.join(process.cwd(), 'public', 'temp');
    const filePath = path.join(publicPath, imageName);

    // Ensure temp directory exists
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, Buffer.from(imageResponse.data));

    // Return the public URL
    return NextResponse.json({ 
      imageUrl: `/temp/${imageName}`,
      fullPath: filePath
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}