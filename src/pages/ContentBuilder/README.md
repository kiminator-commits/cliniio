# Content Builder

A lightweight content creation system for building courses, policies, procedures, SDS sheets, and learning pathways.

## Features

### 🎯 Content Types

- **Courses** - Interactive learning modules with assessments
- **Policies** - Organizational rules and guidelines
- **Procedures** - Step-by-step operational instructions
- **SDS Sheets** - Safety data sheets and chemical information
- **Learning Pathways** - Combined learning experiences

### 🤖 AI-Powered Suggestions

- Content gap analysis based on usage data
- Improvement recommendations for existing content
- New topic suggestions based on industry trends
- Priority-based suggestions with confidence scores

### 📁 Media Management

- Support for multiple media types (images, videos, audio, documents)
- 50MB file size limit per file
- Drag & drop upload interface
- Media library organization

### 📝 Rich Content Editor

- Markdown support for rich formatting
- Tag management system
- Difficulty level classification
- Duration estimation
- Department categorization

### 🔄 Publishing Workflow

- Draft → Review → Publish workflow
- Content versioning and history
- Library integration
- Knowledge Hub synchronization

## Architecture

### Lightweight Design

- Context-based state management (useReducer)
- Lazy-loaded components
- Efficient media handling
- Minimal bundle impact

### Integration Points

- **Settings** → Content Management → Launch Builder
- **Content Builder** → Library → Knowledge Hub
- Supabase integration for data persistence
- Real-time collaboration support

## Usage

1. Navigate to **Settings** → **Content Management**
2. Click **Launch Builder** button
3. Select content type from sidebar
4. Fill in content details and metadata
5. Upload and attach media files
6. Review AI suggestions for improvements
7. Save draft or publish to Library

## File Structure

```
src/pages/ContentBuilder/
├── index.tsx                 # Main Content Builder page
├── index.ts                  # Export file for lazy loading
├── README.md                 # This documentation
├── context/
│   └── ContentBuilderContext.tsx  # State management
└── components/
    ├── ContentTypeSelector.tsx    # Content type selection
    ├── ContentEditor.tsx          # Main content editor
    ├── MediaLibrary.tsx           # Media upload/management
    └── AISuggestions.tsx          # AI content suggestions
```

## Media Support

### File Types

- **Images**: JPEG, PNG, GIF, WebP, HEIC, HEIF
- **Videos**: MP4, WebM, MOV, AVI
- **Audio**: MP3, WAV, AAC, OGG
- **Documents**: PDF, Word, Text
- **Presentations**: PowerPoint
- **Spreadsheets**: Excel

### Storage

- Supabase storage buckets
- Efficient file compression
- CDN integration for fast delivery
- Automatic thumbnail generation

## AI Suggestions

The AI system analyzes:

- Content gaps in user searches
- User feedback and ratings
- Industry best practices
- Regulatory requirements
- Usage patterns and trends

## Future Enhancements

- Rich text editor with WYSIWYG interface
- Advanced media editing tools
- Collaborative editing features
- Content templates and themes
- Advanced analytics and reporting
- Integration with external LMS systems
