
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { User } from '@/api/entities';
import { UploadFile } from "@/api/integrations";
import { createPageUrl } from "@/utils";

export default function ScreenshotButton({ sketchRef, shapeName, selectedColor }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const takeScreenshot = async () => {
    if (isProcessing) return;

    const canvas = sketchRef.current?.querySelector('canvas');
    if (!canvas) {
      console.warn('Canvas element not found for screenshot.');
      return;
    }

    setIsProcessing(true);

    try {
      // Get current selection data from localStorage
      const selectionData = JSON.parse(localStorage.getItem('currentSelection') || '{}');
      
      // Create meaningful filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const emotion = selectionData.emotion ? selectionData.emotion.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown';
      const reason = selectionData.reason ? selectionData.reason.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown';
      const filename = `${emotion}_${reason}_${shapeName}_${timestamp}`;

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      if (!blob) {
        throw new Error('Failed to create Blob from canvas.');
      }
      
      // Convert blob to file for upload
      const file = new File([blob], `${filename}.png`, { type: 'image/png' });
      
      // Upload to base44
      const { file_url } = await UploadFile({ file });

      // Create poster data object
      const posterData = {
        emotion: selectionData.emotion || '',
        reason: selectionData.reason || '',
        color: selectedColor,
        shape: shapeName,
        img: filename,
        imgRoute: file_url
      };

      // Get current user data and update with the new poster
      const user = await User.me();
      const currentUserData = user.posters || [];
      const updatedPosters = [...currentUserData, posterData];
      
      await User.updateMyUserData({ posters: updatedPosters });
      
      // Also save to localStorage for the live gallery page
      const storedPosters = JSON.parse(localStorage.getItem('emotionPosters') || '[]');
      const newPoster = {
        id: Date.now(), // Unique ID for local state management
        title: `${selectionData.emotion || 'Unknown'} - ${selectionData.reason || 'Unknown'}`,
        imageUrl: file_url,
        ...posterData
      };
      
      storedPosters.unshift(newPoster);
      localStorage.setItem('emotionPosters', JSON.stringify(storedPosters));
      
      console.log('Screenshot saved and data updated successfully!');
      
      // Navigate on success
      navigate(createPageUrl("Gallery"));

    } catch (error) {
      console.error('Error taking screenshot or uploading:', error);
      // Re-enable the button on error via the finally block
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button onClick={takeScreenshot} disabled={isProcessing} variant="outline" className="flex-shrink-0 p-4">
      {isProcessing ? (
        <Loader2 className="w-9 h-9 animate-spin" />
      ) : (
        <Camera className="w-9 h-9" />
      )}
    </Button>
  );
}
