import React from 'react';
import Icon from '@mdi/react';
import { mdiMagnify, mdiChevronDown, mdiChevronUp } from '@mdi/js';

interface SEOMetadataProps {
  collapsedSections: {
    seo: boolean;
  };
  toggleSection: (section: 'seo') => void;
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    canonicalUrl: string;
    ogImage: string;
    structuredData: boolean;
  };
  setSeoSettings: React.Dispatch<
    React.SetStateAction<{
      metaTitle: string;
      metaDescription: string;
      keywords: string;
      canonicalUrl: string;
      ogImage: string;
      structuredData: boolean;
    }>
  >;
}

export const SEOMetadata: React.FC<SEOMetadataProps> = ({
  collapsedSections,
  toggleSection,
  seoSettings,
  setSeoSettings,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50"
        onClick={() => toggleSection('seo')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSection('seo');
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsedSections.seo}
      >
        <div className="flex items-center gap-3">
          <Icon path={mdiMagnify} size={1.2} className="text-indigo-600" />
          <h5 className="text-lg font-medium text-gray-900">
            Course Metadata & SEO Options
          </h5>
        </div>
        <Icon
          path={collapsedSections.seo ? mdiChevronDown : mdiChevronUp}
          size={1}
          className="text-gray-400"
        />
      </div>

      {!collapsedSections.seo && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="meta-title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Meta Title
              </label>
              <input
                id="meta-title"
                type="text"
                value={seoSettings.metaTitle}
                onChange={(e) =>
                  setSeoSettings((prev) => ({
                    ...prev,
                    metaTitle: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                placeholder="SEO-optimized title (50-60 characters)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {seoSettings.metaTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="meta-description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Meta Description
              </label>
              <textarea
                id="meta-description"
                value={seoSettings.metaDescription}
                onChange={(e) =>
                  setSeoSettings((prev) => ({
                    ...prev,
                    metaDescription: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                placeholder="SEO-optimized description (150-160 characters)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {seoSettings.metaDescription.length}/160 characters
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="keywords"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Keywords
            </label>
            <input
              id="keywords"
              type="text"
              value={seoSettings.keywords}
              onChange={(e) =>
                setSeoSettings((prev) => ({
                  ...prev,
                  keywords: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
              placeholder="Enter keywords separated by commas"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="canonical-url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Canonical URL
              </label>
              <input
                id="canonical-url"
                type="url"
                value={seoSettings.canonicalUrl}
                onChange={(e) =>
                  setSeoSettings((prev) => ({
                    ...prev,
                    canonicalUrl: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                placeholder="https://example.com/course"
              />
            </div>

            <div>
              <label
                htmlFor="og-image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Open Graph Image
              </label>
              <input
                id="og-image"
                type="url"
                value={seoSettings.ogImage}
                onChange={(e) =>
                  setSeoSettings((prev) => ({
                    ...prev,
                    ogImage: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOMetadata;
