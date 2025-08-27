
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, source, priority, domain, tags, context, depthLevel, priorityScore } = body;

    if (!content || !source) {
      return NextResponse.json({ error: 'Content and source are required' }, { status: 400 });
    }

    const insightId = uuidv4();
    const timestamp = new Date();

    // Save verification request to database
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        insightId,
        content,
        source,
        timestamp,
        priority,
        domain,
        tags: tags || [],
        context,
        depthLevel,
        priorityScore,
        status: 'PROCESSING',
        processingStartedAt: new Date(),
      },
    });

    // Prepare input for Python system
    const pythonInput = {
      id: insightId,
      content,
      source,
      timestamp: timestamp.toISOString(),
      metadata: {
        priority,
        domain,
        tags: tags || [],
      },
    };

    // Write input file for Python system
    const inputFilePath = join(process.cwd(), 'temp', `input_${insightId}.json`);
    const outputFilePath = join(process.cwd(), 'temp', `output_${insightId}.json`);
    
    // Ensure temp directory exists
    await writeFile(inputFilePath, JSON.stringify(pythonInput, null, 2));

    // Run Python DeepAgent system
    const pythonProcess = spawn('python3', [
      join(process.cwd(), 'deepagent_system/src/deepagent_mvp.py'),
      '-i', inputFilePath,
      '-o', outputFilePath,
      '--prompts-dir', join(process.cwd(), 'deepagent_system/prompts'),
      '--schemas-dir', join(process.cwd(), 'deepagent_system/schemas'),
    ]);

    // Handle Python process completion
    await new Promise<void>((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python process exited with code ${code}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(error);
      });
    });

    // Read Python output
    const outputData = await readFile(outputFilePath, 'utf-8');
    const result = JSON.parse(outputData);

    // Save results to database
    const phase1 = result.phases?.phase1;
    const phase2 = result.phases?.phase2;
    const phase3 = result.phases?.phase3;

    await prisma.verificationResult.create({
      data: {
        requestId: verificationRequest.id,
        verificationStatus: result.summary?.verification_status || 'unknown',
        confidenceScore: result.summary?.confidence_score || 0,
        falconRequired: result.summary?.falcon_required || false,

        // Phase 1
        phase1RelatedFields: phase1?.academic_context?.related_fields || [],
        phase1KeyConcepts: phase1?.academic_context?.key_concepts || [],
        phase1ResearchGaps: phase1?.academic_context?.research_gaps || [],
        phase1LitConfidence: phase1?.academic_context?.literature_confidence || 0,
        phase1FalconTrigger: phase1?.falcon_trigger || false,
        phase1Timestamp: new Date(phase1?.timestamp || timestamp),

        // Phase 2
        phase2TechComplexity: phase2?.feasibility_assessment?.technical_complexity || 'unknown',
        phase2FundingReq: phase2?.feasibility_assessment?.resource_requirements?.funding || 'unknown',
        phase2ExpertiseReq: phase2?.feasibility_assessment?.resource_requirements?.expertise || 'unknown',
        phase2TimeReq: phase2?.feasibility_assessment?.resource_requirements?.time || 'unknown',
        phase2Infrastructure: phase2?.feasibility_assessment?.resource_requirements?.infrastructure || 'unknown',
        phase2Barriers: phase2?.feasibility_assessment?.implementation_barriers || [],
        phase2FeasibilityScore: phase2?.feasibility_assessment?.feasibility_score || 0,
        phase2FalconTrigger: phase2?.falcon_trigger || false,
        phase2Timestamp: new Date(phase2?.timestamp || timestamp),

        // Phase 3
        phase3InternalContradictions: phase3?.contradiction_analysis?.internal_contradictions || [],
        phase3ExternalContradictions: phase3?.contradiction_analysis?.external_contradictions || [],
        phase3LogicalConsistency: phase3?.contradiction_analysis?.logical_consistency || 0,
        phase3EvidenceConflicts: phase3?.contradiction_analysis?.evidence_conflicts || [],
        phase3Recommendation: phase3?.final_verification?.recommendation || 'No recommendation',
        phase3FalconTrigger: phase3?.falcon_trigger || false,
        phase3Timestamp: new Date(phase3?.timestamp || timestamp),

        rawOutput: result,
      },
    });

    // Update request status
    await prisma.verificationRequest.update({
      where: { id: verificationRequest.id },
      data: {
        status: 'COMPLETED',
        processingCompletedAt: new Date(),
      },
    });

    // Cleanup temp files
    try {
      await unlink(inputFilePath);
      await unlink(outputFilePath);
    } catch (error) {
      console.warn('Failed to cleanup temp files:', error);
    }

    return NextResponse.json({
      success: true,
      requestId: verificationRequest.id,
      result,
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
