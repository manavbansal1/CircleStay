import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(request: NextRequest) {
    try {
        const { message, address, context } = await request.json();

        if (!message || !address) {
            return NextResponse.json({ error: 'Message and address are required' }, { status: 400 });
        }

        if (!GEMINI_API_KEY) {
            return NextResponse.json({ 
                error: 'Gemini API key not configured',
                response: "I'm currently unavailable. Please configure the Gemini API key to enable area chat."
            }, { status: 200 });
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const systemPrompt = `You are a helpful local area expert assistant for CircleStay, a housing rental platform. You're answering questions about the area near: ${address}.

${context ? `Here's what we know about this area:
${context}` : ''}

Provide helpful, accurate, and concise information about:
- Local amenities (restaurants, shops, parks, etc.)
- Transportation options
- Safety and neighborhood characteristics
- Things to do and attractions
- Living costs and convenience
- Schools and services

Keep responses friendly, informative, and under 150 words unless the user asks for more detail. If you don't know something specific, acknowledge it honestly.`;

        const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            response: text,
            address: address
        });

    } catch (error: any) {
        console.error('Error in area chat API:', error);
        return NextResponse.json({
            error: 'Failed to get response',
            response: "I'm having trouble answering that right now. Please try again in a moment."
        }, { status: 200 });
    }
}
