// app/api/ai/route.js

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai"; 

async function generateMagicBackpackStory(p) {
    console.log(p);
    
    //const genAI = new GoogleGenerativeAI('replace with your key'); 
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    ${p}
    Please provide the output in a visually appealing HTML format.
    Use appropriate semantic tags, and apply CSS styles for better presentation.
    Include the Python code snippet in a <pre> tag with a light background, and display the result in a <p> tag styled with a larger font and distinct color.
    Ensure the overall layout is centered and aesthetically pleasing.
`;

    
    const result = await model.generateContent(prompt);
    const cleanOutput = result.response.text().replace(/```html|```/g, '').trim();
    return cleanOutput;
}

export async function POST(request) {
  try {
    const { prompt } = await request.json(); // Extract the prompt from the request body
    const story = await generateMagicBackpackStory(prompt); // Call the internal function
    return NextResponse.json({ story }, { status: 200 }); // Return the generated story as JSON
  } catch (error) {
    console.error("Error generating story:", error);
    return NextResponse.json({ error: "Failed to generate story" }, { status: 500 }); // Return error response
  }
}
