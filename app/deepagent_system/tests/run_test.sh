
#!/bin/bash

# DeepAgent MVP Test Runner
# This script runs the MVP on sample input and validates the output

echo "=== DeepAgent MVP Test Runner ==="
echo "Starting test execution..."

# Set paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INPUT_FILE="$SCRIPT_DIR/sample_input.json"
OUTPUT_FILE="$SCRIPT_DIR/sample_output.json"
PYTHON_SCRIPT="$PROJECT_ROOT/src/deepagent_mvp.py"
PROMPTS_DIR="$PROJECT_ROOT/prompts"
SCHEMAS_DIR="$PROJECT_ROOT/schemas"

echo "Project root: $PROJECT_ROOT"
echo "Input file: $INPUT_FILE"
echo "Output file: $OUTPUT_FILE"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "ERROR: Sample input file not found: $INPUT_FILE"
    exit 1
fi

# Check if Python script exists
if [ ! -f "$PYTHON_SCRIPT" ]; then
    echo "ERROR: DeepAgent MVP script not found: $PYTHON_SCRIPT"
    exit 1
fi

# Run the DeepAgent MVP
echo ""
echo "Running DeepAgent MVP..."
cd "$PROJECT_ROOT"

python3 "$PYTHON_SCRIPT" \
    --input "$INPUT_FILE" \
    --output "$OUTPUT_FILE" \
    --prompts-dir "$PROMPTS_DIR" \
    --schemas-dir "$SCHEMAS_DIR"

# Check if execution was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "=== Test Execution Successful ==="
    
    # Display summary if output file exists
    if [ -f "$OUTPUT_FILE" ]; then
        echo ""
        echo "=== Processing Summary ==="
        
        # Extract key information using Python
        python3 -c "
import json
import sys

try:
    with open('$OUTPUT_FILE', 'r') as f:
        data = json.load(f)
    
    print(f\"Insight ID: {data.get('insight_id', 'N/A')}\")
    print(f\"Processing Time: {data.get('processing_timestamp', 'N/A')}\")
    
    summary = data.get('summary', {})
    print(f\"Verification Status: {summary.get('verification_status', 'N/A')}\")
    print(f\"Confidence Score: {summary.get('confidence_score', 'N/A'):.3f}\")
    print(f\"Falcon Required: {summary.get('falcon_required', 'N/A')}\")
    
    phases = data.get('phases', {})
    print(f\"\\nPhase Results:\")
    for phase_name, phase_data in phases.items():
        if phase_name == 'phase1':
            lit_conf = phase_data.get('academic_context', {}).get('literature_confidence', 'N/A')
            print(f\"  Phase 1 - Literature Confidence: {lit_conf}\")
        elif phase_name == 'phase2':
            feas_score = phase_data.get('feasibility_assessment', {}).get('feasibility_score', 'N/A')
            print(f\"  Phase 2 - Feasibility Score: {feas_score}\")
        elif phase_name == 'phase3':
            logic_score = phase_data.get('contradiction_analysis', {}).get('logical_consistency', 'N/A')
            print(f\"  Phase 3 - Logical Consistency: {logic_score}\")

except Exception as e:
    print(f\"Error reading output file: {e}\")
    sys.exit(1)
"
        
        echo ""
        echo "Output saved to: $OUTPUT_FILE"
        echo "Test completed successfully!"
    else
        echo "WARNING: Output file was not created"
        exit 1
    fi
else
    echo ""
    echo "=== Test Execution Failed ==="
    echo "Check the error messages above for details"
    exit 1
fi
