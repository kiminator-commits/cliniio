import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RichTextEditor from './RichTextEditor';
import MediaUploadZone from './MediaUploadZone';
import DragDropContentBuilder from './DragDropContentBuilder';

describe('Rich Content Creation Components', () => {
  describe('RichTextEditor', () => {
    it('renders with placeholder text', () => {
      const mockOnChange = vi.fn();
      render(
        <RichTextEditor
          value=""
          onChange={mockOnChange}
          placeholder="Test placeholder"
        />
      );

      // Check that the contentEditable div is rendered with the placeholder
      const editor = screen.getByText('', {
        selector: '[contenteditable="true"]',
      });
      expect(editor).toBeInTheDocument();
      expect(editor).toHaveAttribute('data-placeholder', 'Test placeholder');
    });

    it('renders contentEditable editor', () => {
      const mockOnChange = vi.fn();
      render(<RichTextEditor value="" onChange={mockOnChange} />);

      // Check that the contentEditable div is rendered
      const editor = screen.getByText('', {
        selector: '[contenteditable="true"]',
      });
      expect(editor).toBeInTheDocument();
      expect(editor).toHaveAttribute('contenteditable', 'true');
    });
  });

  describe('MediaUploadZone', () => {
    it('renders upload zone with instructions', () => {
      const mockOnFileUpload = vi.fn();
      render(<MediaUploadZone onFileUpload={mockOnFileUpload} />);

      expect(
        screen.getByText('Drop files here or click to upload')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Support for images, videos, and documents/)
      ).toBeInTheDocument();
    });

    it('shows accepted file types', () => {
      const mockOnFileUpload = vi.fn();
      render(
        <MediaUploadZone
          onFileUpload={mockOnFileUpload}
          acceptedTypes={['image/*', '.pdf']}
        />
      );

      expect(screen.getByText('image/*')).toBeInTheDocument();
      expect(screen.getByText('.pdf')).toBeInTheDocument();
    });
  });

  describe('DragDropContentBuilder', () => {
    const mockBlocks = [
      {
        id: 'block-1',
        type: 'text' as const,
        content: 'Sample text content',
        order: 0,
      },
      {
        id: 'block-2',
        type: 'image' as const,
        content: '',
        metadata: { url: 'https://example.com/image.jpg', alt: 'Sample image' },
        order: 1,
      },
    ];

    it('renders content blocks', () => {
      const mockOnBlocksChange = vi.fn();
      const mockOnEditBlock = vi.fn();

      render(
        <DragDropContentBuilder
          blocks={mockBlocks}
          onBlocksChange={mockOnBlocksChange}
          onEditBlock={mockOnEditBlock}
        />
      );

      // Check that the content is rendered
      expect(screen.getByText('Sample text content')).toBeInTheDocument();
      expect(screen.getByText('Sample image')).toBeInTheDocument();

      // Check that block numbers are shown
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
    });

    it('shows add content buttons', () => {
      const mockOnBlocksChange = vi.fn();
      const mockOnEditBlock = vi.fn();

      render(
        <DragDropContentBuilder
          blocks={[]}
          onBlocksChange={mockOnBlocksChange}
          onEditBlock={mockOnEditBlock}
        />
      );

      expect(screen.getByText('Add content:')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
      expect(screen.getByText('Image')).toBeInTheDocument();
      expect(screen.getByText('Video')).toBeInTheDocument();
      expect(screen.getByText('File')).toBeInTheDocument();
      expect(screen.getByText('Link')).toBeInTheDocument();
    });

    it('shows empty state when no blocks', () => {
      const mockOnBlocksChange = vi.fn();
      const mockOnEditBlock = vi.fn();

      render(
        <DragDropContentBuilder
          blocks={[]}
          onBlocksChange={mockOnBlocksChange}
          onEditBlock={mockOnEditBlock}
        />
      );

      expect(screen.getByText('No content blocks yet')).toBeInTheDocument();
      expect(
        screen.getByText('Add your first content block using the buttons above')
      ).toBeInTheDocument();
    });

    it('calls onEditBlock when content is clicked', () => {
      const mockOnBlocksChange = vi.fn();
      const mockOnEditBlock = vi.fn();

      render(
        <DragDropContentBuilder
          blocks={mockBlocks}
          onBlocksChange={mockOnBlocksChange}
          onEditBlock={mockOnEditBlock}
        />
      );

      const textContent = screen.getByText('Sample text content');
      fireEvent.click(textContent);

      expect(mockOnEditBlock).toHaveBeenCalledWith(mockBlocks[0]);
    });
  });
});
