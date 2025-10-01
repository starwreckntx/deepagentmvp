
#!/usr/bin/env python3
"""
Falcon Integration Interface
Handles handoff and communication with the Falcon deep research system.
"""

import json
import uuid
import asyncio
import aiohttp
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from pathlib import Path

class FalconInterface:
    """Interface for communicating with Falcon deep research system"""
    
    def __init__(self, 
                 falcon_endpoint: str,
                 auth_token: str = None,
                 timeout: int = 300,
                 max_retries: int = 3):
        self.falcon_endpoint = falcon_endpoint.rstrip('/')
        self.auth_token = auth_token
        self.timeout = timeout
        self.max_retries = max_retries
        self.logger = self._setup_logger()
        
        # Handoff tracking
        self.active_handoffs = {}
        self.handoff_history = []
    
    def _setup_logger(self) -> logging.Logger:
        """Setup logging for Falcon interface"""
        logger = logging.getLogger('falcon_interface')
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    def should_trigger_falcon(self, mvp_result: Dict[str, Any]) -> bool:
        """Determine if Falcon research should be triggered"""
        
        # Check explicit Falcon triggers from each phase
        phases = mvp_result.get('phases', {})
        
        falcon_triggers = [
            phases.get('phase1', {}).get('falcon_trigger', False),
            phases.get('phase2', {}).get('falcon_trigger', False),
            phases.get('phase3', {}).get('falcon_trigger', False)
        ]
        
        if any(falcon_triggers):
            return True
        
        # Check summary-level indicators
        summary = mvp_result.get('summary', {})
        
        # Low confidence score
        if summary.get('confidence_score', 1.0) < 0.6:
            return True
        
        # Verification status indicates concerns
        verification_status = summary.get('verification_status', '')
        if verification_status in ['significant_concerns', 'requires_review']:
            return True
        
        return False
    
    def prepare_handoff_package(self, 
                               insight_data: Dict[str, Any], 
                               mvp_result: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare data package for Falcon handoff"""
        
        handoff_id = str(uuid.uuid4())
        
        # Determine trigger reasons
        trigger_reasons = self._identify_trigger_reasons(mvp_result)
        
        # Assess priority and complexity
        priority = self._assess_priority(insight_data, mvp_result)
        complexity = self._assess_complexity(insight_data, mvp_result)
        
        # Determine research requirements
        falcon_requirements = self._determine_falcon_requirements(
            insight_data, mvp_result, trigger_reasons
        )
        
        handoff_package = {
            "handoff_metadata": {
                "handoff_id": handoff_id,
                "timestamp": datetime.now().isoformat(),
                "mvp_version": "1.0.0",
                "trigger_reasons": trigger_reasons,
                "priority": priority,
                "estimated_complexity": complexity
            },
            "original_insight": insight_data,
            "mvp_analysis": mvp_result,
            "falcon_requirements": falcon_requirements
        }
        
        return handoff_package
    
    def _identify_trigger_reasons(self, mvp_result: Dict[str, Any]) -> List[str]:
        """Identify specific reasons for Falcon trigger"""
        
        reasons = []
        phases = mvp_result.get('phases', {})
        
        # Phase 1 triggers
        phase1 = phases.get('phase1', {})
        if phase1.get('falcon_trigger', False):
            academic_context = phase1.get('academic_context', {})
            if academic_context.get('literature_confidence', 1.0) < 0.6:
                reasons.append('phase1_low_literature_confidence')
            
            # Check for breakthrough terminology
            insight_content = mvp_result.get('original_insight', {}).get('content', '')
            if any(term in insight_content.lower() for term in ['breakthrough', 'revolutionary', 'novel']):
                reasons.append('phase1_breakthrough_terminology')
        
        # Phase 2 triggers
        phase2 = phases.get('phase2', {})
        if phase2.get('falcon_trigger', False):
            feasibility = phase2.get('feasibility_assessment', {})
            if feasibility.get('feasibility_score', 1.0) < 0.5:
                reasons.append('phase2_low_feasibility')
            if feasibility.get('technical_complexity') == 'high':
                reasons.append('phase2_high_complexity')
        
        # Phase 3 triggers
        phase3 = phases.get('phase3', {})
        if phase3.get('falcon_trigger', False):
            contradiction_analysis = phase3.get('contradiction_analysis', {})
            if contradiction_analysis.get('logical_consistency', 1.0) < 0.7:
                reasons.append('phase3_logical_inconsistency')
            
            evidence_conflicts = contradiction_analysis.get('evidence_conflicts', [])
            if len(evidence_conflicts) > 2:
                reasons.append('phase3_multiple_evidence_conflicts')
        
        return reasons or ['general_quality_concerns']
    
    def _assess_priority(self, insight_data: Dict[str, Any], mvp_result: Dict[str, Any]) -> str:
        """Assess priority level for Falcon processing"""
        
        # Check metadata priority
        metadata_priority = insight_data.get('metadata', {}).get('priority', 'medium')
        
        # Check verification status
        verification_status = mvp_result.get('summary', {}).get('verification_status', '')
        
        # Check confidence score
        confidence_score = mvp_result.get('summary', {}).get('confidence_score', 0.5)
        
        # Priority escalation logic
        if metadata_priority == 'critical':
            return 'critical'
        elif verification_status == 'significant_concerns':
            return 'high'
        elif confidence_score < 0.4:
            return 'high'
        elif metadata_priority == 'high':
            return 'high'
        elif confidence_score < 0.6:
            return 'medium'
        else:
            return 'low'
    
    def _assess_complexity(self, insight_data: Dict[str, Any], mvp_result: Dict[str, Any]) -> str:
        """Assess complexity level for Falcon processing"""
        
        # Check technical complexity from Phase 2
        phases = mvp_result.get('phases', {})
        phase2 = phases.get('phase2', {})
        technical_complexity = phase2.get('feasibility_assessment', {}).get('technical_complexity', 'medium')
        
        # Check number of academic fields involved
        phase1 = phases.get('phase1', {})
        related_fields = phase1.get('academic_context', {}).get('related_fields', [])
        
        # Check trigger reasons count
        trigger_reasons = self._identify_trigger_reasons(mvp_result)
        
        # Complexity assessment logic
        if technical_complexity == 'high' and len(related_fields) > 3:
            return 'extreme'
        elif technical_complexity == 'high' or len(related_fields) > 2:
            return 'high'
        elif len(trigger_reasons) > 2:
            return 'high'
        elif technical_complexity == 'medium':
            return 'medium'
        else:
            return 'low'
    
    def _determine_falcon_requirements(self, 
                                     insight_data: Dict[str, Any], 
                                     mvp_result: Dict[str, Any],
                                     trigger_reasons: List[str]) -> Dict[str, Any]:
        """Determine specific requirements for Falcon research"""
        
        # Base requirements
        requirements = {
            "research_depth": "comprehensive",
            "verification_level": "rigorous",
            "timeline": "48_hours"
        }
        
        # Extract domains from Phase 1
        phases = mvp_result.get('phases', {})
        phase1 = phases.get('phase1', {})
        related_fields = phase1.get('academic_context', {}).get('related_fields', [])
        requirements["domains"] = related_fields
        
        # Adjust based on trigger reasons
        if 'phase1_low_literature_confidence' in trigger_reasons:
            requirements["research_depth"] = "exhaustive"
            requirements["verification_level"] = "peer_review_equivalent"
        
        if 'phase3_logical_inconsistency' in trigger_reasons:
            requirements["verification_level"] = "peer_review_equivalent"
            requirements["timeline"] = "72_hours"
        
        if 'phase2_high_complexity' in trigger_reasons:
            requirements["timeline"] = "96_hours"
        
        # Adjust based on priority
        priority = self._assess_priority(insight_data, mvp_result)
        if priority == 'critical':
            requirements["timeline"] = "24_hours"
        elif priority == 'low':
            requirements["timeline"] = "168_hours"  # 1 week
        
        return requirements
    
    async def submit_handoff(self, handoff_package: Dict[str, Any]) -> str:
        """Submit handoff package to Falcon system"""
        
        handoff_id = handoff_package["handoff_metadata"]["handoff_id"]
        
        self.logger.info(f"Submitting handoff {handoff_id} to Falcon")
        
        headers = {
            "Content-Type": "application/json",
            "X-Handoff-ID": handoff_id
        }
        
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.falcon_endpoint}/deep_research",
                    json=handoff_package,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=self.timeout)
                ) as response:
                    
                    if response.status == 202:  # Accepted
                        response_data = await response.json()
                        
                        # Track handoff
                        self.active_handoffs[handoff_id] = {
                            "status": "submitted",
                            "timestamp": datetime.now(),
                            "package": handoff_package
                        }
                        
                        self.logger.info(f"Handoff {handoff_id} successfully submitted")
                        return handoff_id
                    
                    else:
                        error_text = await response.text()
                        raise FalconSubmissionError(
                            f"Falcon submission failed with status {response.status}: {error_text}"
                        )
        
        except asyncio.TimeoutError:
            self.logger.error(f"Timeout submitting handoff {handoff_id}")
            raise FalconTimeoutError(f"Timeout submitting handoff {handoff_id}")
        
        except aiohttp.ClientError as e:
            self.logger.error(f"Client error submitting handoff {handoff_id}: {e}")
            raise FalconConnectionError(f"Connection error: {e}")
    
    async def check_handoff_status(self, handoff_id: str) -> Dict[str, Any]:
        """Check status of Falcon handoff"""
        
        headers = {}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.falcon_endpoint}/status/{handoff_id}",
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status == 200:
                        status_data = await response.json()
                        
                        # Update local tracking
                        if handoff_id in self.active_handoffs:
                            self.active_handoffs[handoff_id]["status"] = status_data.get("processing_status")
                            self.active_handoffs[handoff_id]["last_check"] = datetime.now()
                        
                        return status_data
                    
                    elif response.status == 404:
                        return {"processing_status": "not_found"}
                    
                    else:
                        error_text = await response.text()
                        raise FalconStatusError(f"Status check failed: {error_text}")
        
        except asyncio.TimeoutError:
            return {"processing_status": "timeout", "error": "Status check timeout"}
        
        except aiohttp.ClientError as e:
            return {"processing_status": "error", "error": str(e)}
    
    async def retrieve_falcon_result(self, handoff_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve completed Falcon analysis result"""
        
        headers = {}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.falcon_endpoint}/result/{handoff_id}",
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    
                    if response.status == 200:
                        result_data = await response.json()
                        
                        # Move from active to history
                        if handoff_id in self.active_handoffs:
                            handoff_info = self.active_handoffs.pop(handoff_id)
                            handoff_info["completed"] = datetime.now()
                            handoff_info["result"] = result_data
                            self.handoff_history.append(handoff_info)
                        
                        self.logger.info(f"Retrieved Falcon result for handoff {handoff_id}")
                        return result_data
                    
                    elif response.status == 404:
                        self.logger.warning(f"Falcon result not found for handoff {handoff_id}")
                        return None
                    
                    else:
                        error_text = await response.text()
                        raise FalconResultError(f"Result retrieval failed: {error_text}")
        
        except asyncio.TimeoutError:
            self.logger.error(f"Timeout retrieving Falcon result for {handoff_id}")
            return None
        
        except aiohttp.ClientError as e:
            self.logger.error(f"Error retrieving Falcon result for {handoff_id}: {e}")
            return None
    
    def merge_results(self, mvp_result: Dict[str, Any], falcon_result: Dict[str, Any]) -> Dict[str, Any]:
        """Merge MVP and Falcon results into comprehensive analysis"""
        
        # Start with MVP result as base
        merged_result = mvp_result.copy()
        
        # Add Falcon analysis
        merged_result["falcon_analysis"] = falcon_result.get("falcon_analysis", {})
        
        # Update summary with Falcon findings
        falcon_verification = falcon_result.get("falcon_analysis", {}).get("enhanced_verification", {})
        
        if falcon_verification:
            # Use Falcon's verification status if available
            falcon_status = falcon_verification.get("verification_status")
            if falcon_status:
                merged_result["summary"]["verification_status"] = self._map_falcon_status(falcon_status)
            
            # Use higher confidence score
            falcon_confidence = falcon_verification.get("confidence_score")
            if falcon_confidence:
                mvp_confidence = merged_result["summary"].get("confidence_score", 0)
                merged_result["summary"]["confidence_score"] = max(mvp_confidence, falcon_confidence)
            
            # Add Falcon recommendation
            falcon_recommendation = falcon_verification.get("recommendation")
            if falcon_recommendation:
                merged_result["summary"]["falcon_recommendation"] = falcon_recommendation
        
        # Add processing metadata
        merged_result["falcon_metadata"] = {
            "handoff_completed": True,
            "processing_time": falcon_result.get("processing_metadata", {}).get("processing_duration"),
            "falcon_version": falcon_result.get("processing_metadata", {}).get("falcon_version"),
            "merge_timestamp": datetime.now().isoformat()
        }
        
        return merged_result
    
    def _map_falcon_status(self, falcon_status: str) -> str:
        """Map Falcon verification status to MVP status format"""
        
        status_mapping = {
            "verified": "verified",
            "conditionally_verified": "requires_review",
            "unverified": "significant_concerns",
            "contradicted": "rejected"
        }
        
        return status_mapping.get(falcon_status, "requires_review")
    
    async def health_check(self) -> Dict[str, Any]:
        """Check Falcon system health"""
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.falcon_endpoint}/health",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    
                    if response.status == 200:
                        health_data = await response.json()
                        return {
                            "status": "healthy",
                            "falcon_status": health_data,
                            "timestamp": datetime.now().isoformat()
                        }
                    else:
                        return {
                            "status": "unhealthy",
                            "error": f"HTTP {response.status}",
                            "timestamp": datetime.now().isoformat()
                        }
        
        except Exception as e:
            return {
                "status": "unreachable",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def get_handoff_statistics(self) -> Dict[str, Any]:
        """Get statistics about handoffs"""
        
        total_handoffs = len(self.active_handoffs) + len(self.handoff_history)
        completed_handoffs = len(self.handoff_history)
        active_handoffs = len(self.active_handoffs)
        
        # Calculate success rate
        successful_handoffs = sum(
            1 for h in self.handoff_history 
            if h.get("result", {}).get("processing_status") == "completed"
        )
        
        success_rate = successful_handoffs / max(completed_handoffs, 1)
        
        # Calculate average processing time
        processing_times = [
            h.get("result", {}).get("processing_metadata", {}).get("processing_duration", 0)
            for h in self.handoff_history
            if h.get("result", {}).get("processing_metadata", {}).get("processing_duration")
        ]
        
        avg_processing_time = sum(processing_times) / max(len(processing_times), 1)
        
        return {
            "total_handoffs": total_handoffs,
            "completed_handoffs": completed_handoffs,
            "active_handoffs": active_handoffs,
            "success_rate": success_rate,
            "average_processing_time": avg_processing_time,
            "timestamp": datetime.now().isoformat()
        }

# Custom exceptions
class FalconInterfaceError(Exception):
    """Base exception for Falcon interface errors"""
    pass

class FalconSubmissionError(FalconInterfaceError):
    """Error submitting handoff to Falcon"""
    pass

class FalconTimeoutError(FalconInterfaceError):
    """Timeout communicating with Falcon"""
    pass

class FalconConnectionError(FalconInterfaceError):
    """Connection error with Falcon"""
    pass

class FalconStatusError(FalconInterfaceError):
    """Error checking Falcon status"""
    pass

class FalconResultError(FalconInterfaceError):
    """Error retrieving Falcon result"""
    pass

# Example usage
async def main():
    """Example usage of Falcon interface"""
    
    # Initialize interface
    falcon = FalconInterface(
        falcon_endpoint="https://falcon.example.com/api/v1",
        auth_token="your-auth-token",
        timeout=300
    )
    
    # Check Falcon health
    health = await falcon.health_check()
    print(f"Falcon health: {health}")
    
    # Example insight and MVP result
    insight_data = {
        "id": "test_insight",
        "content": "Revolutionary quantum computing breakthrough...",
        "source": "research_paper",
        "timestamp": datetime.now().isoformat()
    }
    
    mvp_result = {
        "summary": {"confidence_score": 0.4, "falcon_required": True},
        "phases": {
            "phase1": {"falcon_trigger": True},
            "phase2": {"falcon_trigger": False},
            "phase3": {"falcon_trigger": True}
        }
    }
    
    # Check if Falcon should be triggered
    if falcon.should_trigger_falcon(mvp_result):
        # Prepare and submit handoff
        handoff_package = falcon.prepare_handoff_package(insight_data, mvp_result)
        handoff_id = await falcon.submit_handoff(handoff_package)
        
        print(f"Handoff submitted: {handoff_id}")
        
        # Monitor status
        while True:
            status = await falcon.check_handoff_status(handoff_id)
            print(f"Status: {status.get('processing_status')}")
            
            if status.get("processing_status") == "completed":
                # Retrieve result
                falcon_result = await falcon.retrieve_falcon_result(handoff_id)
                if falcon_result:
                    # Merge results
                    final_result = falcon.merge_results(mvp_result, falcon_result)
                    print(f"Final result: {final_result['summary']}")
                break
            
            elif status.get("processing_status") == "failed":
                print("Falcon processing failed")
                break
            
            # Wait before checking again
            await asyncio.sleep(30)

if __name__ == "__main__":
    asyncio.run(main())
