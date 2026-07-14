import { NextResponse } from 'next/server';
import { groqAI } from '../../../../lib/groq';

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentName, grade, topic, count = 5 } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert AI teacher assistant. Your task is to generate customized practice questions for a student.
Student Name: ${studentName || 'Student'}
Grade/Level: ${grade || 'Unknown'}
Topic: ${topic}

Please create exactly ${count} multiple choice questions on this topic. DO NOT create any essay questions.
The output MUST be in valid JSON format matching this EXACT schema (with exactly ${count} items in the array):
{
  "questions": [
    {
      "type": "multiple_choice",
      "text": "[Question text here]",
      "options": ["A", "B", "C", "D"],
      "correctOption": [0, 1, 2, or 3]
    }
  ]
}
Make the questions engaging and appropriate for the student's grade level. Use Indonesian language.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate the questions now in JSON format.' }
    ];

    // Using Llama-3 8b for faster generation of structured data
    const rawResponse = await groqAI.generateChat(messages, 'llama-3.1-8b-instant');
    
    // Parse the JSON string returned by the model
    const parsedData = JSON.parse(rawResponse);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate content: ' + error.message }, { status: 500 });
  }
}
