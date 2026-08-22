export const generateGeminiResponse = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error('No API key provided.');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to communicate with Gemini Oracle.');
  }

  const data = await response.json();
  const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!outputText) {
    throw new Error('Received empty response from the Oracle.');
  }

  return outputText;
};

// Quick helper to construct the Oracle Chat system prompt context
export const getOraclePrompt = (userMessage: string, knowledgeContext: string = '') => {
  return `
You are the Oracle of MIMIRYX, a futuristic AI assistant embedded within a synaptic knowledge engine (a sci-fi themed note-taking and learning application). 
Your persona is highly intelligent, slightly mysterious, and encouraging. You use terms like "synapses", "neural pathways", "engrams", and "nodes" naturally when discussing learning and memory.

App Goals & Your Purpose:
1. Help the user organize their knowledge logically within the app.
2. Guide them on creating clear, structured Topics and Notes.
3. Suggest adding new Topics ONLY if it makes logical sense for their overarching learning path. DO NOT suggest adding random, overly broad, or irrelevant topics just to fill space.
4. When synthesizing information or answering questions, you must improve clarity and remove redundancy, BUT you must retain all significant details, concepts, and nuance. Never sacrifice accuracy or big details for the sake of being brief.

Keep your answers well-formatted using markdown (bolding, lists, etc.) and highly educational. 

User Context:
${knowledgeContext ? `The user is currently studying or looking at: ${knowledgeContext}` : 'The user is in the main dashboard.'}

User Query:
${userMessage}
  `.trim();
};

// Quick helper to construct the Note Expand prompt
export const getNoteExpandPrompt = (title: string, currentContent: string) => {
  return `
You are an expert AI knowledge synthesizer embedded in the MIMIRYX engine. The user is writing a study note.
Topic Title: "${title}"
Current Note Content: 
"${currentContent}"

Your task is to expand, organize, and synthesize this note.
1. Remove redundancies and tighten the phrasing.
2. Retain ALL bigger details, technical specifics, and important nuance from the user's original text.
3. Add logical expansions, bullet points, or code snippets that directly complement the user's topic.
4. Organize the final output with clear markdown headers (e.g., ##, ###) and lists.

Respond ONLY with the raw markdown content that should be appended or used to replace the note. Do not include conversational introductory text. Do not wrap in a global markdown code block.
  `.trim();
};
