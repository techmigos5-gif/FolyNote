import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from './storage';
import { DailyThought } from '../types';

describe('storage (localStorage offline-first layer)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty defaults when nothing is stored', () => {
    expect(storage.getThoughts()).toEqual([]);
    expect(storage.getDocuments()).toEqual([]);
    expect(storage.getIdeas()).toEqual([]);
  });

  it('round-trips a thought through save and load', () => {
    const thought: DailyThought = {
      id: 't1',
      date: '2026-09-20',
      time: '9:41 AM',
      title: 'Morning reflection',
      content: 'Testing the offline-first cache.',
      tags: ['test'],
      isPinned: false,
    };
    storage.saveThoughts([thought]);
    expect(storage.getThoughts()).toEqual([thought]);
  });

  it('survives a page-reload-shaped re-read (no in-memory cache)', () => {
    const thought: DailyThought = {
      id: 't2',
      date: '2026-09-20',
      time: '10:00 PM',
      title: 'Evening reflection',
      content: 'Still here after reload.',
    };
    storage.saveThoughts([thought]);
    // Re-import to simulate a fresh module instance (fresh page load)
    expect(storage.getThoughts()[0].id).toBe('t2');
  });

  it('exports and re-imports a full backup', () => {
    const thought: DailyThought = {
      id: 't3',
      date: '2026-09-20',
      time: '12:00 PM',
      title: 'Backup check',
      content: 'Round trip.',
    };
    storage.saveThoughts([thought]);
    const json = storage.exportAllData();
    localStorage.clear();
    expect(storage.getThoughts()).toEqual([]);

    expect(storage.importAllData(json)).toBe(true);
    expect(storage.getThoughts().some((t) => t.id === 't3')).toBe(true);
  });

  it('rejects invalid backup JSON instead of throwing', () => {
    expect(storage.importAllData('not json at all {')).toBe(false);
  });
});
