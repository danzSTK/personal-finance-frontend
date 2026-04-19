---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when building web components, pages, dashboards, or applications. Generates creative, polished UI design that avoids generic AI aesthetics while following Silicon Valley UX principles and Atomic Design methodology.
license: Based on Anthropic's frontend-design skill - adapted for Personal Finance App
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics while adhering to **Silicon Valley UX/UI principles** (Nielsen Heuristics, Laws of UX) and **Atomic Design methodology**. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it? (Personal finance = clarity, trust, efficiency)
- **Tone**: Pick an extreme that matches the domain:
  - For finance apps: Clean/minimal with bold accents, trustworthy/professional, or data-driven/analytical
  - Avoid: Playful chaos, toy-like, art deco (unless specifically requested)
  - Consider: Minimalist banking apps (Nubank, N26), sophisticated dashboards (Stripe, Vercel), or Apple's refined clarity
- **Constraints**: React + TypeScript + Tailwind CSS + Shadcn/UI + Atomic Design
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (React + TypeScript + Tailwind) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail
- Following Atomic Design hierarchy (atoms → molecules → organisms → templates → pages)
- Adhering to Nielsen's 10 Heuristics and Laws of UX

## Frontend Aesthetics Guidelines

Focus on:

### Typography
- **Financial apps demand clarity**: Choose fonts that are legible at small sizes (numbers, decimals)
- Avoid generic: Inter, Roboto, Arial, system fonts
- Consider: SF Pro Display (Apple-like), Manrope (modern geometric), Space Grotesk (tech), IBM Plex Sans (professional), Satoshi (friendly but serious)
- **Hierarchy is critical**: Use font-weight and size to create clear information hierarchy
  - Large numbers for amounts (text-4xl to text-6xl)
  - Medium for labels (text-sm to text-base)
  - Small for metadata (text-xs)
- Pair a distinctive display font for headings with a refined sans-serif for body/data

### Color & Theme
- **Financial UI requires trust**: Blues/greens signal stability, reds for warnings
- Commit to a cohesive aesthetic. Use CSS variables for consistency
- **Specific to finance:**
  - Income/positive: Green shades (emerald-500, green-600)
  - Expense/negative: Red shades (rose-500, red-600)
  - Neutral/pending: Gray/slate tones
  - Primary actions: Trust colors (blue-600, indigo-600)
- Dominant colors with sharp accents outperform timid, evenly-distributed palettes
- Support dark mode with proper contrast (WCAG AA minimum)

### Motion & Micro-interactions
- Use animations for effects and micro-interactions
- Prioritize CSS-only solutions for HTML
- Use Framer Motion for React when available
- **Focus on high-impact moments**: 
  - Transaction added: Subtle slide-in + success check animation
  - Balance updates: Number counter animation
  - Page loads: Staggered reveals with animation-delay
- Use scroll-triggering and hover states that surprise
- **Financial UI caveat**: Don't over-animate numbers - users need to READ them

### Spatial Composition
- **For dashboards**: Grid layouts for data cards, asymmetry for emphasis
- Unexpected layouts create interest but maintain SCANNABILITY (finance = scan quickly)
- Generous negative space OR controlled density (choose based on concept)
- Use overlapping cards for depth, diagonal flow for dynamism

### Backgrounds & Visual Details
- Create atmosphere and depth rather than defaulting to solid colors
- Add contextual effects and textures that match the overall aesthetic:
  - Gradient meshes (subtle for finance)
  - Noise textures (adds premium feel)
  - Geometric patterns (data-like grids, charts as background)
  - Layered transparencies (glassmorphism for cards)
  - Dramatic shadows (depth for floating elements)
  - Custom cursors (optional, only if fits aesthetic)
  - Grain overlays (premium, print-like feel)

### NEVER Use Generic AI Aesthetics
❌ Overused fonts: Inter, Roboto, Arial, system fonts  
❌ Cliched colors: Purple gradients on white backgrounds  
❌ Predictable layouts: Cookie-cutter grid with no character  
❌ Generic components: Shadcn defaults without customization  

## Silicon Valley UX Principles (MANDATORY)

Every component MUST follow these principles:

### 1. Visibility of System Status (Nielsen #1)
```tsx
// ✅ Loading states, progress indicators
<Button disabled={isPending}>
  {isPending && <Loader2 className="animate-spin mr-2" />}
  {isPending ? 'Processing...' : 'Pay'}
</Button>
```

### 2. User Control and Freedom (Nielsen #3)
```tsx
// ✅ Always provide Cancel/Undo
<AlertDialog>
  <AlertDialogCancel>Cancel</AlertDialogCancel>
  <AlertDialogAction>Confirm</AlertDialogAction>
</AlertDialog>
```

### 3. Error Prevention (Nielsen #5)
```tsx
// ✅ Validate in real-time, disable if invalid
<Button type="submit" disabled={!form.formState.isValid}>
  Submit
</Button>
```

### 4. Recognition Rather Than Recall (Nielsen #6)
```tsx
// ✅ Show options, don't require memorization
<Select>
  <SelectItem value="food">🍔 Food</SelectItem>
  <SelectItem value="transport">🚗 Transport</SelectItem>
</Select>
```

### 5. Aesthetic and Minimalist Design (Nielsen #8)
```tsx
// ✅ Only essential information
<Card>
  <CardHeader>
    <CardTitle>{transaction.description}</CardTitle>
    <CardDescription className="text-2xl font-bold">
      {formatCurrency(transaction.amount)}
    </CardDescription>
  </CardHeader>
</Card>
```

### Laws of UX Integration

- **Hick's Law**: Limit choices (max 7±2 items in menus)
- **Fitts's Law**: Large touch targets (min 44x44px), important actions close to context
- **Miller's Law**: Chunk information (group related items)
- **Serial Position Effect**: Important actions at start/end
- **Von Restorff Effect**: Destructive actions visually distinct

## Atomic Design Structure (MANDATORY)

Organize components following this hierarchy:

```
src/features/[feature]/components/
├── atoms/          # Button, Input, Label, Icon (no imports of custom components)
├── molecules/      # FormField (Label+Input+Error), SearchBar (Input+Icon+Button)
├── organisms/      # LoginForm, TransactionCard (can have business logic, API calls)
└── templates/      # DashboardLayout, AuthLayout (layout structure, no data)

src/shared/components/
├── atoms/          # Global reusable atoms
├── molecules/      # Global reusable molecules
├── organisms/      # Global reusable organisms (Navbar, Sidebar)
└── templates/      # Global layout templates
```

**Rules:**
- Atoms cannot import other custom components (only HTML/SVG)
- Molecules combine atoms, no business logic
- Molecules combine atoms, no business logic
- Organisms can have logic, API calls, state management
- Templates define layout structure (use children/slots)
- Pages compose templates with real data

## Tech Stack Requirements

**MUST use these technologies:**
- React 18+ with TypeScript
- Tailwind CSS (utility-first styling)
- Shadcn/UI (for base components, but CUSTOMIZE them)
- Framer Motion (for animations when needed)
- Class Variance Authority (for component variants)
- Lucide Icons (consistent icon set)

**DO NOT use:**
- Inline styles (use Tailwind classes)
- CSS modules or styled-components
- Other UI libraries (Bootstrap, Material-UI, Ant Design)

## Implementation Requirements

**Every component must include:**
1. TypeScript interfaces for all props
2. Proper accessibility (ARIA labels, keyboard support)
3. Responsive design (mobile-first, Tailwind breakpoints)
4. Loading states where applicable
5. Error states with clear messages
6. Empty states with guidance
7. Proper semantic HTML
8. Comments only where business logic is complex

**Code Quality:**
```tsx
// ✅ GOOD: Clean, typed, accessible
interface TransactionCardProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
}

export const TransactionCard = ({ transaction, onDelete }: TransactionCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {transaction.description}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {format(transaction.date, 'PPP')}
            </CardDescription>
          </div>
          <div className={cn(
            "text-2xl font-bold",
            transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
          )}>
            {formatCurrency(transaction.amount)}
          </div>
        </div>
      </CardHeader>
      {onDelete && (
        <CardFooter>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
```

## Customization Over Defaults

**NEVER ship Shadcn defaults without customization:**

```tsx
// ❌ BAD: Generic Shadcn
<Button>Click me</Button>

// ✅ GOOD: Customized with personality
<Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/50">
  <Sparkles className="mr-2 h-4 w-4" />
  Create Transaction
</Button>
```

## Remember

Claude is capable of extraordinary creative work. Don't hold back - show what can truly be created when thinking outside the box and committing fully to a distinctive vision. 

**Match implementation complexity to the aesthetic vision:**
- Maximalist designs need elaborate code with extensive animations and effects
- Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details

**Elegance comes from executing the vision well**, whether that vision is bold and complex or refined and minimal.

**Context matters**: This is a personal finance app. Users need TRUST, CLARITY, and EFFICIENCY. Beautiful design serves these goals, not the other way around.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices across generations.
