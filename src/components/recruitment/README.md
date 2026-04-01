# Recruitment Board Components

A Kanban-style recruitment board for tracking athletes through a recruitment pipeline.

## Quick Start

```tsx
import { RecruitmentBoard, RecruitmentCardDetail } from "@/components/recruitment";

function RecruitingPage({ programId }: { programId: number }) {
  const [selectedRecord, setSelectedRecord] = useState(null);

  return (
    <>
      <RecruitmentBoard programId={programId} onRecordSelect={setSelectedRecord} />
      <RecruitmentCardDetail
        programId={programId}
        record={selectedRecord}
        open={!!selectedRecord}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
      />
    </>
  );
}
```

---

## Customizing Styles

### 1. Size Variants

Most components support `size` variants via CVA:

```tsx
// Small, compact cards
<RecruitmentCard record={record} size="sm" />

// Large rating stars
<RatingStars rating={4} size="lg" />

// Compact priority badge
<PriorityBadge priority="high" size="sm" />
```

### 2. Column Width

```tsx
<RecruitmentBoard programId={1} columnWidth="lg" />
// Options: "sm" (256px) | "default" (320px) | "lg" (384px)
```

### 3. Board Spacing

```tsx
<RecruitmentBoard
  programId={1}
  gap="lg" // Gap between columns: "sm" | "default" | "lg"
  padding="sm" // Bottom padding: "none" | "sm" | "default" | "lg"
/>
```

### 4. className Override

All components forward `className` for Tailwind overrides:

```tsx
<PriorityBadge priority="high" className="uppercase tracking-wide" />
<RatingStars rating={3} className="justify-center" />
<RecruitmentCard record={record} className="border-2 border-primary" />
```

### 5. Custom Colors

Override default colors using Tailwind classes:

```tsx
// Custom star colors
<RatingStars
  rating={4}
  filledClassName="fill-blue-500 text-blue-500"
  emptyClassName="text-gray-300"
/>
```

### 6. Column Styling

The Pre-Read column header uses bold font weight via `ACCENT_HEADER_STAGES` in `recruitment-column.tsx`. Override per-column with `className`:

```tsx
<RecruitmentColumn
  column={column}
  className={column.stage === "admitted" ? "bg-emerald-100" : ""}
/>
```

---

## Customizing Behavior

### 1. Show/Hide Card Elements

```tsx
<RecruitmentCard
  record={record}
  showNotes={false} // Hide note count preview
  showPosition={false} // Hide position badge
  showRating={false} // Hide star rating
  showPriority={false} // Hide priority badge
/>
```

### 2. Custom Loading/Error/Empty States

```tsx
<RecruitmentBoard
  programId={programId}
  renderLoading={() => <MyCustomSkeleton />}
  renderError={(error) => <ErrorAlert message={error.message} />}
  renderEmpty={() => (
    <EmptyState icon={Users} title="No athletes yet" action={<AddAthleteButton />} />
  )}
/>
```

### 3. Custom Column Rendering

```tsx
<RecruitmentBoard
  programId={programId}
  renderColumn={(column, onOpenDetail) => (
    <MyCustomColumn
      title={column.stage_label}
      count={column.count}
      onAddClick={() => openAddDialog(column.stage)}
    >
      {column.records.map((record) => (
        <RecruitmentCard key={record.id} record={record} onClick={() => onOpenDetail(record)} />
      ))}
    </MyCustomColumn>
  )}
/>
```

### 4. Custom Column Header/Footer

```tsx
<RecruitmentColumn
  column={column}
  renderHeader={(col) => (
    <div className="flex items-center justify-between">
      <h3>{col.stage_label}</h3>
      <DropdownMenu>...</DropdownMenu>
    </div>
  )}
  renderFooter={(col) => (
    <Button variant="ghost" size="sm" className="w-full">
      <Plus className="mr-2 h-4 w-4" />
      Add to {col.stage_label}
    </Button>
  )}
/>
```

### 5. Custom Drag Overlay

```tsx
<RecruitmentBoard
  programId={programId}
  renderDragOverlay={(record) => (
    <div className="bg-primary text-primary-foreground rounded-lg p-4 shadow-2xl">
      Moving {record.athlete_first_name}...
    </div>
  )}
/>
```

### 6. Custom Card in Detail Sheet

```tsx
<RecruitmentCardDetail
  programId={programId}
  record={record}
  open={open}
  onOpenChange={setOpen}
  side="left" // Sheet opens from left instead of right
  showArchiveButton={false} // Hide archive button
  renderHeader={(record) => <MyCustomHeader record={record} />}
  renderActions={(record) => <MyCustomActions record={record} />}
  renderNotes={(record) => <MyCustomNotes notes={record.notes} />}
  renderFooter={(record) => <MyCustomFooter record={record} />}
/>
```

### 7. Note Form Configuration

```tsx
<NoteForm
  onSubmit={handleAddNote}
  placeholder="Add a recruiting note..."
  defaultNoteType="call"
  showNoteTypeSelector={false} // Hide type dropdown
  minRows={4} // Taller textarea
/>
```

### 8. Athlete Search Configuration

```tsx
<AthleteSearch
  onSelect={handleSelect}
  placeholder="Find athletes..."
  minQueryLength={3} // Require 3 chars before searching
  debounceMs={500} // Wait 500ms after typing
  maxResults={5} // Show max 5 results
  emptyMessage="No matches found"
  renderResult={(athlete, onSelect) => <CustomAthleteRow athlete={athlete} onClick={onSelect} />}
/>
```

---

## Using Individual Components

### Standalone Priority Badge

```tsx
import { PriorityBadge, PRIORITY_LABELS } from "@/components/recruitment";

<PriorityBadge priority="high" />
<PriorityBadge priority="medium" size="lg" />
```

### Standalone Rating Stars

```tsx
import { RatingStars } from "@/components/recruitment";

// Read-only display
<RatingStars rating={4} readOnly />

// Interactive
<RatingStars rating={rating} onChange={setRating} />

// Custom max rating
<RatingStars rating={score} maxRating={10} />
```

### Standalone Note List

```tsx
import { NoteList, NoteItem } from "@/components/recruitment";

<NoteList
  notes={notes}
  spacing="lg"
  showIcons={true}
  showAuthor={true}
  showTime={true}
/>

// Or render individual items
<NoteItem note={note} showIcon={false} />
```

---

## Headless Usage (BYO Data Fetching)

If you need custom data fetching logic:

```tsx
import { RecruitmentBoardContent } from "@/components/recruitment";
import { useMyCustomBoardQuery } from "./my-hooks";

function CustomBoard() {
  const { data: board } = useMyCustomBoardQuery();
  const [activeRecord, setActiveRecord] = useState(null);

  const handleDragStart = (event) => setActiveRecord(findRecord(event.active.id));
  const handleDragEnd = (event) => {
    /* custom logic */
  };

  return (
    <RecruitmentBoardContent
      board={board}
      activeRecord={activeRecord}
      onDragStart={handleDragStart}
      onDragOver={() => {}}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveRecord(null)}
    />
  );
}
```

---

## Extending Types

All types are exported for extension:

```tsx
import type {
  RecruitmentBoardProps,
  RecruitmentCardProps,
  RecruitmentColumnProps,
  PriorityBadgeProps,
  RatingStarsProps,
  NoteListProps,
} from "@/components/recruitment";

interface MyExtendedCardProps extends RecruitmentCardProps {
  showCustomBadge?: boolean;
}
```

---

## Constants & Utilities

```tsx
import {
  // Stage labels for display (9-stage NCAA pipeline)
  STAGE_LABELS, // { interested: "Interested", initial_outreach: "Outreach", ... }

  // Priority labels
  PRIORITY_LABELS, // { high: "High", medium: "Medium", low: "Low" }

  // Note type config
  NOTE_TYPES, // [{ value: "general", label: "General" }, ...]
  NOTE_TYPE_ICONS, // { general: MessageSquare, call: Phone, ... }
  NOTE_TYPE_COLORS, // { general: "bg-slate-100 ...", ... }

  // Selectors config (9 stages)
  STAGES, // [{ value: "interested", label: "Interested" }, ... through "admitted"]
  PRIORITIES, // [{ value: "high", label: "High" }, ...]

  // Utilities
  formatSportCode, // "track_and_field" → "Track And Field"
} from "@/components/recruitment";
```

---

## File Structure

```
src/components/recruitment/
├── index.ts                    # Barrel exports
├── README.md                   # This file
│
├── recruitment-board.tsx       # Main board + headless content
├── recruitment-column.tsx      # Droppable column
├── recruitment-card.tsx        # Draggable card + sortable wrapper
├── recruitment-card-detail.tsx # Detail sheet
│
├── add-athlete-dialog.tsx      # Add athlete modal
├── athlete-search.tsx          # Search input
├── program-selector.tsx        # Program dropdown
│
├── priority-badge.tsx          # Priority indicator
├── rating-stars.tsx            # Star rating
├── note-list.tsx               # Notes display
├── note-form.tsx               # Add note form
└── board-skeleton.tsx          # Loading skeleton
```

---

## Related Hooks

```tsx
// src/hooks/use-recruitment.ts
useRecruitmentBoard(programId); // Fetch board data
useAddRecord(programId); // Add athlete to board
useMoveRecord(programId); // Move between columns
useReorderRecords(programId); // Reorder within column
useRecord(recordId); // Fetch record detail
useUpdateRecord(programId); // Update record
useArchiveRecord(programId); // Archive record
useAddNote(programId); // Add note
useUpdateNote(programId, recordId);
useDeleteNote(programId, recordId);

// src/hooks/use-recruitment-dnd.ts
useRecruitmentDnd(programId, board); // Drag-and-drop state

// src/hooks/use-programs.ts
useMyPrograms(); // Fetch organization programs
```
