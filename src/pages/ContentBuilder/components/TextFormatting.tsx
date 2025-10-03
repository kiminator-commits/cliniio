import React, { memo } from 'react';

interface TextFormattingProps {
  fontFamily: string;
  fontSize: string;
  textColor: string;
  onFontFamilyChange: (font: string) => void;
  onFontSizeChange: (size: string) => void;
  onTextColorChange: (color: string) => void;
  onReset: () => void;
  onBold: () => void;
  onItalic: () => void;
  onHeading2: () => void;
  onHeading3: () => void;
  onBulletList: () => void;
  onNumberedList: () => void;
  onAddNote: () => void;
  onAddWarning: () => void;
  onAddCheck: () => void;
  onInsertLink: () => void;
  onShowTableBuilder: () => void;
  onAISuggestions: () => void;
}

const TextFormatting: React.FC<TextFormattingProps> = memo(
  ({
    fontFamily,
    fontSize,
    textColor,
    onFontFamilyChange,
    onFontSizeChange,
    onTextColorChange,
    onReset,
    onBold,
    onItalic,
    onHeading2,
    onHeading3,
    onBulletList,
    onNumberedList,
    onAddNote,
    onAddWarning,
    onAddCheck,
    onInsertLink,
    onShowTableBuilder,
    onAISuggestions,
  }) => {
    return (
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap items-center gap-1">
        {/* Font Controls */}
        <select
          value={fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
          title="Font Family"
        >
          <optgroup label="Modern Sans-Serif">
            <option value="Inter">Inter - Clean & Modern</option>
            <option value="Roboto">Roboto - Google's Design Font</option>
            <option value="Open Sans">
              Open Sans - Professional & Readable
            </option>
            <option value="Lato">Lato - Friendly & Approachable</option>
            <option value="Nunito">Nunito - Rounded & Modern</option>
          </optgroup>
          <optgroup label="Serif & Display">
            <option value="Merriweather">Merriweather - Elegant Serif</option>
            <option value="Playfair Display">
              Playfair Display - Classic Serif
            </option>
            <option value="Georgia">Georgia - Web-Safe Serif</option>
          </optgroup>
          <optgroup label="Specialty">
            <option value="Source Code Pro">Source Code Pro - For Code</option>
            <option value="Courier New">Courier New - Monospace</option>
          </optgroup>
        </select>

        <select
          value={fontSize}
          onChange={(e) => onFontSizeChange(e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
          title="Font Size"
        >
          <option value="text-xs">Small (12px)</option>
          <option value="text-sm">Regular (14px)</option>
          <option value="text-base">Medium (16px)</option>
          <option value="text-lg">Large (18px)</option>
          <option value="text-xl">Extra Large (20px)</option>
        </select>

        <select
          value={textColor}
          onChange={(e) => onTextColorChange(e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
          title="Text Color"
        >
          <option value="text-gray-900">Default Black</option>
          <option value="text-gray-700">Dark Gray</option>
          <option value="text-blue-600">Professional Blue</option>
          <option value="text-green-600">Success Green</option>
          <option value="text-red-600">Warning Red</option>
          <option value="text-purple-600">Creative Purple</option>
          <option value="text-orange-600">Attention Orange</option>
          <option value="text-indigo-600">Trust Indigo</option>
        </select>

        <button
          onClick={onReset}
          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Reset to Default Font"
        >
          Reset
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text Formatting */}
        <button
          onClick={onBold}
          className="p-2 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          onClick={onItalic}
          className="p-2 text-sm italic text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          onClick={onHeading2}
          className="p-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={onHeading3}
          className="p-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Heading 3"
        >
          H3
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          onClick={onBulletList}
          className="p-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={onNumberedList}
          className="p-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Numbered List"
        >
          1.
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Special Elements */}
        <button
          onClick={onAddNote}
          className="p-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Add Note Block"
        >
          📝
        </button>
        <button
          onClick={onAddWarning}
          className="p-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Add Warning Block"
        >
          ⚠️
        </button>
        <button
          onClick={onAddCheck}
          className="p-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Add Check Block"
        >
          ✅
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Table */}
        <button
          onClick={onShowTableBuilder}
          className="p-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Create Modern Table"
        >
          📊
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Insert Link */}
        <button
          onClick={onInsertLink}
          className="p-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Insert Link (Ctrl+K)"
        >
          🔗
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* AI Helper */}
        <button
          onClick={onAISuggestions}
          className="p-2 text-sm text-purple-700 bg-purple-100 hover:bg-purple-200 rounded transition-colors"
          title="Get AI suggestions for improving your text"
        >
          🤖
        </button>

        {/* Preview */}
        <button
          onClick={() => {}}
          className="p-2 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
          title="Preview lesson content"
        >
          👁️
        </button>
      </div>
    );
  }
);

TextFormatting.displayName = 'TextFormatting';

export default TextFormatting;
