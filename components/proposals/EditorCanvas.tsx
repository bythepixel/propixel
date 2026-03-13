import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ProposedBlock {
  tempId: string;
  id?: number;
  blockId: number;
  title: string;
  content: string;
}

interface SortableItemProps {
  block: ProposedBlock;
  onRemove: (tempId: string) => void;
  onUpdateContent: (tempId: string, content: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ block, onRemove, onUpdateContent }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-gray-900 border ${
        isDragging ? "border-blue-500 shadow-2xl opacity-80" : "border-gray-800"
      } rounded-xl overflow-hidden mb-4 transition-shadow`}
    >
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:text-blue-400 text-gray-500"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>
          <h4 className="text-sm font-bold text-gray-200">{block.title}</h4>
        </div>
        <button
          onClick={() => onRemove(block.tempId)}
          className="text-gray-500 hover:text-red-400 p-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <textarea
          className="w-full bg-transparent text-gray-300 text-sm leading-relaxed border-none focus:ring-0 min-h-[100px] resize-none"
          value={block.content}
          onChange={(e) => onUpdateContent(block.tempId, e.target.value)}
        />
      </div>
    </div>
  );
};

interface EditorCanvasProps {
  blocks: ProposedBlock[];
  onReorder: (newBlocks: ProposedBlock[]) => void;
  onRemoveBlock: (tempId: string) => void;
  onUpdateBlockContent: (tempId: string, content: string) => void;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  blocks,
  onReorder,
  onRemoveBlock,
  onUpdateBlockContent,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.tempId === active.id);
      const newIndex = blocks.findIndex((b) => b.tempId === over.id);
      onReorder(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
      {blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-gray-800 rounded-3xl p-12">
          <div className="bg-gray-800/50 p-6 rounded-full mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5">
              <path d="M12 4V20M20 12L4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-300 mb-2">Build your proposal</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            Drag blocks from the library on the right or click them to add them here.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.tempId)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block) => (
              <SortableItem
                key={block.tempId}
                block={block}
                onRemove={onRemoveBlock}
                onUpdateContent={onUpdateBlockContent}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default EditorCanvas;
