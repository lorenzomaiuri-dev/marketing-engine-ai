import { CreateMLCEngine, type MLCEngine, type InitProgressReport } from "@mlc-ai/web-llm";
import { writable, type Writable } from "svelte/store";
import type { LLMState, EngineProgress } from "../types";

const SELECTED_MODEL = "Qwen2.5-0.5B-Instruct-q4f32_1-MLC";

export class CustomerIntelligenceEngine {
  private engine: MLCEngine | null = null;
  public state: Writable<LLMState> = writable("idle");
  public progress: Writable<EngineProgress> = writable({ progress: 0, text: "Initial state" });

  async init() {
    if (this.engine) return;
    this.state.set("loading");
    try {
      this.engine = await CreateMLCEngine(SELECTED_MODEL, {
        initProgressCallback: (report: InitProgressReport) => {
          this.progress.set({ progress: report.progress, text: report.text });
        }
      });
      this.state.set("ready");
    } catch (error: any) {
      this.state.set("error");
      throw error;
    }
  }

  async generatePersona(businessContext: string): Promise<string> {
    if (!this.engine) await this.init();
    this.state.set("generating");
    
    const prompt = `Business: ${businessContext}
    Generate a JSON object with these EXACT keys and no others:
    "name": (string)
    "archetype": (string)
    "ageRange": (string, e.g. "30-45")
    "occupation": (string)
    "location": (string)
    "painPoints": (array of 3 strings)
    "goals": (array of 3 strings)
    "buyingBehavior": (string)
    
    Rules: No placeholders like <undefined>. No comments. Use double quotes.`;

    try {
      const response = await this.engine?.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
        frequency_penalty: 1.2
      });
      
      this.state.set("ready");
      let raw = response?.choices[0].message.content || "";
      
      // 1. Extreme Sanitization
      let cleaned = raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
      cleaned = cleaned
        .replace(/<[^>]*>/g, '""')
        .replace(/\.\.\./g, '')
        .replace(/'/g, '"')
        .replace(/([{,]\s*)([a-zA-Z0-9_]+?)\s*:/g, '$1"$2":')
        .replace(/:\s*undefined/g, ': ""')
        .replace(/:\s*null/g, ': ""')
        .replace(/,\s*([\}\]])/g, '$1')
        .replace(/:\s*(\d+-\d+)/g, ': "$1"');

      try {
        const flatData = JSON.parse(cleaned);
        return JSON.stringify(this.mapToStructure(flatData));
      } catch (e) {
        return JSON.stringify(this.regexRecovery(raw));
      }
    } catch (error) {
      this.state.set("ready");
      throw error;
    }
  }

  private mapToStructure(data: any): any {
    return {
      name: data.name || "Target Persona",
      archetype: data.archetype || "Main Segment",
      demographics: {
        ageRange: data.ageRange || "Various",
        occupation: data.occupation || "Professional",
        location: data.location || "Global"
      },
      painPoints: Array.isArray(data.painPoints) ? data.painPoints.slice(0, 3) : ["Market volatility"],
      goals: Array.isArray(data.goals) ? data.goals.slice(0, 3) : ["Cost reduction"],
      buyingBehavior: data.buyingBehavior || "Research-oriented."
    };
  }

  private regexRecovery(text: string): any {
    const find = (key: string) => {
        // Use String.raw to safely define regex with backslashes
        const r = new RegExp(String.raw`"${key}"\s*:\s*"([^"]+)"`, "i");
        return text.match(r)?.[1] || "";
    };
    const findList = (key: string) => {
        const r = new RegExp(String.raw`"${key}"\s*:\s*\[([^\]]+)\]`, "i");
        const m = text.match(r);
        return m ? m[1].split(",").map(s => s.replace(/"/g, "").trim()).filter(Boolean) : [];
    };

    return this.mapToStructure({
      name: find("name"),
      archetype: find("archetype"),
      ageRange: find("ageRange") || text.match(/(\d+-\d+)/)?.[0],
      occupation: find("occupation"),
      location: find("location"),
      painPoints: findList("painPoints"),
      goals: findList("goals"),
      buyingBehavior: find("buyingBehavior")
    });
  }
}

export const engineService = new CustomerIntelligenceEngine();