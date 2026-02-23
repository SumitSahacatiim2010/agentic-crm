import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lead } from "@/lib/lead-mock-data";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface ScoreSheetProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScoreSheet({ lead, open, onOpenChange }: ScoreSheetProps) {
  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-slate-950 border-l border-slate-800 text-slate-100 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-slate-100 flex items-center gap-2">
            AI Score Analysis
            <Badge variant="outline" className="ml-2 border-indigo-500 text-indigo-400">
              {lead.totalScore}/100
            </Badge>
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            Propensity model breakdown for {lead.name}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Score Summary */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-300">Conversion Probability</span>
              <span className="text-xl font-bold text-emerald-400">{lead.probability}%</span>
            </div>
            <Progress value={lead.probability} className="h-2 bg-slate-800" indicatorClassName="bg-emerald-500" />
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Demographic: {lead.demographicScore}/100</span>
              <span>Behavioral: {lead.behavioralScore}/100</span>
            </div>
          </div>

          {/* Explainability Factors */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Scoring Factors</h3>
            <div className="space-y-3">
              {lead.scoreBreakdown.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded bg-slate-900/50 border border-slate-800">
                  {factor.type === 'Positive' ? (
                    <TrendingUp className="h-5 w-5 text-emerald-400 mt-0.5" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-rose-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm text-slate-200 font-medium">{factor.factor}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Impact: <span className={factor.type === 'Positive' ? 'text-emerald-400' : 'text-rose-400'}>
                        {factor.points > 0 ? '+' : ''}{factor.points} points
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-blue-100">AI Recommendation</h4>
            </div>
            <p className="text-sm text-blue-200/80">
              {lead.totalScore > 80
                ? "High Priority: Contact immediately. Interest in Wealth products is strongly indicated."
                : lead.totalScore > 50
                  ? "Nurture: Send 'Market Insights' campaign to build trust before direct outreach."
                  : "Low Priority: Monitor for future behavioral signals."}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
