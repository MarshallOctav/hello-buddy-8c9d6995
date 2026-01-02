import jsPDF from 'jspdf';

interface PDFReportData {
  testTitle: string;
  testCategory: string;
  score: number;
  level: string;
  date: string;
  dimensions: { subject: string; score: number }[];
  recommendations: { title: string; desc: string }[];
  executiveSummary: string;
  vitalPoint: string;
  methodology: {
    name: string;
    author: string;
    source: string;
    description: string;
  };
  language: 'en' | 'id';
}

export const generateResultPDF = (data: PDFReportData): void => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  const isId = data.language === 'id';

  // Helper functions
  const addTitle = (text: string, fontSize: number = 24) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59); // slate-800
    pdf.text(text, margin, y);
    y += fontSize * 0.5;
  };

  const addSubtitle = (text: string, fontSize: number = 12) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.text(text, margin, y);
    y += fontSize * 0.6;
  };

  const addSectionTitle = (text: string) => {
    y += 8;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(text, margin, y);
    y += 8;
  };

  const addParagraph = (text: string, maxWidth: number = contentWidth) => {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105); // slate-600
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, margin, y);
    y += lines.length * 5 + 4;
  };

  const addDivider = () => {
    y += 4;
    pdf.setDrawColor(226, 232, 240); // slate-200
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  const checkPageBreak = (neededSpace: number) => {
    if (y + neededSpace > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // Header with gradient-like background
  pdf.setFillColor(79, 70, 229); // indigo-600
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('DIAGNOSPACE', margin, 15);
  
  pdf.setFontSize(20);
  pdf.text(isId ? 'Laporan Diagnostik' : 'Diagnostic Report', margin, 30);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${data.testTitle} • ${data.date}`, margin, 40);
  
  y = 65;

  // Score Section
  pdf.setFillColor(248, 250, 252); // slate-50
  pdf.roundedRect(margin, y, contentWidth, 40, 3, 3, 'F');
  
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text(data.score.toString(), margin + 15, y + 28);
  
  pdf.setFontSize(14);
  pdf.setTextColor(100, 116, 139);
  pdf.text('/100', margin + 40, y + 28);
  
  // Level badge
  let levelColor: [number, number, number] = [239, 68, 68]; // red
  if (data.score > 40) levelColor = [245, 158, 11]; // yellow
  if (data.score > 70) levelColor = [34, 197, 94]; // green
  if (data.score > 90) levelColor = [59, 130, 246]; // blue
  
  pdf.setFillColor(...levelColor);
  pdf.roundedRect(margin + 80, y + 15, 50, 20, 3, 3, 'F');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text(data.level, margin + 85, y + 28);

  // Category
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);
  pdf.text(`${isId ? 'Kategori' : 'Category'}: ${data.testCategory}`, margin + 140, y + 28);

  y += 50;

  // Executive Summary
  addSectionTitle(isId ? '📋 Ringkasan Eksekutif' : '📋 Executive Summary');
  addParagraph(data.executiveSummary);

  // Vital Point
  checkPageBreak(40);
  addSectionTitle(isId ? '🎯 Poin Vital' : '🎯 Vital Point');
  pdf.setFillColor(255, 247, 237); // orange-50
  pdf.roundedRect(margin, y - 4, contentWidth, 25, 3, 3, 'F');
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(194, 65, 12); // orange-700
  const vitalLines = pdf.splitTextToSize(data.vitalPoint, contentWidth - 10);
  pdf.text(vitalLines, margin + 5, y + 5);
  y += 30;

  // Dimension Scores
  checkPageBreak(60);
  addSectionTitle(isId ? '📊 Analisis Dimensi' : '📊 Dimension Analysis');
  
  data.dimensions.forEach((dim, index) => {
    checkPageBreak(15);
    const barWidth = (dim.score / 100) * (contentWidth - 60);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(dim.subject, margin, y + 4);
    
    // Background bar
    pdf.setFillColor(226, 232, 240); // slate-200
    pdf.roundedRect(margin + 55, y, contentWidth - 75, 6, 2, 2, 'F');
    
    // Progress bar
    const barColor: [number, number, number] = dim.score > 70 ? [34, 197, 94] : dim.score > 40 ? [245, 158, 11] : [239, 68, 68];
    pdf.setFillColor(...barColor);
    pdf.roundedRect(margin + 55, y, barWidth, 6, 2, 2, 'F');
    
    // Score
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(`${dim.score}%`, pageWidth - margin - 15, y + 4);
    
    y += 12;
  });

  // Recommendations
  checkPageBreak(50);
  addDivider();
  addSectionTitle(isId ? '✅ Rekomendasi Strategis' : '✅ Strategic Recommendations');
  
  data.recommendations.forEach((rec, index) => {
    checkPageBreak(20);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(`${index + 1}. ${rec.title}`, margin, y);
    y += 5;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    const recLines = pdf.splitTextToSize(rec.desc, contentWidth - 10);
    pdf.text(recLines, margin + 5, y);
    y += recLines.length * 4 + 6;
  });

  // Methodology
  checkPageBreak(50);
  addDivider();
  addSectionTitle(isId ? '📚 Metodologi' : '📚 Methodology');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text(data.methodology.name, margin, y);
  y += 5;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(100, 116, 139);
  pdf.text(`${isId ? 'Oleh' : 'By'}: ${data.methodology.author}`, margin, y);
  y += 5;
  pdf.text(data.methodology.source, margin, y);
  y += 8;
  
  addParagraph(data.methodology.description);

  // Footer
  const footerY = pageHeight - 15;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(148, 163, 184); // slate-400
  pdf.text('Generated by Diagnospace • www.diagnospace.com', margin, footerY);
  pdf.text(new Date().toLocaleDateString(), pageWidth - margin - 30, footerY);

  // Save the PDF
  const fileName = `Diagnospace_${data.testTitle.replace(/\s+/g, '_')}_${data.date.replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
};

interface DashboardPDFData {
  userName: string;
  overallScore: number;
  archetype: string;
  archetypeDesc: string;
  categoryScores: { subject: string; score: number }[];
  strengths: { subject: string; score: number }[];
  weaknesses: { subject: string; score: number }[];
  language: 'en' | 'id';
}

export const generateDashboardPDF = (data: DashboardPDFData): void => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  const isId = data.language === 'id';

  // Header
  pdf.setFillColor(79, 70, 229);
  pdf.rect(0, 0, pageWidth, 55, 'F');
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('DIAGNOSPACE', margin, 15);
  
  pdf.setFontSize(20);
  pdf.text(isId ? 'Laporan Kesehatan Holistik' : 'Holistic Health Report', margin, 32);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.userName, margin, 45);
  
  y = 70;

  // Archetype
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text(data.archetype, margin, y);
  y += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  const archLines = pdf.splitTextToSize(data.archetypeDesc, contentWidth);
  pdf.text(archLines, margin, y);
  y += archLines.length * 5 + 10;

  // Overall Score
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 116, 139);
  pdf.text(isId ? 'Indeks Kesehatan' : 'Health Index', margin + 10, y + 15);
  
  pdf.setFontSize(32);
  pdf.setTextColor(79, 70, 229);
  pdf.text(`${data.overallScore}%`, margin + 10, y + 28);

  y += 45;

  // Category Breakdown
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text(isId ? 'Skor per Kategori' : 'Category Scores', margin, y);
  y += 10;

  data.categoryScores.forEach((cat) => {
    const barWidth = (cat.score / 100) * (contentWidth - 60);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(cat.subject, margin, y + 4);
    
    pdf.setFillColor(226, 232, 240);
    pdf.roundedRect(margin + 50, y, contentWidth - 70, 6, 2, 2, 'F');
    
    const barColor: [number, number, number] = cat.score > 70 ? [34, 197, 94] : cat.score > 40 ? [245, 158, 11] : [239, 68, 68];
    pdf.setFillColor(...barColor);
    pdf.roundedRect(margin + 50, y, barWidth, 6, 2, 2, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(`${cat.score}%`, pageWidth - margin - 15, y + 4);
    
    y += 12;
  });

  y += 10;

  // Strengths & Weaknesses
  const colWidth = (contentWidth - 10) / 2;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 197, 94);
  pdf.text(isId ? '💪 Kekuatan' : '💪 Strengths', margin, y);
  
  pdf.setTextColor(239, 68, 68);
  pdf.text(isId ? '🎯 Area Fokus' : '🎯 Focus Areas', margin + colWidth + 10, y);
  y += 8;

  const maxItems = Math.max(data.strengths.length, data.weaknesses.length);
  for (let i = 0; i < maxItems; i++) {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    if (data.strengths[i]) {
      pdf.setTextColor(71, 85, 105);
      pdf.text(`• ${data.strengths[i].subject} (${data.strengths[i].score}%)`, margin, y);
    }
    
    if (data.weaknesses[i]) {
      pdf.setTextColor(71, 85, 105);
      pdf.text(`• ${data.weaknesses[i].subject} (${data.weaknesses[i].score}%)`, margin + colWidth + 10, y);
    }
    
    y += 6;
  }

  // Footer
  const footerY = pdf.internal.pageSize.getHeight() - 15;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(148, 163, 184);
  pdf.text('Generated by Diagnospace • www.diagnospace.com', margin, footerY);
  pdf.text(new Date().toLocaleDateString(), pageWidth - margin - 30, footerY);

  const fileName = `Diagnospace_Holistic_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};
