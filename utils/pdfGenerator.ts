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
  // Optional Financial Health data
  financialHealthData?: {
    percentages: { needs: number; wants: number; savings: number };
    ideal: { needs: number; wants: number; savings: number };
    insights: string[];
  };
}

// Clean emoji from text for better PDF rendering
const cleanEmoji = (text: string): string => {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]/gu, '').trim();
};

export const generateResultPDF = (data: PDFReportData): void => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  const isId = data.language === 'id';
  const cleanLevel = cleanEmoji(data.level);

  // Helper functions
  const addSectionTitle = (text: string, icon?: string) => {
    checkPageBreak(20);
    y += 6;
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, y - 4, contentWidth, 10, 2, 2, 'F');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(`${icon ? icon + ' ' : ''}${text}`, margin + 4, y + 3);
    y += 12;
  };

  const addParagraph = (text: string, maxWidth: number = contentWidth - 8) => {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    const lines = pdf.splitTextToSize(text, maxWidth);
    checkPageBreak(lines.length * 4 + 4);
    pdf.text(lines, margin + 4, y);
    y += lines.length * 4 + 4;
  };

  const addDivider = () => {
    y += 3;
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  const checkPageBreak = (neededSpace: number) => {
    if (y + neededSpace > pageHeight - 20) {
      pdf.addPage();
      y = margin;
    }
  };

  // ========== HEADER ==========
  pdf.setFillColor(79, 70, 229);
  pdf.rect(0, 0, pageWidth, 45, 'F');
  
  // Gradient overlay effect
  pdf.setFillColor(99, 102, 241);
  pdf.rect(pageWidth / 2, 0, pageWidth / 2, 45, 'F');
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(199, 210, 254);
  pdf.text('DIAGNOSPACE', margin, 12);
  
  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.text(isId ? 'Laporan Diagnostik' : 'Diagnostic Report', margin, 25);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(224, 231, 255);
  pdf.text(`${data.testTitle}`, margin, 35);
  
  pdf.setFontSize(9);
  pdf.text(`${data.testCategory} • ${data.date}`, margin, 41);
  
  y = 55;

  // ========== SCORE SECTION (matches preview Score Card) ==========
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, y, contentWidth, 50, 4, 4, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin, y, contentWidth, 50, 4, 4, 'S');
  
  // Score circle
  const circleX = margin + 30;
  const circleY = y + 25;
  const circleRadius = 18;
  
  // Background circle
  pdf.setDrawColor(241, 245, 249);
  pdf.setLineWidth(4);
  pdf.circle(circleX, circleY, circleRadius, 'S');
  
  // Progress arc color based on score
  let progressColor: [number, number, number] = [220, 38, 38]; // red
  if (data.score > 40) progressColor = [217, 119, 6]; // yellow
  if (data.score > 70) progressColor = [22, 163, 74]; // green
  if (data.score > 90) progressColor = [37, 99, 235]; // blue
  
  pdf.setDrawColor(...progressColor);
  pdf.setLineWidth(4);
  
  // Draw progress arc (simplified as full circle for high scores)
  const arcAngle = (data.score / 100) * 360;
  if (arcAngle > 0) {
    // Draw arc segments
    const segments = Math.ceil(arcAngle / 10);
    for (let i = 0; i < segments; i++) {
      const startAngle = -90 + (i * 10);
      const endAngle = Math.min(-90 + ((i + 1) * 10), -90 + arcAngle);
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const x1 = circleX + circleRadius * Math.cos(startRad);
      const y1 = circleY + circleRadius * Math.sin(startRad);
      const x2 = circleX + circleRadius * Math.cos(endRad);
      const y2 = circleY + circleRadius * Math.sin(endRad);
      pdf.line(x1, y1, x2, y2);
    }
  }
  
  // Score text
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text(data.score.toString(), circleX, circleY + 3, { align: 'center' });
  
  // Score label
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);
  pdf.text(isId ? 'Skor Anda' : 'Your Score', circleX, circleY + 22, { align: 'center' });
  
  // Level badge (right side)
  let levelBg: [number, number, number] = [254, 226, 226]; // red-100
  let levelText: [number, number, number] = [220, 38, 38]; // red-600
  if (data.score > 40) { levelBg = [254, 249, 195]; levelText = [161, 98, 7]; } // yellow
  if (data.score > 70) { levelBg = [220, 252, 231]; levelText = [22, 163, 74]; } // green
  if (data.score > 90) { levelBg = [219, 234, 254]; levelText = [37, 99, 235]; } // blue
  
  const badgeX = margin + 75;
  const badgeWidth = contentWidth - 70;
  
  pdf.setFillColor(...levelBg);
  pdf.roundedRect(badgeX, y + 8, badgeWidth, 14, 3, 3, 'F');
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...levelText);
  pdf.text(cleanLevel, badgeX + badgeWidth / 2, y + 17, { align: 'center' });
  
  // Category
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);
  pdf.text(`${isId ? 'Kategori' : 'Category'}: ${data.testCategory}`, badgeX + 5, y + 35);
  pdf.text(`${isId ? 'Tanggal' : 'Date'}: ${data.date}`, badgeX + 5, y + 42);

  y += 58;

  // ========== EXECUTIVE SUMMARY (matches preview) ==========
  addSectionTitle(isId ? 'Ringkasan Eksekutif' : 'Executive Summary', '');
  
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, y - 2, contentWidth, 0, 3, 3, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, y - 2, contentWidth, 0, 3, 3, 'S');
  
  addParagraph(data.executiveSummary);

  // ========== VITAL POINT (matches preview orange card) ==========
  checkPageBreak(35);
  y += 4;
  
  pdf.setFillColor(255, 247, 237); // orange-50
  pdf.roundedRect(margin, y, contentWidth, 32, 3, 3, 'F');
  pdf.setDrawColor(254, 215, 170); // orange-200
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin, y, contentWidth, 32, 3, 3, 'S');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(154, 52, 18); // orange-800
  pdf.text(isId ? 'Poin Vital' : 'Vital Point', margin + 5, y + 8);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(124, 45, 18); // orange-900
  const vitalLines = pdf.splitTextToSize(data.vitalPoint, contentWidth - 12);
  pdf.text(vitalLines.slice(0, 3), margin + 5, y + 16);
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(194, 65, 12);
  pdf.text((isId ? 'REKOMENDASI UTAMA' : 'KEY RECOMMENDATION').toUpperCase(), margin + 5, y + 28);
  
  y += 38;

  // ========== DIMENSION ANALYSIS (matches preview) ==========
  addSectionTitle(isId ? 'Analisis Dimensi' : 'Dimension Analysis', '');
  
  data.dimensions.forEach((dim) => {
    checkPageBreak(12);
    const barMaxWidth = contentWidth - 55;
    const barWidth = (dim.score / 100) * barMaxWidth;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(dim.subject, margin + 4, y + 3);
    
    // Background bar
    pdf.setFillColor(241, 245, 249);
    pdf.roundedRect(margin + 40, y, barMaxWidth, 5, 1.5, 1.5, 'F');
    
    // Progress bar with color based on score
    const barColor: [number, number, number] = dim.score > 70 ? [34, 197, 94] : dim.score > 40 ? [245, 158, 11] : [239, 68, 68];
    pdf.setFillColor(...barColor);
    if (barWidth > 0) {
      pdf.roundedRect(margin + 40, y, Math.max(barWidth, 3), 5, 1.5, 1.5, 'F');
    }
    
    // Score percentage
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(`${dim.score}%`, pageWidth - margin - 2, y + 3, { align: 'right' });
    
    y += 9;
  });

  // ========== RECOMMENDATIONS (matches preview) ==========
  checkPageBreak(30);
  addDivider();
  addSectionTitle(isId ? 'Rekomendasi Strategis' : 'Strategic Recommendations', '');
  
  data.recommendations.forEach((rec, index) => {
    checkPageBreak(18);
    
    // Green checkmark circle
    pdf.setFillColor(220, 252, 231);
    pdf.circle(margin + 6, y + 1, 3, 'F');
    pdf.setFillColor(34, 197, 94);
    pdf.circle(margin + 6, y + 1, 1.5, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(rec.title, margin + 12, y + 2);
    y += 5;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    const recLines = pdf.splitTextToSize(rec.desc, contentWidth - 16);
    pdf.text(recLines, margin + 12, y + 1);
    y += recLines.length * 3.5 + 5;
  });

  // ========== METHODOLOGY (matches preview blue card) ==========
  checkPageBreak(45);
  addDivider();
  y += 2;
  
  pdf.setFillColor(239, 246, 255); // blue-50
  pdf.roundedRect(margin, y, contentWidth, 42, 3, 3, 'F');
  pdf.setDrawColor(191, 219, 254); // blue-200
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin, y, contentWidth, 42, 3, 3, 'S');
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text(isId ? 'Metodologi' : 'Methodology', margin + 5, y + 8);
  
  // Left column - Source
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 116, 139);
  pdf.text(isId ? 'SUMBER' : 'SOURCE', margin + 5, y + 15);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text(data.methodology.name, margin + 5, y + 20);
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(71, 85, 105);
  pdf.text(data.methodology.source, margin + 5, y + 25);
  
  // Right column - Author
  const rightCol = margin + contentWidth / 2;
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 116, 139);
  pdf.text(isId ? 'PENULIS' : 'AUTHOR', rightCol, y + 15);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text(data.methodology.author, rightCol, y + 20);
  
  // Description
  pdf.setDrawColor(191, 219, 254);
  pdf.setLineWidth(0.3);
  pdf.line(margin + 5, y + 30, pageWidth - margin - 5, y + 30);
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  const methLines = pdf.splitTextToSize(data.methodology.description, contentWidth - 10);
  pdf.text(methLines.slice(0, 2), margin + 5, y + 36);
  
  y += 50;

  // ========== FOOTER ==========
  const footerY = pageHeight - 10;
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(148, 163, 184);
  pdf.text('Generated by Diagnospace • www.diagnospace.com', margin, footerY);
  pdf.text(new Date().toLocaleDateString(), pageWidth - margin, footerY, { align: 'right' });

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
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  const isId = data.language === 'id';

  const checkPageBreak = (neededSpace: number) => {
    if (y + neededSpace > pageHeight - 20) {
      pdf.addPage();
      y = margin;
    }
  };

  // Header
  pdf.setFillColor(79, 70, 229);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  pdf.setFillColor(99, 102, 241);
  pdf.rect(pageWidth / 2, 0, pageWidth / 2, 50, 'F');
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(199, 210, 254);
  pdf.text('DIAGNOSPACE', margin, 12);
  
  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.text(isId ? 'Laporan Kesehatan Holistik' : 'Holistic Health Report', margin, 28);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(224, 231, 255);
  pdf.text(data.userName, margin, 40);
  
  y = 60;

  // Archetype Card
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, y, contentWidth, 35, 4, 4, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, y, contentWidth, 35, 4, 4, 'S');
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text(data.archetype, margin + 8, y + 12);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  const archLines = pdf.splitTextToSize(data.archetypeDesc, contentWidth - 16);
  pdf.text(archLines.slice(0, 3), margin + 8, y + 20);
  
  y += 42;

  // Overall Score
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 116, 139);
  pdf.text(isId ? 'Indeks Kesehatan' : 'Health Index', margin + 8, y + 12);
  
  pdf.setFontSize(24);
  pdf.setTextColor(79, 70, 229);
  pdf.text(`${data.overallScore}%`, margin + 8, y + 24);

  y += 38;

  // Category Scores
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text(isId ? 'Skor per Kategori' : 'Category Scores', margin, y);
  y += 8;

  data.categoryScores.forEach((cat) => {
    checkPageBreak(10);
    const barMaxWidth = contentWidth - 50;
    const barWidth = (cat.score / 100) * barMaxWidth;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(cat.subject, margin, y + 3);
    
    pdf.setFillColor(241, 245, 249);
    pdf.roundedRect(margin + 38, y, barMaxWidth, 5, 1.5, 1.5, 'F');
    
    const barColor: [number, number, number] = cat.score > 70 ? [34, 197, 94] : cat.score > 40 ? [245, 158, 11] : [239, 68, 68];
    pdf.setFillColor(...barColor);
    if (barWidth > 0) {
      pdf.roundedRect(margin + 38, y, Math.max(barWidth, 3), 5, 1.5, 1.5, 'F');
    }
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(`${cat.score}%`, pageWidth - margin - 2, y + 3, { align: 'right' });
    
    y += 9;
  });

  y += 8;

  // Strengths & Weaknesses
  checkPageBreak(40);
  const colWidth = (contentWidth - 10) / 2;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 197, 94);
  pdf.text(isId ? 'Kekuatan' : 'Strengths', margin, y);
  
  pdf.setTextColor(239, 68, 68);
  pdf.text(isId ? 'Area Fokus' : 'Focus Areas', margin + colWidth + 10, y);
  y += 6;

  const maxItems = Math.max(data.strengths.length, data.weaknesses.length);
  for (let i = 0; i < maxItems; i++) {
    checkPageBreak(6);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    if (data.strengths[i]) {
      pdf.setTextColor(71, 85, 105);
      pdf.text(`• ${data.strengths[i].subject} (${data.strengths[i].score}%)`, margin, y);
    }
    
    if (data.weaknesses[i]) {
      pdf.setTextColor(71, 85, 105);
      pdf.text(`• ${data.weaknesses[i].subject} (${data.weaknesses[i].score}%)`, margin + colWidth + 10, y);
    }
    
    y += 5;
  }

  // Footer
  const footerY = pageHeight - 10;
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(148, 163, 184);
  pdf.text('Generated by Diagnospace • www.diagnospace.com', margin, footerY);
  pdf.text(new Date().toLocaleDateString(), pageWidth - margin, footerY, { align: 'right' });

  const fileName = `Diagnospace_Holistic_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};
