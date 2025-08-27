
# DeepAgent MVP Verification Protocol

## Overview

The DeepAgent MVP is a simplified but operational 3-phase verification system for analyzing insights and determining their academic validity, technical feasibility, and logical consistency. This MVP serves as a foundation for the full DeepAgent protocol and provides clear integration points for Falcon deep research capabilities.

## Architecture

### 3-Phase Workflow

1. **Phase 1: Academic Discovery** - Maps insights to academic literature and identifies research context
2. **Phase 2: Technical Feasibility** - Assesses implementation viability and resource requirements  
3. **Phase 3: Contradiction Analysis** - Detects logical inconsistencies and provides final verification

### Key Features

- **JSON Schema Validation** - Strict input/output validation using JSON Schema Draft-07
- **Quality Gates** - Configurable thresholds and validation criteria
- **Falcon Integration Points** - Built-in triggers for deep research escalation
- **Modular Design** - Clean separation of concerns with extensible architecture

## Quick Start

### Prerequisites

- Python 3.7+
- `jsonschema` library

### Installation

```bash
# Install dependencies
pip install jsonschema

# Make test script executable
chmod +x tests/run_test.sh
```

### Basic Usage

```bash
# Run on sample input
python src/deepagent_mvp.py -i tests/sample_input.json -o output.json

# Run with custom directories
python src/deepagent_mvp.py \
    --input input.json \
    --output output.json \
    --prompts-dir prompts \
    --schemas-dir schemas
```

### Test Execution

```bash
# Run the complete test suite
bash tests/run_test.sh

# Run quality assessment
python qa/metrics.py tests/sample_output.json
```

## Directory Structure

```
deepagent_mvp/
├── src/
│   └── deepagent_mvp.py          # Main processing engine
├── prompts/
│   ├── phase1_academic_discovery.txt
│   ├── phase2_technical_feasibility.txt
│   └── phase3_contradiction_analysis.txt
├── schemas/
│   ├── input.json                # Input validation schema
│   ├── output.json               # Output validation schema
│   └── qa.json                   # Quality assurance schema
├── tests/
│   ├── sample_input.json         # Test input data
│   ├── sample_output.json        # Generated test output
│   └── run_test.sh               # Test execution script
├── qa/
│   └── metrics.py                # Quality assessment tools
├── docs/
│   ├── README.md                 # This file
│   ├── IMPLEMENTATION_GUIDE.md   # Detailed implementation guide
│   └── FALCON_HANDOFF.md         # Falcon integration procedures
└── integration/
    └── falcon_interface.py       # Falcon integration interface
```

## Input Format

Insights must be provided in JSON format matching the input schema:

```json
{
  "id": "unique_identifier",
  "content": "The insight text to analyze...",
  "source": "research_paper|patent|news_article|expert_interview|conference_presentation|other",
  "timestamp": "2025-08-27T10:30:00Z",
  "metadata": {
    "priority": "low|medium|high|critical",
    "domain": "field_name",
    "tags": ["tag1", "tag2"]
  }
}
```

## Output Format

The system produces structured JSON output with results from all three phases:

```json
{
  "insight_id": "unique_identifier",
  "processing_timestamp": "2025-08-27T10:35:00Z",
  "phases": {
    "phase1": { /* Academic discovery results */ },
    "phase2": { /* Technical feasibility results */ },
    "phase3": { /* Contradiction analysis results */ }
  },
  "summary": {
    "verification_status": "verified|requires_review|significant_concerns|rejected",
    "confidence_score": 0.75,
    "falcon_required": false
  }
}
```

## Quality Gates

The system includes configurable quality gates that determine processing outcomes:

- **Literature Confidence** ≥ 0.6 (Phase 1)
- **Feasibility Score** ≥ 0.5 (Phase 2)  
- **Logical Consistency** ≥ 0.7 (Phase 3)
- **Overall Confidence** ≥ 0.75 for verification

## Falcon Integration

The MVP includes built-in Falcon trigger points:

- **Phase 1**: Triggered by breakthrough/revolutionary content or low literature confidence
- **Phase 2**: Triggered by low Phase 1 confidence or high technical complexity
- **Phase 3**: Triggered by low logical consistency or multiple evidence conflicts

## Development Status

This is an MVP implementation with simulated analysis functions. For production deployment:

1. Replace simulation functions with real academic database integration
2. Implement actual technical feasibility assessment algorithms
3. Add sophisticated contradiction detection logic
4. Integrate with Falcon deep research system

## Support

For implementation questions, see:
- [Implementation Guide](IMPLEMENTATION_GUIDE.md) - Detailed setup and deployment
- [Falcon Handoff Guide](FALCON_HANDOFF.md) - Integration procedures

## License

This MVP is provided as a reference implementation for the DeepAgent verification protocol.
