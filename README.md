# Marketing Engine AI 🚀

**Marketing Engine AI** is an interactive Marketing Intelligence Suite designed to bridge the gap between Software Engineering and Business Strategy. 

Built as a final project for the *"Marketing Foundations for Computer Science"* course, this platform transforms theoretical marketing frameworks into actionable, data-driven tools. It leverages cutting-edge web technologies to demonstrate how the **4th Industrial Revolution** reshapes business decision-making.

---

## ✨ Key Features (The 4 Modules)

The suite is divided into four specialized labs, mapping the core pillars of modern marketing:

1.  **Strategic Lab:** Interactive SWOT Analysis and Marketing Mix (4Ps) modeler to define brand positioning.
2.  **Customer Intelligence:** AI-powered Buyer Persona generator using **Local Web-LLM** to transform raw data into target profiles without server-side processing.
3.  **Digital Transition Lab:** E-commerce unit economics simulator and business model validator to analyze market sustainability.
4.  **Communication Hub:** SEO & Content analyzer to evaluate digital presence and omnichannel consistency.

## 🛠 Tech Stack & Architecture

This project is built with a focus on **modularity, performance, and privacy**.

-   **Framework:** [Astro](https://astro.build/) (Island Architecture for optimal performance).
-   **Interactivity:** [Svelte](https://svelte.dev/) (Lightweight reactive components for marketing widgets).
-   **AI Engine:** [Web-LLM](https://webllm.mlc.ai/) (Running Large Language Models entirely in-browser via WebGPU).
-   **Styling:** Tailwind CSS + [shadcn-svelte](https://shadcn-svelte.com/).
-   **Testing:** Vitest (Unit/Integration) & Playwright (E2E).
-   **Documentation:** Storybook for component-driven development.

## 🏗 Project Structure

```text
src/
├── features/           # Domain-driven modules (Strategy, Customer, Digital, Media)
├── components/         # Atomic UI components (shadcn-based)
├── content/            # Theoretical foundations (Markdown-based documentation)
├── lib/                # Shared utilities & AI Client logic
└── tests/              # Comprehensive test suites (Unit & E2E)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A browser with WebGPU support (for the AI features)

### Installation
1. Clone the repo: `git clone https://github.com/lorenzomaiuri-dev/marketing-engine-ai.git`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

### Running Tests
- `npm run test` (Vitest)
- `npm run test:e2e` (Playwright)

---

## 🎓 Academic Context

This project explores the themes of the **Fourth Industrial Revolution**, where data interpretation and digital tools are no longer optional but central to any scientific or technological application.

**Course:** Foundations of Marketing for Computer Science  
**Developer:** [Lorenzo Maiuri] – *Software & AI Developer*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
