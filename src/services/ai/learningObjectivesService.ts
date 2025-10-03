export interface LearningObjectiveSuggestion {
  objective: string;
  bloomsLevel:
    | 'remember'
    | 'understand'
    | 'apply'
    | 'analyze'
    | 'evaluate'
    | 'create';
  reasoning: string;
  confidence: number;
}

export interface ObjectiveGenerationRequest {
  title: string;
  description: string;
  prerequisites?: string[];
  linkedPrerequisites?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface RawObjective {
  objective?: string;
  bloomsLevel?: string;
  reasoning?: string;
  confidence?: number;
}

export class LearningObjectivesService {
  private static readonly API_ENDPOINT = '/api/ai/openai';

  /**
   * Generate learning objectives based on course information
   */
  static async generateLearningObjectives(
    courseData: ObjectiveGenerationRequest
  ): Promise<LearningObjectiveSuggestion[]> {
    try {
      // Prepare the context for AI generation
      const context = this.buildContextPrompt(courseData);

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: context,
          context: 'courses',
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with status ${response.status}`);
      }

      // Parse the streaming response
      const text = await this.parseStreamingResponse(response);
      return this.parseObjectivesFromResponse(text);
    } catch (error) {
      console.error('Error generating learning objectives:', error);
      // Return fallback objectives if AI fails
      return this.getFallbackObjectives(courseData);
    }
  }

  /**
   * Build the context prompt for AI generation
   */
  private static buildContextPrompt(
    courseData: ObjectiveGenerationRequest
  ): string {
    const {
      title,
      description,
      prerequisites,
      linkedPrerequisites,
      difficulty,
    } = courseData;

    let prompt = `Generate 3-5 specific, measurable learning objectives for a healthcare/sterilization course with the following details:

Course Title: "${title}"
Course Description: "${description}"
Difficulty Level: ${difficulty}`;

    if (prerequisites && prerequisites.length > 0 && prerequisites[0]) {
      prompt += `\nPrerequisites: ${prerequisites.filter((p) => p.trim()).join(', ')}`;
    }

    if (linkedPrerequisites && linkedPrerequisites.length > 0) {
      prompt += `\nLinked Course Prerequisites: ${linkedPrerequisites.length} course(s) from our library`;
    }

    prompt += `

Please generate learning objectives that:
1. Use action verbs aligned with Bloom's Taxonomy
2. Are specific and measurable
3. Are appropriate for ${difficulty} level learners
4. Focus on healthcare/sterilization context
5. Build upon the stated prerequisites

Format each objective as a JSON object with:
- "objective": the learning objective statement
- "bloomsLevel": one of [remember, understand, apply, analyze, evaluate, create]
- "reasoning": brief explanation of why this objective fits the course
- "confidence": score from 0.0 to 1.0

Return only a JSON array of objectives, no other text.`;

    return prompt;
  }

  /**
   * Parse streaming response from OpenAI
   */
  private static async parseStreamingResponse(
    response: Response
  ): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let fullText = '';
    const decoder = new TextDecoder();

    try {
      let maxIterations = 1000; // Safety limit
      while (maxIterations > 0) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        maxIterations--;
      }
    } finally {
      reader.releaseLock();
    }

    return fullText;
  }

  /**
   * Parse objectives from AI response
   */
  private static parseObjectivesFromResponse(
    text: string
  ): LearningObjectiveSuggestion[] {
    try {
      // Clean up the response text to extract JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const objectives = JSON.parse(jsonMatch[0]);

      // Validate the structure
      return objectives.map((obj: RawObjective) => ({
        objective: obj.objective || 'Invalid objective',
        bloomsLevel: obj.bloomsLevel || 'understand',
        reasoning: obj.reasoning || 'AI generated',
        confidence: typeof obj.confidence === 'number' ? obj.confidence : 0.7,
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Return empty array if parsing fails
      return [];
    }
  }

  /**
   * Fallback objectives when AI is unavailable
   */
  private static getFallbackObjectives(
    courseData: ObjectiveGenerationRequest
  ): LearningObjectiveSuggestion[] {
    const { title, difficulty } = courseData;

    // Generate basic objectives based on difficulty and title keywords
    const fallbackObjectives: LearningObjectiveSuggestion[] = [];

    if (title.toLowerCase().includes('sterilization')) {
      fallbackObjectives.push({
        objective: 'Identify proper sterilization procedures and protocols',
        bloomsLevel: 'remember',
        reasoning: 'Fundamental knowledge for sterilization courses',
        confidence: 0.8,
      });

      if (difficulty !== 'beginner') {
        fallbackObjectives.push({
          objective:
            'Evaluate sterilization effectiveness and troubleshoot issues',
          bloomsLevel: 'evaluate',
          reasoning: 'Advanced skill for non-beginner courses',
          confidence: 0.7,
        });
      }
    }

    if (title.toLowerCase().includes('safety')) {
      fallbackObjectives.push({
        objective: 'Apply safety protocols in healthcare environments',
        bloomsLevel: 'apply',
        reasoning: 'Practical application for safety courses',
        confidence: 0.8,
      });
    }

    // Default objective if no specific keywords found
    if (fallbackObjectives.length === 0) {
      fallbackObjectives.push({
        objective: `Demonstrate understanding of ${title.toLowerCase()} concepts and procedures`,
        bloomsLevel: 'understand',
        reasoning: 'Generic objective based on course title',
        confidence: 0.6,
      });
    }

    return fallbackObjectives;
  }
}
