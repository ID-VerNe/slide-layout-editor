# JSON-Driven Template Architecture Migration Plan

## 1. Background & Motivation
The user is proposing a transition from React-based (`.tsx`) template definitions to declarative JSON-based templates. 
The goal is to represent templates as structured data (storing component types, positions, and settings) rather than hardcoded logic.

**Benefits:**
- **Decoupling:** Layout is separated from code.
- **Dynamic Loading:** Templates can be fetched from a server or imported/exported by users at runtime without recompiling the app.
- **Foundation for a visual editor:** A JSON schema is easier to manipulate via a drag-and-drop UI (a true low-code Template Builder).

## 2. Code Review & Feasibility Analysis

### Current State
- The project currently has **25 template components** in `src/components/templates/`.
- Templates are React Functional Components (`React.FC`).
- They use hooks (`useStore` for themes), conditional rendering logic, and heavily rely on complex Tailwind CSS classes (Flexbox, Grid, absolute positioning) and `framer-motion` for animations.
- Sizes range from 1.5KB (`ModernFeature.tsx`) to 9KB+ (`AppleBentoGrid.tsx`).

### Difficulty Assessment: **High**
Changing to a JSON format is **highly feasible but significantly difficult** due to the following challenges:
1. **Logic Translation:** React components contain inline JS logic (e.g., `if pattern === 'grid' return 'bg-grid-subtle'`). This logic must either be handled by a rule engine inside the JSON or hardcoded into the new Renderer.
2. **Layout Complexity:** Writing deeply nested UI structures (like `AcademicHybridResume.tsx`) in pure JSON is verbose and hard to maintain without a visual editor.
3. **Loss of TypeScript Safety:** React props inside `.tsx` templates are strictly typed. Moving to JSON means relying on schema validation at runtime.
4. **Migration Effort:** 25 highly polished templates need to be manually mapped to the new JSON schema structure.

## 3. Proposed Solution Architecture

Instead of raw React components, a template will look like this:

```json
{
  "id": "big-statement",
  "name": "Big Statement",
  "layout": {
    "type": "Container",
    "props": { "className": "w-full h-full flex flex-col items-center justify-center relative bg-pattern-{page.backgroundPattern}" },
    "children": [
      {
        "type": "SlideHeadline",
        "props": { "maxSize": 84, "minSize": 48 },
        "bind": "page.title"
      },
      {
        "type": "SlideSubHeadline",
        "props": { "size": "1.1rem", "color": "theme.secondary" },
        "bind": "page.subtitle"
      }
    ]
  }
}
```

## 4. Implementation Plan

### Phase 1: Core Engine Development
- Create a `JsonTemplateRenderer` component that takes a JSON schema and `PageData`.
- Implement a **Component Registry** specifically for the renderer (mapping string types like `"SlideHeadline"` to the actual React component `SlideHeadline`).
- Implement an **Expression Evaluator** (to handle simple bindings like `{page.title}` or `{theme.colors.background}`).

### Phase 2: Schema Definition
- Define strict TypeScript interfaces for the JSON Layout Schema (`TemplateNode`, `ContainerNode`, `TextNode`, `ImageNode`).
- Write a Zod schema or JSON Schema validator to ensure loaded templates are valid.

### Phase 3: Proof of Concept (PoC)
- Migrate **2 simple templates** (e.g., `BigStatement`, `MicroAnchor`) to the JSON format.
- Integrate them into `src/templates/registry.ts` using the `JsonTemplateRenderer`.
- Test rendering, resizing, and exporting.

### Phase 4: Visual/Logic Gap Bridging
- Build helper functions in the renderer to handle standard template behaviors (background patterns, conditional rendering like `visibility.logo`).

### Phase 5: Full Migration
- Systematically convert the remaining 23 templates to JSON.
- Remove old `.tsx` template files.
- Update `TemplatePreview` to render JSON definitions.

## 5. Alternatives Considered
**Hybrid Approach (Recommended):** 
Keep `.tsx` for complex, highly bespoke layouts (like `AppleBentoGrid` or `AcademicHybridResume`), but introduce the JSON engine for standard layouts (like Gallery or Title slides). The `registry.ts` can support both `component: React.FC` and `schema: JSONLayout`. This drastically lowers the immediate migration cost while providing the benefits of JSON where it makes sense.

## 6. Verification
- All 25 templates must render identically in the new JSON engine (pixel-perfect match).
- Export functions (PDF/Image) must still capture the rendered nodes correctly.
- Performance tests to ensure parsing JSON on the fly does not lag the editor UI.