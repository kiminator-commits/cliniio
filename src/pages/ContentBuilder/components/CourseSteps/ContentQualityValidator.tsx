import React from 'react';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiAlertCircle } from '@mdi/js';

interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'file' | 'link';
  content: string;
  metadata?: {
    url?: string;
    alt?: string;
    caption?: string;
    duration?: number;
    size?: string;
  };
  order: number;
}

interface LessonData {
  id: string;
  title: string;
  description: string;
  sections: ContentSection[];
  estimatedDuration: number;
  isRequired: boolean;
}

interface ContentQualityValidatorProps {
  lessonData: LessonData | null;
}

export const ContentQualityValidator: React.FC<
  ContentQualityValidatorProps
> = ({ lessonData }) => {
  const validateContentQuality = () => {
    if (!lessonData) return;

    const qualityReport = [];
    let overallScore = 0;
    let maxScore = 0;

    // Check lesson title quality
    if (lessonData.title) {
      maxScore += 20;
      let titleScore = 0;
      if (lessonData.title.length > 5) titleScore += 5;
      if (lessonData.title.length < 50) titleScore += 5;
      if (lessonData.title.includes(':')) titleScore += 5;
      if (
        lessonData.title.includes('Guide') ||
        lessonData.title.includes('Complete') ||
        lessonData.title.includes('Essential')
      )
        titleScore += 5;
      overallScore += titleScore;
      qualityReport.push(
        `📝 **Title Quality**: ${titleScore}/20 - ${titleScore >= 15 ? 'Excellent' : titleScore >= 10 ? 'Good' : 'Needs improvement'}`
      );
    }

    // Check lesson description quality
    if (lessonData.description) {
      maxScore += 20;
      let descScore = 0;
      if (lessonData.description.length > 20) descScore += 5;
      if (lessonData.description.length < 200) descScore += 5;
      if (
        lessonData.description.includes('learn') ||
        lessonData.description.includes('understand')
      )
        descScore += 5;
      if (
        lessonData.description.includes('practical') ||
        lessonData.description.includes('hands-on')
      )
        descScore += 5;
      overallScore += descScore;
      qualityReport.push(
        `📖 **Description Quality**: ${descScore}/20 - ${descScore >= 15 ? 'Excellent' : descScore >= 10 ? 'Good' : 'Needs improvement'}`
      );
    }

    // Check content sections quality
    if (lessonData.sections.length > 0) {
      maxScore += 40;
      let contentScore = 0;
      lessonData.sections.forEach((section) => {
        if (section.content && section.content.length > 100) contentScore += 8;
        if (section.content && section.content.includes('#')) contentScore += 8;
        if (section.content && section.content.includes('•')) contentScore += 8;
        if (section.content && section.content.includes('##'))
          contentScore += 8;
      });
      overallScore += Math.min(contentScore, 40);
      qualityReport.push(
        `📚 **Content Quality**: ${Math.min(contentScore, 40)}/40 - ${contentScore >= 30 ? 'Excellent' : contentScore >= 20 ? 'Good' : 'Needs improvement'}`
      );
    }

    // Check lesson structure
    maxScore += 20;
    let structureScore = 0;
    if (lessonData.sections.length >= 3) structureScore += 10;
    if (lessonData.sections.length >= 5) structureScore += 10;
    overallScore += structureScore;
    qualityReport.push(
      `🏗️ **Structure Quality**: ${structureScore}/20 - ${structureScore >= 15 ? 'Excellent' : structureScore >= 10 ? 'Good' : 'Needs improvement'}`
    );

    // Overall assessment
    const percentage = Math.round((overallScore / maxScore) * 100);
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';

    qualityReport.unshift(
      `🎯 **Overall Quality Score**: ${overallScore}/${maxScore} (${percentage}%) - Grade: ${grade}`
    );

    if (percentage < 70) {
      qualityReport.push(
        `\n💡 **Improvement Suggestions**:\n• Add more detailed content to sections\n• Include learning objectives\n• Add practical examples and exercises\n• Structure content with clear headings\n• Include summary points and takeaways`
      );
    }

    alert(`Content Quality Report:\n\n${qualityReport.join('\n')}`);
  };

  if (!lessonData) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon path={mdiCheckCircle} size={1.5} className="text-green-600" />
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Content Quality Validator
          </h3>
          <p className="text-sm text-gray-600">
            Analyze and score your lesson content quality
          </p>
        </div>
      </div>

      <button
        onClick={validateContentQuality}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        <Icon path={mdiAlertCircle} size={0.8} />
        Validate Content Quality
      </button>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          What We Check:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Title clarity and engagement</li>
          <li>• Description completeness</li>
          <li>• Content structure and formatting</li>
          <li>• Section organization</li>
          <li>• Overall lesson completeness</li>
        </ul>
      </div>
    </div>
  );
};
