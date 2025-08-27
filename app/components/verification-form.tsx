
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Check, FileText, Loader2, Plus, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VerificationResults } from '@/components/verification-results';

interface FormData {
  content: string;
  source: string;
  priority: string;
  domain: string;
  tags: string[];
  context: string;
  depthLevel: string;
  priorityScore: number;
}

const initialFormData: FormData = {
  content: '',
  source: 'research_paper',
  priority: 'medium',
  domain: '',
  tags: [],
  context: '',
  depthLevel: 'foundational',
  priorityScore: 0.5,
};

export function VerificationForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTag, setNewTag] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setError('Insight content is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.result);
      
      // Reset form on success
      setFormData(initialFormData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5" />
            AI Governance Insight Verification
          </CardTitle>
          <CardDescription>
            Submit your AI governance insight for comprehensive 3-phase verification analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Insight Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                Insight Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Enter your AI governance insight here. Be specific and detailed to ensure accurate verification..."
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="min-h-32 resize-none"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source */}
              <div className="space-y-2">
                <Label htmlFor="source" className="text-sm font-medium">Source Type</Label>
                <Select 
                  value={formData.source} 
                  onValueChange={(value) => handleInputChange('source', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="research_paper">Research Paper</SelectItem>
                    <SelectItem value="patent">Patent</SelectItem>
                    <SelectItem value="news_article">News Article</SelectItem>
                    <SelectItem value="expert_interview">Expert Interview</SelectItem>
                    <SelectItem value="conference_presentation">Conference Presentation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium">Priority Level</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleInputChange('priority', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Domain */}
              <div className="space-y-2">
                <Label htmlFor="domain" className="text-sm font-medium">Domain</Label>
                <Input
                  id="domain"
                  placeholder="e.g., AI Safety, Machine Learning, Ethics"
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Depth Level */}
              <div className="space-y-2">
                <Label htmlFor="depthLevel" className="text-sm font-medium">Analysis Depth</Label>
                <Select 
                  value={formData.depthLevel} 
                  onValueChange={(value) => handleInputChange('depthLevel', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select depth" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="implementation">Implementation</SelectItem>
                    <SelectItem value="foundational">Foundational</SelectItem>
                    <SelectItem value="systemic">Systemic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority Score Slider */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Priority Score: {formData.priorityScore.toFixed(1)}
              </Label>
              <Slider
                value={[formData.priorityScore]}
                onValueChange={([value]) => handleInputChange('priorityScore', value)}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  disabled={isLoading}
                />
                <Button type="button" onClick={addTag} size="sm" disabled={isLoading}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                        disabled={isLoading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Context */}
            <div className="space-y-2">
              <Label htmlFor="context" className="text-sm font-medium">Additional Context</Label>
              <Textarea
                id="context"
                placeholder="Optional: Provide additional context, background information, or specific aspects you'd like emphasized in the analysis..."
                value={formData.context}
                onChange={(e) => handleInputChange('context', e.target.value)}
                className="resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Error display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Verification...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Start Verification Process
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && <VerificationResults result={result} />}
    </>
  );
}
