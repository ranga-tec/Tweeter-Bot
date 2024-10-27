// src/components/TweetImageBot.tsx
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageIcon, Send, RotateCw, AlertCircle, Info } from "lucide-react"

export default function TweetImageBot() {
  const [tweet, setTweet] = useState('')
  const [imagePrompt, setImagePrompt] = useState('')
  const [previewUrl, setPreviewUrl] = useState('/api/placeholder/400/300')
  const [base64Image, setBase64Image] = useState('')
  const [status, setStatus] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)

  const handleGenerateImage = async () => {
    if (!tweet && !imagePrompt) {
      setStatus('Please enter either a tweet or an image prompt')
      return
    }

    setIsGenerating(true)
    setStatus('Generating image...')
    
    try {
      const promptToUse = imagePrompt.trim() || tweet.trim()
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToUse }),
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setPreviewUrl(data.imageUrl)
      setBase64Image(data.base64Image)
      setStatus('Image generated successfully!')
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to generate image'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePostTweet = async () => {
    if (!tweet) {
      setStatus('Please enter tweet content before posting')
      return
    }

    if (previewUrl === '/api/placeholder/400/300') {
      setStatus('Please generate an image first')
      return
    }

    setIsPosting(true)
    setStatus('Posting tweet...')
    
    try {
      const response = await fetch('/api/tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tweet,
          base64Image: base64Image
        }),
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setStatus('Tweet posted successfully!')
      setTweet('')
      setImagePrompt('')
      setPreviewUrl('/api/placeholder/400/300')
      setBase64Image('')
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to post tweet'}`)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Tweet Image Bot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Tweet Content</label>
            <Textarea
              placeholder="Enter your tweet here..."
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="text-sm text-gray-500 mt-1">
              {280 - tweet.length} characters remaining
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Image Generation Prompt (Optional)
            </label>
            <Textarea
              placeholder="Describe the image you want to generate... (leave empty to use tweet content)"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="min-h-[100px]"
            />
            {!imagePrompt && tweet && (
              <div className="flex items-center mt-1 text-sm text-blue-500">
                <Info className="w-4 h-4 mr-1" />
                Will use tweet content for image generation
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleGenerateImage}
              disabled={isGenerating || (!imagePrompt && !tweet)}
              className="flex-1"
            >
              {isGenerating ? (
                <RotateCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4 mr-2" />
              )}
              Generate Image
            </Button>
            
            <Button 
              onClick={handlePostTweet}
              disabled={isPosting || !tweet || previewUrl === '/api/placeholder/400/300'}
              className="flex-1"
            >
              {isPosting ? (
                <RotateCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Post Tweet
            </Button>
          </div>

          {status && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Image Preview</h3>
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <div className="relative w-full pt-[100%]">
                <img
                  src={previewUrl}
                  alt="Generated preview"
                  className="absolute top-0 left-0 w-full h-full object-contain p-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}