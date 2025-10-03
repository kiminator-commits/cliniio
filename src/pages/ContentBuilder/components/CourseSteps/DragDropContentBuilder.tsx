import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiDrag,
  mdiPlus,
  mdiTrashCan,
  mdiContentCopy,
  mdiArrowUp,
  mdiArrowDown,
  mdiFormatText,
  mdiImage,
  mdiVideo,
  mdiFileDocument,
  mdiLink,
} from '@mdi/js';

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'file' | 'link';
  content: string;
  metadata?: {
    url?: string;
    alt?: string;
    caption?: string;
    duration?: number;
    size?: string;
  };
  order: number;
}

interface DragDropContentBuilderProps {
  blocks: ContentBlock[];
  onBlocksChange: (blocks: ContentBlock[]) => void;
  onEditBlock: (block: ContentBlock) => void;
  className?: string;
}

const DragDropContentBuilder: React.FC<DragDropContentBuilderProps> = ({
  blocks,
  onBlocksChange,
  onEditBlock,
  className = '',
}) => {
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const getBlockIcon = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text':
        return mdiFormatText;
      case 'image':
        return mdiImage;
      case 'video':
        return mdiVideo;
      case 'file':
        return mdiFileDocument;
      case 'link':
        return mdiLink;
      default:
        return mdiFormatText;
    }
  };

  const getBlockColor = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text':
        return 'border-blue-200 bg-blue-50';
      case 'image':
        return 'border-green-200 bg-green-50';
      case 'video':
        return 'border-purple-200 bg-purple-50';
      case 'file':
        return 'border-orange-200 bg-orange-50';
      case 'link':
        return 'border-indigo-200 bg-indigo-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getBlockPreview = (block: ContentBlock): string => {
    switch (block.type) {
      case 'text': {
        const textContent = block.content.replace(/<[^>]*>/g, ''); // Strip HTML
        return textContent.length > 100
          ? textContent.substring(0, 100) + '...'
          : textContent;
      }
      case 'image':
        return block.metadata?.alt || block.metadata?.url || 'Image content';
      case 'video':
        return block.metadata?.url || 'Video content';
      case 'file':
        return block.metadata?.url || 'File attachment';
      case 'link':
        return `${block.content} (${block.metadata?.url || 'No URL'})`;
      default:
        return 'Content block';
    }
  };

  const addNewBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.random()}`,
      type,
      content: '',
      order: blocks.length,
      metadata: {},
    };

    const updatedBlocks = [...blocks, newBlock];
    onBlocksChange(updatedBlocks);
    onEditBlock(newBlock);
  };

  const duplicateBlock = (blockId: string) => {
    const originalBlock = blocks.find((b) => b.id === blockId);
    if (!originalBlock) return;

    const duplicatedBlock: ContentBlock = {
      ...originalBlock,
      id: `block-${Date.now()}-${Math.random()}`,
      order: originalBlock.order + 1,
    };

    const updatedBlocks = blocks
      .map((block) =>
        block.order > originalBlock.order
          ? { ...block, order: block.order + 1 }
          : block
      )
      .concat(duplicatedBlock)
      .sort((a, b) => a.order - b.order);

    onBlocksChange(updatedBlocks);
  };

  const removeBlock = (blockId: string) => {
    const updatedBlocks = blocks
      .filter((block) => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index }));

    onBlocksChange(updatedBlocks);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex((b) => b.id === blockId);
    if (blockIndex === -1) return;

    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const updatedBlocks = [...blocks];
    [updatedBlocks[blockIndex], updatedBlocks[newIndex]] = [
      updatedBlocks[newIndex],
      updatedBlocks[blockIndex],
    ];

    // Update order values
    updatedBlocks.forEach((block, index) => {
      block.order = index;
    });

    onBlocksChange(updatedBlocks);
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();

    if (!draggedBlock) return;

    const draggedIndex = blocks.findIndex((b) => b.id === draggedBlock);
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    const updatedBlocks = [...blocks];
    const [draggedItem] = updatedBlocks.splice(draggedIndex, 1);
    updatedBlocks.splice(targetIndex, 0, draggedItem);

    // Update order values
    updatedBlocks.forEach((block, index) => {
      block.order = index;
    });

    onBlocksChange(updatedBlocks);
    setDraggedBlock(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
    setDragOverIndex(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Add Block Buttons */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-700 mr-2">
          Add content:
        </span>
        {[
          { type: 'text' as const, label: 'Text', icon: mdiFormatText },
          { type: 'image' as const, label: 'Image', icon: mdiImage },
          { type: 'video' as const, label: 'Video', icon: mdiVideo },
          { type: 'file' as const, label: 'File', icon: mdiFileDocument },
          { type: 'link' as const, label: 'Link', icon: mdiLink },
        ].map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => addNewBlock(type)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
          >
            <Icon path={icon} size={0.7} />
            {label}
          </button>
        ))}
      </div>

      {/* Content Blocks */}
      <div className="space-y-3">
        {blocks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Icon
              path={mdiPlus}
              size={3}
              className="mx-auto text-gray-300 mb-4"
            />
            <p className="text-lg font-medium">No content blocks yet</p>
            <p className="text-sm">
              Add your first content block using the buttons above
            </p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                group relative border-2 rounded-lg p-4 cursor-move transition-all
                ${draggedBlock === block.id ? 'opacity-50' : ''}
                ${dragOverIndex === index ? 'border-blue-500 bg-blue-50' : getBlockColor(block.type)}
                hover:shadow-md
              `}
            >
              {/* Drag Handle */}
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon path={mdiDrag} size={0.8} className="text-gray-400" />
              </div>

              {/* Block Content */}
              <div className="ml-6 pr-20">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    path={getBlockIcon(block.type)}
                    size={0.8}
                    className="text-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {block.type} Block
                  </span>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>

                <div
                  className="text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => onEditBlock(block)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onEditBlock(block);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Edit ${block.type} block ${index + 1}`}
                >
                  {getBlockPreview(block) || (
                    <span className="italic text-gray-400">
                      Click to add content...
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveBlock(block.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <Icon path={mdiArrowUp} size={0.7} />
                  </button>

                  <button
                    onClick={() => moveBlock(block.id, 'down')}
                    disabled={index === blocks.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <Icon path={mdiArrowDown} size={0.7} />
                  </button>

                  <button
                    onClick={() => duplicateBlock(block.id)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Duplicate"
                  >
                    <Icon path={mdiContentCopy} size={0.7} />
                  </button>

                  <button
                    onClick={() => removeBlock(block.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Icon path={mdiTrashCan} size={0.7} />
                  </button>
                </div>
              </div>

              {/* Drop indicator */}
              {dragOverIndex === index && draggedBlock !== block.id && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DragDropContentBuilder;
