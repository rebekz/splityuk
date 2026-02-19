"use client";

import { useState } from "react";

interface SplitResult {
  participantId: string;
  participantName: string;
  amount: number;
  items: {
    itemId: string;
    itemName: string;
    amount: number;
  }[];
}

interface Assignment {
  itemId: string;
  participantId: string;
  amount: number;
}

interface Item {
  id: string;
  name: string;
  unitPrice: string;
  quantity: number;
}

interface Participant {
  id: string;
  displayName: string;
}

/**
 * Calculate equal split for an item
 */
export function calculateEqualSplit(
  itemTotal: number,
  participantIds: string[]
): { participantId: string; amount: number }[] {
  if (participantIds.length === 0) return [];
  
  const baseAmount = Math.floor(itemTotal / participantIds.length);
  const remainder = itemTotal - baseAmount * participantIds.length;
  
  return participantIds.map((id, index) => ({
    participantId: id,
    amount: baseAmount + (index < remainder ? 1 : 0),
  }));
}

/**
 * Calculate total for a participant across all assignments
 */
export function calculateParticipantTotal(
  participantId: string,
  assignments: Assignment[]
): number {
  return assignments
    .filter((a) => a.participantId === participantId)
    .reduce((sum, a) => sum + a.amount, 0);
}

/**
 * Get unclaimed items
 */
export function getUnclaimedItems(items: Item[], assignments: Assignment[]): Item[] {
  const claimedItemIds = new Set(assignments.map((a) => a.itemId));
  return items.filter((item) => !claimedItemIds.has(item.id));
}

/**
 * Calculate split results for all participants
 */
export function calculateSplitResults(
  items: Item[],
  participants: Participant[],
  assignments: Assignment[]
): SplitResult[] {
  const results: SplitResult[] = participants.map((p) => ({
    participantId: p.id,
    participantName: p.displayName,
    amount: 0,
    items: [],
  }));

  for (const assignment of assignments) {
    const item = items.find((i) => i.id === assignment.itemId);
    const result = results.find((r) => r.participantId === assignment.participantId);
    
    if (item && result) {
      result.amount += assignment.amount;
      result.items.push({
        itemId: item.id,
        itemName: item.name,
        amount: assignment.amount,
      });
    }
  }

  return results;
}

/**
 * Format split summary for sharing
 */
export function formatSplitSummary(
  billName: string,
  results: SplitResult[]
): string {
  const lines = [
    `📝 *${billName}*`,
    "",
    "Tagihan per orang:",
    "",
  ];

  for (const result of results) {
    lines.push(`• ${result.participantName}: Rp ${result.amount.toLocaleString("id-ID")}`);
  }

  lines.push("");
  lines.push("_Dibuat dengan SplitYuk_");

  return lines.join("\n");
}
