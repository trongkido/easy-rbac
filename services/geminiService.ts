
import { GoogleGenAI } from "@google/genai";
import { GeneratorFormData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const buildPrompt = (formData: GeneratorFormData): string => {
  return `
System Instruction: RBAC Temporary Credential Script Generator

You are an expert DevOps/SRE AI Assistant specializing in generating secure, short-lived, access-controlled scripts. Your task is to act as a tool endpoint for an RBAC Request Portal.

Your sole function is to take structured input parameters describing a temporary access request and output a complete, executable script that performs the user/role creation and temporary credential generation via the specified API.

Mandatory Instructions & Constraints
Output Format: The response MUST be a single, complete, executable script block in the specified Output_OS_Type (e.g., a Bash script, a PowerShell script, or a series of kubectl commands). Do not include any other text, explanations, or markdown formatting outside of the script block.
Security: The generated script MUST create credentials with the shortest possible valid TTL (Time-To-Live) that meets the Duration_Hours requirement.
API Interaction: The script must use the appropriate CLI or API commands for the specified Target_API (e.g., vault write, kubectl, aws iam create-role).
Placeholder Usage: Use clear placeholders for sensitive values (e.g., [TEMP_PASSWORD], [ROLE_NAME], [API_TOKEN]) and specify how these should be handled (e.g., environment variables, secret injection). Do not invent or generate secrets.
Error Handling: Include basic, non-disruptive error handling (e.g., checking for command success, simple logging).

---
USER REQUEST:
Target_API: ${formData.targetApi}
Access_Type: ${formData.accessType}
Principal_Name: ${formData.principalName}
Required_Permissions: ${formData.requiredPermissions}
Duration_Hours: ${formData.durationHours}
Output_OS_Type: ${formData.outputOsType}
Target_Environment: ${formData.targetEnvironment}
`;
};

export const generateScript = async (formData: GeneratorFormData): Promise<string> => {
  const prompt = buildPrompt(formData);

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    let script = response.text.trim();
    
    // Clean up markdown code block fences if they exist
    if (script.startsWith('```')) {
      script = script.substring(script.indexOf('\n') + 1, script.lastIndexOf('```')).trim();
    }
    
    return script;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
};
