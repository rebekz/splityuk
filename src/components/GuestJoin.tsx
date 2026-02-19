"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface GuestJoinProps {
  billCode: string;
  onJoin: (participantId: string, displayName: string) => void;
}

export function GuestJoin({ billCode, onJoin }: GuestJoinProps) {
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsLoading(true);
    
    try {
      // Generate or retrieve participant ID from localStorage
      let participantId = localStorage.getItem(`participant_${billCode}`);
      
      if (!participantId) {
        // Create new participant via API
        const response = await fetch(`/api/bills/${billCode}/participants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName: displayName.trim() }),
        });
        
        if (response.ok) {
          const data = await response.json();
          participantId = data.participantId;
          localStorage.setItem(`participant_${billCode}`, participantId!);
        }
      }
      
      if (participantId) {
        onJoin(participantId, displayName.trim());
      }
    } catch (error) {
      console.error("Failed to join as guest:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join Bill</CardTitle>
        <CardDescription>
          Enter your name to join this shared bill as a guest
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Your Name</Label>
            <Input
              id="displayName"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !displayName.trim()}>
            {isLoading ? "Joining..." : "Join Bill"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
