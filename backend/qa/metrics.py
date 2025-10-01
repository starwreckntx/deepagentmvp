
#!/usr/bin/env python3
"""
DeepAgent MVP Quality Assurance Metrics
Calculates quality gates and validation metrics for processed insights.
"""

import json
import sys
from typing import Dict, Any, List, Tuple
from pathlib import Path

class QualityMetrics:
    def __init__(self, qa_schema_path: str = "schemas/qa.json"):
        """Initialize quality metrics with QA schema"""
        self.qa_schema_path = Path(qa_schema_path)
        self.load_qa_config()
    
    def load_qa_config(self):
        """Load QA configuration from schema"""
        try:
            with open(self.qa_schema_path, 'r') as f:
                qa_config = json.load(f)
            
            self.quality_metrics = qa_config.get("quality_metrics", {})
            self.validation_rules = qa_config.get("validation_rules", {})
            self.quality_gates = self.validation_rules.get("quality_gates", [])
            
        except FileNotFoundError:
            print(f"QA schema not found: {self.qa_schema_path}")
            sys.exit(1)
        except json.JSONDecodeError:
            print(f"Invalid JSON in QA schema: {self.qa_schema_path}")
            sys.exit(1)
    
    def validate_output(self, output_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate output against quality metrics and gates"""
        
        validation_results = {
            "overall_status": "pass",
            "quality_scores": {},
            "gate_results": [],
            "recommendations": [],
            "falcon_triggers": []
        }
        
        # Phase 1 Quality Metrics
        phase1_results = self._validate_phase1(output_data.get("phases", {}).get("phase1", {}))
        validation_results["quality_scores"]["phase1"] = phase1_results
        
        # Phase 2 Quality Metrics
        phase2_results = self._validate_phase2(output_data.get("phases", {}).get("phase2", {}))
        validation_results["quality_scores"]["phase2"] = phase2_results
        
        # Phase 3 Quality Metrics
        phase3_results = self._validate_phase3(output_data.get("phases", {}).get("phase3", {}))
        validation_results["quality_scores"]["phase3"] = phase3_results
        
        # Overall Quality Assessment
        overall_results = self._validate_overall(output_data)
        validation_results["quality_scores"]["overall"] = overall_results
        
        # Quality Gates Evaluation
        gate_results = self._evaluate_quality_gates(output_data)
        validation_results["gate_results"] = gate_results
        
        # Determine overall status
        failed_gates = [g for g in gate_results if g["status"] == "fail"]
        if failed_gates:
            validation_results["overall_status"] = "fail"
        elif any(g["status"] == "warn" for g in gate_results):
            validation_results["overall_status"] = "warn"
        
        # Generate recommendations
        validation_results["recommendations"] = self._generate_recommendations(validation_results)
        
        # Collect Falcon triggers
        validation_results["falcon_triggers"] = self._collect_falcon_triggers(output_data)
        
        return validation_results
    
    def _validate_phase1(self, phase1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate Phase 1 academic discovery results"""
        metrics = self.quality_metrics.get("phase1_metrics", {})
        
        results = {
            "literature_confidence": {
                "value": phase1_data.get("academic_context", {}).get("literature_confidence", 0),
                "threshold": metrics.get("literature_confidence_threshold", 0.6),
                "status": "pass"
            },
            "related_fields_count": {
                "value": len(phase1_data.get("academic_context", {}).get("related_fields", [])),
                "threshold": metrics.get("minimum_related_fields", 2),
                "status": "pass"
            },
            "key_concepts_count": {
                "value": len(phase1_data.get("academic_context", {}).get("key_concepts", [])),
                "threshold": metrics.get("minimum_key_concepts", 3),
                "status": "pass"
            }
        }
        
        # Check thresholds
        for metric_name, metric_data in results.items():
            if metric_data["value"] < metric_data["threshold"]:
                metric_data["status"] = "fail"
        
        return results
    
    def _validate_phase2(self, phase2_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate Phase 2 technical feasibility results"""
        metrics = self.quality_metrics.get("phase2_metrics", {})
        
        results = {
            "feasibility_score": {
                "value": phase2_data.get("feasibility_assessment", {}).get("feasibility_score", 0),
                "threshold": metrics.get("feasibility_score_threshold", 0.5),
                "status": "pass"
            },
            "assessment_completeness": {
                "value": self._check_assessment_completeness(phase2_data),
                "threshold": 1.0,
                "status": "pass"
            }
        }
        
        # Check thresholds
        for metric_name, metric_data in results.items():
            if metric_data["value"] < metric_data["threshold"]:
                metric_data["status"] = "fail"
        
        return results
    
    def _validate_phase3(self, phase3_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate Phase 3 contradiction analysis results"""
        metrics = self.quality_metrics.get("phase3_metrics", {})
        
        contradiction_count = (
            len(phase3_data.get("contradiction_analysis", {}).get("internal_contradictions", [])) +
            len(phase3_data.get("contradiction_analysis", {}).get("external_contradictions", []))
        )
        
        results = {
            "logical_consistency": {
                "value": phase3_data.get("contradiction_analysis", {}).get("logical_consistency", 0),
                "threshold": metrics.get("logical_consistency_threshold", 0.7),
                "status": "pass"
            },
            "contradiction_count": {
                "value": contradiction_count,
                "threshold": metrics.get("max_acceptable_contradictions", 2),
                "status": "pass"
            }
        }
        
        # Check thresholds (note: contradiction count should be BELOW threshold)
        if results["logical_consistency"]["value"] < results["logical_consistency"]["threshold"]:
            results["logical_consistency"]["status"] = "fail"
        
        if results["contradiction_count"]["value"] > results["contradiction_count"]["threshold"]:
            results["contradiction_count"]["status"] = "fail"
        
        return results
    
    def _validate_overall(self, output_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate overall output quality"""
        metrics = self.quality_metrics.get("overall_metrics", {})
        
        results = {
            "confidence_score": {
                "value": output_data.get("summary", {}).get("confidence_score", 0),
                "threshold": metrics.get("minimum_confidence_for_verification", 0.75),
                "status": "pass"
            },
            "completeness": {
                "value": self._check_output_completeness(output_data),
                "threshold": 1.0,
                "status": "pass"
            }
        }
        
        # Check thresholds
        for metric_name, metric_data in results.items():
            if metric_data["value"] < metric_data["threshold"]:
                metric_data["status"] = "fail"
        
        return results
    
    def _evaluate_quality_gates(self, output_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Evaluate quality gates against output data"""
        gate_results = []
        
        for gate in self.quality_gates:
            gate_name = gate.get("gate_name", "unknown")
            condition = gate.get("condition", "")
            expected_action = gate.get("action", "pass")
            
            # Evaluate condition (simplified evaluation)
            status = self._evaluate_gate_condition(condition, output_data)
            
            gate_results.append({
                "gate_name": gate_name,
                "condition": condition,
                "expected_action": expected_action,
                "status": status,
                "passed": status == expected_action or status == "pass"
            })
        
        return gate_results
    
    def _evaluate_gate_condition(self, condition: str, output_data: Dict[str, Any]) -> str:
        """Evaluate a gate condition against output data"""
        # Simplified condition evaluation
        # In production, this would be more sophisticated
        
        try:
            if "literature_confidence >= 0.6" in condition:
                lit_conf = output_data.get("phases", {}).get("phase1", {}).get("academic_context", {}).get("literature_confidence", 0)
                return "pass" if lit_conf >= 0.6 else "fail"
            
            elif "feasibility_score >= 0.5" in condition:
                feas_score = output_data.get("phases", {}).get("phase2", {}).get("feasibility_assessment", {}).get("feasibility_score", 0)
                return "pass" if feas_score >= 0.5 else "fail"
            
            elif "logical_consistency >= 0.7" in condition:
                logic_score = output_data.get("phases", {}).get("phase3", {}).get("contradiction_analysis", {}).get("logical_consistency", 0)
                return "pass" if logic_score >= 0.7 else "fail"
            
            else:
                return "warn"  # Unknown condition
                
        except Exception:
            return "fail"
    
    def _check_assessment_completeness(self, phase2_data: Dict[str, Any]) -> float:
        """Check completeness of Phase 2 assessment"""
        required_fields = ["technical_complexity", "resource_requirements", "implementation_barriers", "feasibility_score"]
        assessment = phase2_data.get("feasibility_assessment", {})
        
        present_fields = sum(1 for field in required_fields if field in assessment and assessment[field])
        return present_fields / len(required_fields)
    
    def _check_output_completeness(self, output_data: Dict[str, Any]) -> float:
        """Check overall output completeness"""
        required_sections = ["insight_id", "processing_timestamp", "phases", "summary"]
        present_sections = sum(1 for section in required_sections if section in output_data)
        
        # Check phases completeness
        phases = output_data.get("phases", {})
        required_phases = ["phase1", "phase2", "phase3"]
        present_phases = sum(1 for phase in required_phases if phase in phases)
        
        section_score = present_sections / len(required_sections)
        phase_score = present_phases / len(required_phases)
        
        return (section_score + phase_score) / 2
    
    def _generate_recommendations(self, validation_results: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on validation results"""
        recommendations = []
        
        # Check for failed quality scores
        for phase, scores in validation_results["quality_scores"].items():
            for metric, data in scores.items():
                if data.get("status") == "fail":
                    recommendations.append(f"Improve {phase} {metric}: current {data['value']:.3f}, required {data['threshold']:.3f}")
        
        # Check for failed gates
        failed_gates = [g for g in validation_results["gate_results"] if not g["passed"]]
        for gate in failed_gates:
            recommendations.append(f"Quality gate failed: {gate['gate_name']} - {gate['condition']}")
        
        # General recommendations
        if validation_results["overall_status"] == "fail":
            recommendations.append("Consider triggering Falcon deep research for comprehensive analysis")
        
        return recommendations
    
    def _collect_falcon_triggers(self, output_data: Dict[str, Any]) -> List[str]:
        """Collect all Falcon trigger reasons"""
        triggers = []
        
        phases = output_data.get("phases", {})
        for phase_name, phase_data in phases.items():
            if phase_data.get("falcon_trigger", False):
                triggers.append(f"{phase_name}_trigger")
        
        return triggers

def main():
    """Main function for running QA metrics on output file"""
    if len(sys.argv) != 2:
        print("Usage: python qa/metrics.py <output_file.json>")
        sys.exit(1)
    
    output_file = sys.argv[1]
    
    try:
        with open(output_file, 'r') as f:
            output_data = json.load(f)
    except FileNotFoundError:
        print(f"Output file not found: {output_file}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Invalid JSON in output file: {output_file}")
        sys.exit(1)
    
    # Initialize QA metrics
    qa_metrics = QualityMetrics()
    
    # Validate output
    validation_results = qa_metrics.validate_output(output_data)
    
    # Print results
    print("=== DeepAgent MVP Quality Assessment ===")
    print(f"Overall Status: {validation_results['overall_status'].upper()}")
    print()
    
    print("Quality Scores:")
    for phase, scores in validation_results["quality_scores"].items():
        print(f"  {phase.upper()}:")
        for metric, data in scores.items():
            status_symbol = "✓" if data["status"] == "pass" else "✗"
            print(f"    {status_symbol} {metric}: {data['value']:.3f} (threshold: {data['threshold']:.3f})")
    print()
    
    print("Quality Gates:")
    for gate in validation_results["gate_results"]:
        status_symbol = "✓" if gate["passed"] else "✗"
        print(f"  {status_symbol} {gate['gate_name']}: {gate['status']}")
    print()
    
    if validation_results["recommendations"]:
        print("Recommendations:")
        for rec in validation_results["recommendations"]:
            print(f"  • {rec}")
        print()
    
    if validation_results["falcon_triggers"]:
        print("Falcon Triggers:")
        for trigger in validation_results["falcon_triggers"]:
            print(f"  • {trigger}")
        print()
    
    # Save detailed results
    results_file = output_file.replace('.json', '_qa_results.json')
    with open(results_file, 'w') as f:
        json.dump(validation_results, f, indent=2)
    
    print(f"Detailed QA results saved to: {results_file}")

if __name__ == "__main__":
    main()
