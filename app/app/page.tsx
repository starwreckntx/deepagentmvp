
import { Brain, Shield, Zap } from 'lucide-react';
import { VerificationForm } from '@/components/verification-form';
import { RecentVerifications } from '@/components/recent-verifications';

export default function HomePage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            DeepAgent MVP
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Advanced AI governance verification protocol using a sophisticated 3-phase workflow 
          for academic discovery, technical feasibility assessment, and contradiction analysis.
        </p>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
          <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm border border-white/20">
            <Shield className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <h3 className="font-semibold text-sm">Academic Discovery</h3>
              <p className="text-xs text-muted-foreground">Literature mapping & research gaps</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm border border-white/20">
            <Zap className="w-6 h-6 text-indigo-600" />
            <div className="text-left">
              <h3 className="font-semibold text-sm">Technical Feasibility</h3>
              <p className="text-xs text-muted-foreground">Resource & complexity assessment</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm border border-white/20">
            <Brain className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <h3 className="font-semibold text-sm">Contradiction Analysis</h3>
              <p className="text-xs text-muted-foreground">Final verification & validation</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main verification form */}
        <div className="lg:col-span-2">
          <VerificationForm />
        </div>

        {/* Recent verifications sidebar */}
        <div className="lg:col-span-1">
          <RecentVerifications />
        </div>
      </div>
    </div>
  );
}
