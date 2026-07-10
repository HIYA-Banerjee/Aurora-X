'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Clock,
  Eye,
  EyeOff,
  Bold,
  Italic,
  Underline,
  List as ListIcon,
  Quote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input, Textarea } from '../../../components/ui/input';
import { Select } from '../../../components/ui/forms';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useToastStore } from '../../../store/toast-store';
import { api } from '../../../lib/api';
import axios from 'axios';

interface MemoryEditorProps {
  id?: string;
  initialData?: any;
  onSave: (data: any) => Promise<any>;
}

export default function MemoryEditor({ id, initialData, onSave }: MemoryEditorProps) {
  const router = useRouter();
  const { addToast } = useToastStore();

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [eventDate, setEventDate] = useState(
    initialData?.eventDate ? new Date(initialData.eventDate).toISOString().substring(0, 10) : ''
  );
  const [location, setLocation] = useState(initialData?.location || '');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'SHARED' | 'PUBLIC'>(initialData?.visibility || 'PRIVATE');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [emotion, setEmotion] = useState(initialData?.metadata?.emotion || 'joy');
  const [importance, setImportance] = useState<number>(initialData?.metadata?.importance || 5);

  // Layout & Media UI States
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftRecoverable, setIsDraftRecoverable] = useState(false);
  
  // Photo Upload States
  const [photos, setPhotos] = useState<any[]>(initialData?.photos || []);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Draft Autosaving ---
  const draftKey = `aurora_memory_draft_${id || 'new'}`;

  useEffect(() => {
    // Check if there is an existing draft to recover on mount
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      const timer = setTimeout(() => setIsDraftRecoverable(true), 0);
      return () => clearTimeout(timer);
    }
  }, [draftKey]);

  useEffect(() => {
    // Autosave to draft storage every 4 seconds when user types
    if (!title && !description) return;
    const timer = setTimeout(() => {
      const draftData = { title, description, eventDate, location, visibility, tags, emotion, importance };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    }, 4000);

    return () => clearTimeout(timer);
  }, [title, description, eventDate, location, visibility, tags, emotion, importance, draftKey]);

  const recoverDraft = () => {
    try {
      const draftData = JSON.parse(localStorage.getItem(draftKey) || '{}');
      if (draftData.title) setTitle(draftData.title);
      if (draftData.description) setDescription(draftData.description);
      if (draftData.eventDate) setEventDate(draftData.eventDate);
      if (draftData.location) setLocation(draftData.location);
      if (draftData.visibility) setVisibility(draftData.visibility);
      if (draftData.tags) setTags(draftData.tags);
      if (draftData.emotion) setEmotion(draftData.emotion);
      if (draftData.importance) setImportance(draftData.importance);

      addToast({ title: 'Draft Recovered', description: 'Restored your unsaved changes.', type: 'info' });
      setIsDraftRecoverable(false);
    } catch {
      localStorage.removeItem(draftKey);
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(draftKey);
    setIsDraftRecoverable(false);
  };

  // --- Word Counters ---
  const wordCount = description ? description.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = description ? description.length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // --- Markdown Formatting Toolbar ---
  const insertMarkdown = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    let replacement = '';
    switch (syntax) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        break;
      case 'underline':
        replacement = `<u>${selected || 'underlined text'}</u>`;
        break;
      case 'list':
        replacement = `\n- ${selected || 'list item'}`;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'blockquote'}`;
        break;
      case 'code':
        replacement = `\n\`\`\`\n${selected || 'code block'}\n\`\`\``;
        break;
      default:
        break;
    }

    setDescription(before + replacement + after);
    textarea.focus();
  };

  // --- Tags Management ---
  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().toLowerCase();
      if (!tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // --- Photo Upload widget ---
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (id) {
      formData.append('memoryId', id);
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await api.post('/api/v1/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 50;
          setUploadProgress(percent);
        },
      }) as any;

      setPhotos([...photos, response]);
      addToast({ title: 'Photo Uploaded', description: 'File uploaded and optimized successfully.', type: 'success' });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to upload photo';
      addToast({ title: 'Upload Failed', description: msg, type: 'error' });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const removePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to remove this photo?')) return;
    try {
      await api.delete(`/api/v1/photos/${photoId}`);
      setPhotos(photos.filter((p) => p.id !== photoId));
      addToast({ title: 'Photo Removed', description: 'Media asset deleted.', type: 'success' });
    } catch {
      addToast({ title: 'Error', description: 'Could not remove photo.', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      addToast({ title: 'Validation Error', description: 'A title is required.', type: 'warning' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title,
        description,
        eventDate: eventDate || null,
        location: location || null,
        visibility,
        tags,
        metadata: { emotion, importance },
        // If editing, carry over database updatedAt for optimistic lock
        ...(initialData?.updatedAt && { updatedAt: initialData.updatedAt }),
      };

      const result = await onSave(payload);
      
      // If photos were uploaded BEFORE creating the memory, link them
      if (!id && result.id && photos.length > 0) {
        for (const p of photos) {
          await api.patch(`/api/v1/photos/${p.id}/metadata`, { memoryId: result.id });
        }
      }

      // Clear draft
      localStorage.removeItem(draftKey);
      router.push(`/dashboard/memories/${result.id || id}`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        addToast({
          title: 'Version Conflict (409)',
          description: 'This memory has been updated elsewhere. Please copy your edits, reload and retry.',
          type: 'error',
        });
      } else {
        addToast({ title: 'Error Saving', description: err.response?.data?.message || 'Could not save memory.', type: 'error' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      {/* Draft recovery banner */}
      {isDraftRecoverable && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-indigo-200/20 bg-indigo-500/10 text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span>We found an unsaved draft of this memory.</span>
          </div>
          <div className="flex gap-2">
            <Button variant="subtle" size="sm" onClick={recoverDraft}>
              Recover Draft
            </Button>
            <Button variant="ghost" size="sm" onClick={discardDraft}>
              Discard
            </Button>
          </div>
        </div>
      )}

      {/* Main split form workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side 2 Cols: Title & Textarea Workspace */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Card className="p-6 flex flex-col gap-4">
            <Input
              label="Memory Title"
              placeholder="Give this moment a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
              required
            />

            {/* Custom Markdown Editor & Toolbar */}
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Description</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {readTime} min read
                </span>
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between border border-border rounded-t-lg bg-zinc-50/50 dark:bg-zinc-950/20 px-2 py-1.5">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('bold')} className="h-7 w-7 p-0">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('italic')} className="h-7 w-7 p-0">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('underline')} className="h-7 w-7 p-0">
                    <Underline className="h-4 w-4" />
                  </Button>
                  <span className="w-px h-4 bg-border mx-1" />
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('list')} className="h-7 w-7 p-0">
                    <ListIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('quote')} className="h-7 w-7 p-0">
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertMarkdown('code')} className="h-7 w-7 p-0">
                    <Code className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="h-7 text-xs px-2 gap-1"
                >
                  {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{previewMode ? 'Edit Mode' : 'Preview'}</span>
                </Button>
              </div>

              {/* Textarea or Preview content */}
              {previewMode ? (
                <div className="min-h-[200px] w-full rounded-b-lg border border-t-0 border-border p-4 bg-transparent text-sm prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                  {description || <span className="italic text-muted-foreground">Nothing to preview.</span>}
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSaving}
                  placeholder="Record your thoughts, emotions, and what happened..."
                  className="min-h-[200px] w-full rounded-b-lg border border-t-0 border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-y"
                />
              )}

              {/* Counters */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1 px-1">
                <span>{charCount} characters</span>
                <span>{wordCount} words</span>
              </div>
            </div>
          </Card>

          {/* Photo upload Drag & Drop Card */}
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Media Files</h3>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl p-8 text-center cursor-pointer bg-zinc-50/20 dark:bg-zinc-950/5 flex flex-col items-center justify-center gap-2 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isUploading}
                className="hidden"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-border">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">Upload Photo</p>
              <p className="text-xs text-muted-foreground">Drag and drop or click to browse (image/*, &lt;5MB)</p>
            </div>

            {/* Upload progress indicator */}
            {isUploading && uploadProgress !== null && (
              <div className="flex flex-col gap-1 w-full bg-muted/30 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5"><RefreshCw className="h-3 w-3 animate-spin text-indigo-500" /> Optimizing & uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all duration-250" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Uploaded Preview items */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`http://localhost:3000/uploads/${photo.storageKey}`}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Side 1 Col: Metadata Options */}
        <div className="flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Memory Options</h3>
            
            <Input
              label="Event Date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              disabled={isSaving}
            />

            <Input
              label="Location"
              placeholder="e.g. Paris, France"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isSaving}
            />

            <Select
              label="Visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              disabled={isSaving}
              options={[
                { label: 'Private (Only You)', value: 'PRIVATE' },
                { label: 'Shared (Close contacts)', value: 'SHARED' },
                { label: 'Public (Open)', value: 'PUBLIC' },
              ]}
            />
          </Card>

          {/* AI metadata tags editor card */}
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Analysis Metadata</h3>
            
            <Select
              label="Dominant Emotion"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              disabled={isSaving}
              options={[
                { label: 'Joy ☀️', value: 'joy' },
                { label: 'Sadness 🌧️', value: 'sadness' },
                { label: 'Anger 🌋', value: 'anger' },
                { label: 'Fear 🌪️', value: 'fear' },
                { label: 'Surprise ✨', value: 'surprise' },
                { label: 'Neutral ☁️', value: 'neutral' },
              ]}
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Importance Rating ({importance}/10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={importance}
                onChange={(e) => setImportance(Number(e.target.value))}
                disabled={isSaving}
                className="w-full accent-primary h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Custom tags input */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tags
              </label>
              <Input
                placeholder="Type tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                disabled={isSaving}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t, idx) => (
                  <Badge key={idx} variant="secondary" className="pr-1 gap-1 py-0.5 text-[11px]">
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(idx)}
                      className="text-muted-foreground hover:text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800 p-0.5 rounded-full cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col gap-2 mt-2">
            <Button type="submit" variant="primary" className="w-full" leftIcon={<Save className="h-4 w-4" />} isLoading={isSaving}>
              Save Memory
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={isSaving}
              onClick={() => router.push('/dashboard/memories')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
