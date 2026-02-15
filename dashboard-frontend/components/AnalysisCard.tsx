import { LucideIcon } from 'lucide-react';

interface Analysis {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

interface AnalysisCardProps {
  analysis: Analysis;
  isSelected: boolean;
  isAnalyzing: boolean;
  onRun: () => void;
}

export default function AnalysisCard({
  analysis,
  isSelected,
  isAnalyzing,
  onRun,
}: AnalysisCardProps) {
  const Icon = analysis.icon;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
        isSelected
          ? 'border-blue-500 shadow-lg'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 ${analysis.color} rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 text-lg mb-1">
              {analysis.name}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {analysis.description}
            </p>
          </div>
        </div>

        <button
          onClick={onRun}
          disabled={isAnalyzing}
          className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
            isAnalyzing
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isAnalyzing && isSelected ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>
    </div>
  );
}
