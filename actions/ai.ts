'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Todo } from "@/lib/store";

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
};

export interface AITodoSuggestion {
  title: string;
  priority: "low" | "medium" | "high";
  category: "work" | "personal" | "shopping" | "health" | "learning" | "other";
  reasoning: string;
}

export interface AIInsight {
  type: "productivity" | "organization" | "suggestion" | "pattern";
  title: string;
  description: string;
  actionable: boolean;
  action?: string;
}

export async function generateTodoSuggestions(
  context: string,
  existingTodos: Pick<Todo, 'title' | 'priority' | 'category'>[]
): Promise<AITodoSuggestion[]> {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Based on the context: "${context}" and existing todos: ${JSON.stringify(existingTodos)},
      
      Generate 3-5 relevant todo suggestions. Consider:
      - What tasks might be missing or complementary
      - Appropriate priority levels
      - Suitable categories
      - Avoid duplicating existing todos
      
      Return ONLY a valid JSON array with this exact structure:
      [
        {
          "title": "specific actionable task",
          "priority": "low",
          "category": "work",
          "reasoning": "brief explanation why this todo is suggested"
        }
      ]
      
      Priority must be: low, medium, or high
      Category must be: work, personal, shopping, health, learning, or other
      Keep titles concise but specific. Ensure variety in priorities and categories.
      Do not include any text before or after the JSON array.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    let jsonText = text;
    if (text.includes("```json")) {
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      }
    } else if (text.includes("```")) {
      const match = text.match(/```\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      }
    }

    // Find JSON array in the response
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]) as AITodoSuggestion[];
      return suggestions.filter(
        (s) =>
          s.title &&
          s.priority &&
          s.category &&
          s.reasoning &&
          ["low", "medium", "high"].includes(s.priority) &&
          [
            "work",
            "personal",
            "shopping",
            "health",
            "learning",
            "other",
          ].includes(s.category)
      );
    }

    return getFallbackSuggestions(context);
  } catch (error) {
    console.error("AI suggestion error:", error);
    return getFallbackSuggestions(context);
  }
}

export async function analyzeProductivity(todos: Pick<Todo, 'title' | 'priority' | 'category' | 'createdAt'>[]): Promise<AIInsight[]> {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze this todo data for productivity insights:
      
      Total todos: ${todos.length}
      
      Categories: ${JSON.stringify(
        todos.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )}
      
      Priorities: ${JSON.stringify(
        todos.reduce((acc, t) => {
          acc[t.priority] = (acc[t.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )}
      
      Recent todos: ${JSON.stringify(
        todos.slice(-5).map((t) => ({
          title: t.title,
          category: t.category,
          priority: t.priority,
        }))
      )}
      
      Provide 2-4 actionable insights about productivity patterns, organization, or suggestions for improvement.
      
      Return ONLY a valid JSON array:
      [
        {
          "type": "productivity",
          "title": "insight title",
          "description": "detailed explanation",
          "actionable": true,
          "action": "specific action user can take"
        }
      ]
      
      Type must be: productivity, organization, suggestion, or pattern
      Do not include any text before or after the JSON array.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    let jsonText = text;
    if (text.includes("```json")) {
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      }
    } else if (text.includes("```")) {
      const match = text.match(/```\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      }
    }

    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]) as AIInsight[];
      return insights.filter(
        (i) =>
          i.type &&
          i.title &&
          i.description &&
          ["productivity", "organization", "suggestion", "pattern"].includes(
            i.type
          )
      );
    }

    return getFallbackInsights(todos);
  } catch (error) {
    console.error("AI analysis error:", error);
    return getFallbackInsights(todos);
  }
}

export async function improveTodoTitle(title: string, category: string): Promise<string> {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Improve this todo title to be more specific and actionable:
      
      Original: "${title}"
      Category: ${category}
      
      Make it:
      - More specific and actionable
      - Clear about the expected outcome
      - Concise but descriptive
      - Appropriate for the category
      
      Return only the improved title, no quotes, no explanation, just the title text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedTitle = response
      .text()
      .trim()
      .replace(/^["']|["']$/g, "");

    // Return improved title or original if too similar or empty
    return improvedTitle && improvedTitle.length > 3 ? improvedTitle : title;
  } catch (error) {
    console.error("AI improvement error:", error);
    return title;
  }
}

export async function categorizeTodo(
  title: string
): Promise<{ category: string; priority: string; reasoning: string }> {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze this todo and suggest the best category and priority:
      
      Todo: "${title}"
      
      Categories: work, personal, shopping, health, learning, other
      Priorities: low, medium, high
      
      Return ONLY valid JSON:
      {
        "category": "suggested category",
        "priority": "suggested priority", 
        "reasoning": "brief explanation of choices"
      }
      
      Do not include any text before or after the JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean and extract JSON
    let jsonText = text;
    if (text.includes("```json")) {
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      }
    } else if (text.includes("```")) {
      const match = text.match(/```\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      }
    }

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);

      // Validate the result
      const validCategories = [
        "work",
        "personal",
        "shopping",
        "health",
        "learning",
        "other",
      ];
      const validPriorities = ["low", "medium", "high"];

      if (
        validCategories.includes(result.category) &&
        validPriorities.includes(result.priority)
      ) {
        return result;
      }
    }

    return getFallbackCategorization(title);
  } catch (error) {
    console.error("AI categorization error:", error);
    return getFallbackCategorization(title);
  }
}

export async function generateSmartTemplate(
  description: string
): Promise<AITodoSuggestion[]> {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Create a todo template based on: "${description}"
      
      Generate 3-5 related todos that would typically be needed for this scenario.
      Make them comprehensive but not overwhelming.
      
      Return ONLY a valid JSON array:
      [
        {
          "title": "specific actionable task",
          "priority": "low",
          "category": "work",
          "reasoning": "why this task is important for the scenario"
        }
      ]
      
      Priority must be: low, medium, or high
      Category must be: work, personal, shopping, health, learning, or other
      Do not include any text before or after the JSON array.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean and extract JSON
    let jsonText = text;
    if (text.includes("```json")) {
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      }
    } else if (text.includes("```")) {
      const match = text.match(/```\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      }
    }

    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]) as AITodoSuggestion[];
      return suggestions.filter(
        (s) =>
          s.title &&
          s.priority &&
          s.category &&
          s.reasoning &&
          ["low", "medium", "high"].includes(s.priority) &&
          [
            "work",
            "personal",
            "shopping",
            "health",
            "learning",
            "other",
          ].includes(s.category)
      );
    }

    return getFallbackTemplate(description);
  } catch (error) {
    console.error("AI template error:", error);
    return getFallbackTemplate(description);
  }
}

// Helper functions for fallbacks
function getFallbackSuggestions(context: string): AITodoSuggestion[] {
  const contextLower = context.toLowerCase();

  if (contextLower.includes("project") || contextLower.includes("work")) {
    return [
      {
        title: "Define project scope and requirements",
        priority: "high",
        category: "work",
        reasoning: "Essential first step for any project",
      },
      {
        title: "Create project timeline and milestones",
        priority: "medium",
        category: "work",
        reasoning: "Helps track progress and deadlines",
      },
      {
        title: "Set up project communication channels",
        priority: "low",
        category: "work",
        reasoning: "Ensures team coordination",
      },
    ];
  }

  if (contextLower.includes("vacation") || contextLower.includes("travel")) {
    return [
      {
        title: "Research and book accommodation",
        priority: "high",
        category: "personal",
        reasoning: "Secure lodging for your trip",
      },
      {
        title: "Create packing checklist",
        priority: "medium",
        category: "personal",
        reasoning: "Ensure you don't forget essentials",
      },
      {
        title: "Arrange pet/house sitting",
        priority: "medium",
        category: "personal",
        reasoning: "Take care of responsibilities while away",
      },
    ];
  }

  return [
    {
      title: "Review and organize current tasks",
      priority: "medium",
      category: "other",
      reasoning: "Good starting point for productivity",
    },
    {
      title: "Set daily priorities",
      priority: "high",
      category: "other",
      reasoning: "Focus on what matters most",
    },
  ];
}

function getFallbackInsights(todos: Pick<Todo, 'title' | 'priority' | 'category' | 'createdAt'>[]): AIInsight[] {
  const insights: AIInsight[] = [];

  if (todos.length > 10) {
    insights.push({
      type: "organization",
      title: "Consider Breaking Down Large Tasks",
      description:
        "You have many todos. Consider breaking larger tasks into smaller, more manageable pieces.",
      actionable: true,
      action:
        "Review your todos and split complex ones into 2-3 smaller tasks",
    });
  }

  const highPriorityCount = todos.filter((t) => t.priority === "high").length;
  if (highPriorityCount > todos.length * 0.5) {
    insights.push({
      type: "productivity",
      title: "Too Many High Priority Items",
      description:
        "When everything is high priority, nothing is. Consider redistributing priorities.",
      actionable: true,
      action:
        "Review high priority todos and downgrade some to medium priority",
    });
  }

  return insights;
}

function getFallbackCategorization(title: string): {
  category: string;
  priority: string;
  reasoning: string;
} {
  const titleLower = title.toLowerCase();

  if (
    titleLower.includes("buy") ||
    titleLower.includes("shop") ||
    titleLower.includes("purchase")
  ) {
    return {
      category: "shopping",
      priority: "low",
      reasoning: "Contains shopping-related keywords",
    };
  }

  if (
    titleLower.includes("work") ||
    titleLower.includes("meeting") ||
    titleLower.includes("project")
  ) {
    return {
      category: "work",
      priority: "medium",
      reasoning: "Contains work-related keywords",
    };
  }

  if (
    titleLower.includes("exercise") ||
    titleLower.includes("health") ||
    titleLower.includes("doctor")
  ) {
    return {
      category: "health",
      priority: "medium",
      reasoning: "Contains health-related keywords",
    };
  }

  return {
    category: "other",
    priority: "medium",
    reasoning: "Default categorization",
  };
}

function getFallbackTemplate(description: string): AITodoSuggestion[] {
  return [
    {
      title: `Plan ${description}`,
      priority: "high",
      category: "other",
      reasoning: "Planning is essential for any endeavor",
    },
    {
      title: `Research requirements for ${description}`,
      priority: "medium",
      category: "other",
      reasoning: "Understanding requirements prevents issues",
    },
    {
      title: `Execute ${description}`,
      priority: "medium",
      category: "other",
      reasoning: "Taking action on the plan",
    },
  ];
}
