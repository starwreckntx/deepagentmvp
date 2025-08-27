
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Brain,
  Zap,
  Shield,
  ChevronDown,
  ChevronRight,
  Download,
  Share2,
  Clock,
  Target,
  Info,
  Lightbulb
} from 'lucide-react';

interface VerificationResultsProps {
  result: any;
}

export function VerificationResults({ result }: VerificationResultsProps) {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    phase1: false,
    phase2: false,
    phase3: false,
    rawJson: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'requires_review':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'significant_concerns':
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'requires_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'significant_concerns':
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `deepagent_verification_${result.insight_id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const shareResults = async () => {
    const shareData = {
      title: 'DeepAgent Verification Results',
      text: `Verification completed for insight ${result.insight_id}. Status: ${result.summary?.verification_status}. Confidence: ${(result.summary?.confidence_score * 100).toFixed(1)}%`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    }
  };

  const phases = result.phases || {};
  const summary = result.summary || {};

  return (
    <div className="mt-8 space-y-6">
      {/* Summary Card */}
      <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(summary.verification_status)}
              Verification Complete
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={shareResults} variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={downloadResults} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <CardDescription>
            Insight ID: {result.insight_id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(summary.verification_status)}`}>
                {summary.verification_status?.replace('_', ' ').toUpperCase()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Verification Status</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(summary.confidence_score * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Confidence Score</p>
              <Progress value={summary.confidence_score * 100} className="mt-2" />
            </div>
            <div className="text-center">
              <Badge variant={summary.falcon_required ? 'destructive' : 'secondary'}>
                {summary.falcon_required ? 'Required' : 'Not Required'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">Falcon Deep Research</p>
            </div>
          </div>

          {summary.falcon_required && (
            <Alert className="mb-4">
              <Target className="h-4 w-4" />
              <AlertDescription>
                <strong>Falcon Deep Research Recommended:</strong> This insight requires additional 
                deep research and analysis to resolve uncertainties or contradictions identified 
                during the verification process.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Phase Results */}
      <div className="space-y-4">
        {/* Phase 1: Academic Discovery */}
        {phases.phase1 && (
          <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <Collapsible open={expandedSections.phase1} onOpenChange={() => toggleSection('phase1')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Phase 1: Academic Discovery
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {(phases.phase1.academic_context?.literature_confidence * 100).toFixed(0)}% Confidence
                      </Badge>
                      {expandedSections.phase1 ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Related Fields
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {phases.phase1.academic_context?.related_fields?.map((field: string, idx: number) => (
                          <Badge key={idx} variant="outline">{field}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Key Concepts
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {phases.phase1.academic_context?.key_concepts?.map((concept: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{concept}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Research Gaps Identified</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {phases.phase1.academic_context?.research_gaps?.map((gap: string, idx: number) => (
                        <li key={idx}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                  {phases.phase1.falcon_trigger && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Falcon research triggered due to cutting-edge or highly specialized content.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* Phase 2: Technical Feasibility */}
        {phases.phase2 && (
          <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <Collapsible open={expandedSections.phase2} onOpenChange={() => toggleSection('phase2')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-indigo-600" />
                      Phase 2: Technical Feasibility
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {(phases.phase2.feasibility_assessment?.feasibility_score * 100).toFixed(0)}% Feasible
                      </Badge>
                      {expandedSections.phase2 ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Technical Complexity</h4>
                      <Badge variant={phases.phase2.feasibility_assessment?.technical_complexity === 'high' ? 'destructive' : 
                                   phases.phase2.feasibility_assessment?.technical_complexity === 'medium' ? 'default' : 'secondary'}>
                        {phases.phase2.feasibility_assessment?.technical_complexity?.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Resource Requirements</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Funding:</span>
                          <span className="font-medium">{phases.phase2.feasibility_assessment?.resource_requirements?.funding}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expertise:</span>
                          <span className="font-medium">{phases.phase2.feasibility_assessment?.resource_requirements?.expertise}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Timeline:</span>
                          <span className="font-medium">{phases.phase2.feasibility_assessment?.resource_requirements?.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Infrastructure:</span>
                          <span className="font-medium">{phases.phase2.feasibility_assessment?.resource_requirements?.infrastructure}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Implementation Barriers</h4>
                    <div className="flex flex-wrap gap-2">
                      {phases.phase2.feasibility_assessment?.implementation_barriers?.map((barrier: string, idx: number) => (
                        <Badge key={idx} variant="outline">{barrier}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* Phase 3: Contradiction Analysis */}
        {phases.phase3 && (
          <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <Collapsible open={expandedSections.phase3} onOpenChange={() => toggleSection('phase3')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Phase 3: Contradiction Analysis
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {(phases.phase3.contradiction_analysis?.logical_consistency * 100).toFixed(0)}% Consistent
                      </Badge>
                      {expandedSections.phase3 ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Internal Contradictions</h4>
                      {phases.phase3.contradiction_analysis?.internal_contradictions?.length ? (
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {phases.phase3.contradiction_analysis.internal_contradictions.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-green-600">None identified</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">External Contradictions</h4>
                      {phases.phase3.contradiction_analysis?.external_contradictions?.length ? (
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {phases.phase3.contradiction_analysis.external_contradictions.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-green-600">None identified</p>
                      )}
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Final Recommendation</h4>
                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>
                        {phases.phase3.final_verification?.recommendation}
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* Raw JSON Output */}
        <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <Collapsible open={expandedSections.rawJson} onOpenChange={() => toggleSection('rawJson')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-gray-600" />
                    Raw JSON Output
                  </div>
                  {expandedSections.rawJson ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
}
