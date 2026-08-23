# MIMIRYX: Neural Knowledge Network

Mimiryx is a highly visual, futuristic personal knowledge management dashboard built to destroy the bottlenecks of traditional learning. It features a unique volumetric digital organism (The Yggdrasil World Tree) that grows and reacts to your learning progress in real-time.

## The Story Behind Mimiryx

The name "MIMIRYX" is inspired by a mix of mythology and Greek influences, centered around the concept of Yggdrasil. 

This project started out of pure frustration. Taking massive amounts of notes in standard Notepad files was exhausting, and organizing them into folders took too many steps. Standard note apps caused the "Illusion of Competence"—where taking fast notes feels like learning, but no actual retention happens. I decided to build my own local note organizer, but as development went on, a simple text app felt too boring. 

While reading manhwas that featured world trees and gods, I got the idea to build an actual digital World Tree. Now, as I add new topics and notes, the Yggdrasil Tree on the dashboard physically grows new main branches and sub-branches. 

## The "Yggdrasil" Build (v2.0 Features)

We recently underwent a massive architectural upgrade to solve 4 major learning bottlenecks: The Stenographer Syndrome, Working Memory Crash, Illusion of Competence, and the Distraction Engine.

* **The 3D Grimoire (BookReader):** Scrapped standard vertical scrolling. Notes now render as absolute 3D pages with a cinematic `rotateY` holographic page-flip animation.
* **Deep Dive (Sensory Deprivation Mode):** Hit a single toggle to trigger the Fullscreen API and engage a Web Audio API ambient sci-fi drone pad (a detuned Perfect Fifth at 110Hz + 164.8Hz). It completely isolates you from real-world distractions for deep study sessions.
* **Active Recall (Interrogation Mode):** Toggle this mode in the BookReader to automatically censor all `<strong>` (bolded text) and `<code>` blocks with black glitch-boxes. You are forced to recall the answer from memory and hover to reveal it, destroying the Illusion of Competence.
* **Synaptic Dump Editor:** A dual-pane split editor. On the left: a glowing green brutalist terminal for raw unstructured data dumps (transcripts, scattered thoughts). On the right: a live Matrix preview of the compiled neural node.
* **Oracle AI (Synthesize Stream):** Connected to Gemini 2.5 Flash, the Oracle takes your unstructured data dumps and automatically paginates, structures, and beautifully formats them for the 3D Grimoire without losing any technical nuance.
* **Code Block Continuity Engine:** A custom markdown pre-processor that allows massive technical code blocks to seamlessly span across multiple 3D pages without breaking syntax highlighting.
* **Mathematical Rendering:** Native support for GitHub Flavored Markdown (tables, checklists) and LaTeX mathematical proofs (`remark-math`, `rehype-katex`).

## Core Architecture
* **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons
* **Routing:** React Router v6
* **Database:** LocalForage (IndexedDB) for hyper-fast local persistence
* **Rendering Engine:** HTML5 Canvas (Yggdrasil Tree), ReactMarkdown (UI)
* **AI Engine:** Google Gemini API 

## Getting Started

1. Clone the repository
2. Run `npm install`
3. Create a `.env` file and add your `VITE_GEMINI_API_KEY=your_key_here`
4. Run `npm run dev` to launch the neural network on localhost:5173

*The tree grows as you learn. Feed the engine.*
