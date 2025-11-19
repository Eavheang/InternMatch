"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Search, Download, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { ResumeData } from "../types";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ATSScoreProps {
  resumeData: ResumeData;
  onUpdateResume?: (data: ResumeData) => void;
}

// Detailed mock analysis result structure
interface AnalysisResult {
  score: number;
  status: "Excellent" | "Good" | "Needs Improvement" | "Poor";
  summary: string;
  breakdown: {
    keywords: number;
    format: number;
    content: number;
    structure: number;
  };
  missingKeywords: string[];
  suggestions: string[];
}

export function ATSScore({ resumeData, onUpdateResume }: ATSScoreProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Check if resume has any meaningful content
  const hasContent = () => {
    // Check personal info
    const hasPersonalInfo = !!(
      resumeData.personalInfo?.fullName?.trim() ||
      resumeData.personalInfo?.email?.trim() ||
      resumeData.personalInfo?.phone?.trim()
    );

    // Check summary
    const hasSummary = !!(resumeData.summary?.trim());

    // Check education
    const hasEducation = resumeData.education?.some(
      (edu) => edu.school?.trim() || edu.degree?.trim()
    );

    // Check experience
    const hasExperience = resumeData.experience?.some(
      (exp) => exp.company?.trim() || exp.role?.trim()
    );

    // Check skills
    const hasSkills = resumeData.skills?.length > 0;

    return hasPersonalInfo || hasSummary || hasEducation || hasExperience || hasSkills;
  };

  const canAnalyze = hasContent();

  const analyze = async () => {
    setIsAnalyzing(true);
    
    try {
      const token = localStorage.getItem("internmatch_token");
      // Token check commented out as per previous context to allow loose dev testing if needed
      // if (!token) { ... }

      const response = await fetch("/api/ai/resume/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeData: resumeData
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      const data = await response.json();
      const analysis = data.data;

      setResult({
        score: analysis.atsScore || 0,
        status: analysis.atsScore >= 90 ? "Excellent" : analysis.atsScore >= 70 ? "Good" : analysis.atsScore >= 50 ? "Needs Improvement" : "Poor",
        summary: analysis.summary || (analysis.atsScore >= 70 ? "Your resume is well-optimized for ATS systems." : "Your resume needs optimization for ATS systems."),
        breakdown: {
          keywords: analysis.keywordMatch || 0,
          format: 95,
          content: analysis.readability || 0,
          structure: analysis.structureScore || 85
        },
        missingKeywords: analysis.missingKeywords || [],
        suggestions: analysis.suggestions ? analysis.suggestions.map((s: any) => s.advice) : []
      });

      toast.success("Resume analysis complete!");

    } catch (error) {
      console.error("ATS Analysis error:", error);
      toast.error("Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const improveWithAI = async () => {
    if (!result || !onUpdateResume) {
      toast.error("Please analyze your resume first.");
      return;
    }

    setIsImproving(true);
    try {
      const token = localStorage.getItem("internmatch_token");
      
      const response = await fetch("/api/ai/resume/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeData: resumeData,
          suggestions: result.suggestions
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to improve resume");
      }

      const data = await response.json();
      if (data.data) {
        onUpdateResume(data.data);
        toast.success("Resume improved! Changes have been applied. You can re-analyze to see the updated score.");
        // Clear current result so user can see they need to re-analyze
        setResult(null);
      }
    } catch (error) {
      console.error("AI Improvement error:", error);
      toast.error("Failed to improve resume.");
    } finally {
      setIsImproving(false);
    }
  };

  const downloadPDF = async () => {
    const element = document.querySelector(".resume-preview-container") as HTMLElement;
    if (!element) {
      toast.error("Could not find resume preview to download.");
      return;
    }

    setIsDownloading(true);
    try {
      // Create a clone of the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.transform = "scale(1)";
      clone.style.width = "210mm";
      document.body.appendChild(clone);

      // Wait a bit for the clone to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fix color issues before rendering - convert any lab/lch colors to rgb
      const allElements = clone.querySelectorAll("*");
      allElements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlEl);
        
        // Check and fix color
        try {
          const color = computedStyle.color;
          if (color && (color.includes('lab') || color.includes('lch') || color.includes('oklab'))) {
            htmlEl.style.color = "#000000";
          }
        } catch (e) {
          // Ignore errors
        }
        
        // Check and fix backgroundColor
        try {
          const bgColor = computedStyle.backgroundColor;
          if (bgColor && (bgColor.includes('lab') || bgColor.includes('lch') || bgColor.includes('oklab'))) {
            htmlEl.style.backgroundColor = htmlEl === clone ? "#ffffff" : "transparent";
          }
        } catch (e) {
          // Ignore errors
        }
        
        // Check and fix borderColor
        try {
          const borderColor = computedStyle.borderColor;
          if (borderColor && (borderColor.includes('lab') || borderColor.includes('lch') || borderColor.includes('oklab'))) {
            htmlEl.style.borderColor = "#e5e7eb";
          }
        } catch (e) {
          // Ignore errors
        }
      });

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: false,
        foreignObjectRendering: false
      });
      
      // Remove the clone
      document.body.removeChild(clone);
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = resumeData.personalInfo.fullName 
        ? `${resumeData.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`
        : "resume.pdf";
      
      pdf.save(fileName);
      toast.success("Resume downloaded!");
    } catch (error) {
      console.error("PDF Download error:", error);
      toast.error("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">ATS Score Analysis</h2>
          <p className="text-sm text-zinc-500 mt-1">Optimize your resume for Applicant Tracking Systems</p>
        </div>
      </div>
      
      {/* Main Score Card */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/30 border border-purple-200/50 rounded-2xl p-10 text-center shadow-lg shadow-purple-500/5">
        {/* Score Circle */}
        <div className="relative w-40 h-40 mx-auto mb-6">
           {/* Using Recharts for the donut chart effect or just CSS */}
           {result ? (
             <div className="relative w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{ value: result.score }, { value: 100 - result.score }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      <Cell fill={result.score >= 70 ? "#22c55e" : "#ef4444"} />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn(
                    "text-4xl font-bold",
                    result.score >= 70 ? "text-green-600" : "text-red-600"
                  )}>
                    {result.score}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium uppercase mt-1">ATS Score</span>
                </div>
             </div>
           ) : (
             <div className="w-full h-full rounded-full border-8 border-zinc-200 flex items-center justify-center bg-white">
                <span className="text-4xl font-bold text-zinc-300">?</span>
             </div>
           )}
        </div>

        {/* Status Text */}
        <h3 className="text-xl font-semibold text-zinc-900 mb-2">
          {result ? result.status : "Not Analyzed Yet"}
        </h3>
        <p className="text-zinc-600 max-w-lg mx-auto">
          {result 
            ? result.summary 
            : !canAnalyze
            ? "Please add some content to your resume (personal info, summary, education, experience, or skills) before analyzing."
            : "Run an analysis to see how well your resume parses for Applicant Tracking Systems and get personalized improvement suggestions."}
        </p>
      </div>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard 
          label="Keywords" 
          value={result?.breakdown.keywords || 0} 
          isLoading={isAnalyzing} 
        />
        <MetricCard 
          label="Format" 
          value={result?.breakdown.format || 0} 
          isLoading={isAnalyzing} 
        />
        <MetricCard 
          label="Content" 
          value={result?.breakdown.content || 0} 
          isLoading={isAnalyzing} 
        />
        <MetricCard 
          label="Structure" 
          value={result?.breakdown.structure || 0} 
          isLoading={isAnalyzing} 
        />
      </div>

      {/* Suggestions */}
      <div className="bg-white border rounded-xl p-6">
        <h4 className="font-semibold flex items-center gap-2 mb-4 text-zinc-900">
          <span className="text-yellow-500">💡</span> Suggestions for Improvement
        </h4>
        
        {result && result.suggestions.length > 0 ? (
          <ul className="space-y-3">
            {result.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-3 text-zinc-600 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                {suggestion}
              </li>
            ))}
          </ul>
        ) : result ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
             <CheckCircle2 className="w-4 h-4" />
             Great job! No critical issues found.
          </div>
        ) : (
          <p className="text-sm text-zinc-500 italic">
            Analysis results will appear here...
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
        <Button 
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={analyze}
          disabled={isAnalyzing || isImproving || !canAnalyze}
          title={!canAnalyze ? "Please add some content to your resume before analyzing" : undefined}
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {result ? "Re-Analyze Resume" : "Analyze Resume"}
        </Button>
        
        <Button 
          size="lg"
          variant="outline"
          className="border-purple-200 text-purple-700 hover:bg-purple-50 gap-2"
          onClick={improveWithAI}
          disabled={isImproving || !result || result.suggestions.length === 0}
        >
           {isImproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
           Improve with AI
        </Button>

        <Button 
          size="lg"
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
          onClick={downloadPDF}
          disabled={isDownloading}
        >
           {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
           Download Resume
        </Button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, isLoading }: { label: string; value: number; isLoading: boolean }) {
  return (
    <div className="bg-white border rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className={cn(
          "font-bold",
          value >= 80 ? "text-green-600" : value >= 50 ? "text-yellow-600" : "text-red-600"
        )}>
          {isLoading ? "..." : `${value}%`}
        </span>
      </div>
      <Progress value={isLoading ? 0 : value} className="h-2" />
    </div>
  );
}
