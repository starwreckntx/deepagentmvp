
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, FileText, Target } from 'lucide-react';
import Link from 'next/link';
import { VerificationResults } from '@/components/verification-results';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = params;

  const request = await prisma.verificationRequest.findUnique({
    where: { id },
    include: {
      result: true,
    },
  });

  if (!request || !request.result) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Reconstruct the result object for the VerificationResults component
  const reconstructedResult = request.result.rawOutput as any;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Verification Result
            </h1>
            <p className="text-muted-foreground">
              Detailed analysis results for insight {request.insightId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(request.createdAt)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Processing Time: {
                request.processingCompletedAt && request.processingStartedAt
                  ? `${Math.round((new Date(request.processingCompletedAt).getTime() - new Date(request.processingStartedAt).getTime()) / 1000)}s`
                  : 'N/A'
              }
            </Badge>
          </div>
        </div>
      </div>

      {/* Original Insight */}
      <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Original Insight
          </CardTitle>
          <CardDescription>
            The insight that was submitted for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Content</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {request.content}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-1">Source</h4>
                <Badge variant="outline">{request.source}</Badge>
              </div>
              {request.domain && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Domain</h4>
                  <Badge variant="outline">{request.domain}</Badge>
                </div>
              )}
              {request.priority && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Priority</h4>
                  <Badge variant="outline">{request.priority}</Badge>
                </div>
              )}
            </div>

            {request.tags && request.tags.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {request.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {request.context && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Additional Context</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {request.context}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Results */}
      <VerificationResults result={reconstructedResult} />
    </div>
  );
}
