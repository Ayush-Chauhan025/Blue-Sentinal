import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request){
    try {
        const body = await req.json();
        const {image, nodeId, lat, lng} = body;

        if(!image){
            return NextResponse.json({ 
                error: "No image provided" 
            }, { 
                status: 400 
            });
        }

        const matches = image.match(/^data:(image\/[a-zA-Z0-9]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
            return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
        }

        const mimeType = matches[1];
        const base64Data = matches[2];

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { responseMimeType: "application/json" }
        })

        const prompt = `You are an environmental AI auditor for a smart city. 
        Analyze the uploaded image. 
        1. If the image is NOT of an outdoor urban environment (e.g., it's a cup of water, a screen, or blurry), return {"status": "REJECTED"}.
        2. If it is outdoor and shows dirty, still, or stagnant water, return {"status": "STAGNANT"}.
        3. If it shows clean or flowing water, return {"status": "FLOWING"}.
        Reply ONLY with a valid JSON object.`;

        const imagePart = {
            inlineData:{
                data: base64Data,
                mimeType: mimeType
            }
        }

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        const AIDecision = JSON.parse(responseText);

        if(AIDecision.status === "STAGNANT" || AIDecision.status === "FLOWING"){
            // lock node and update db

            return NextResponse.json({ 
                success: true, 
                message: "Reported",
                aiStatus: AIDecision.status 
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                message: "Verification failed.",
                aiStatus: AIDecision.status 
            });
        }
    } catch(err) {
        console.error("Gemini Vision API Error:", err);
        return NextResponse.json({ error: "AI Verification Failed" }, { status: 500 });
    }
}