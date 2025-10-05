import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  content: string;
  updated_at: string;
}

export default function KnowledgeHubContent({
  activeTab,
}: {
  activeTab: string;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('help_articles')
          .select('id, title, excerpt, category, content, updated_at')
          .eq('is_published', true)
          .eq('category', activeTab)
          .order('priority', { ascending: true });

        if (error) throw error;
        setArticles(data || []);
      } catch (err: unknown) {
        console.error(
          'KnowledgeHubContent loadArticles failed:',
          err instanceof Error ? err.message : String(err)
        );
      } finally {
        setLoading(false);
      }
    }

    if (activeTab) loadArticles();
  }, [activeTab]);

  if (loading)
    return <p className="text-center text-gray-500">Loading content…</p>;

  if (articles.length === 0)
    return (
      <p className="text-center text-gray-400">No published content found.</p>
    );

  return (
    <div className="space-y-6 p-4">
      {articles.map((a) => (
        <article
          key={a.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <h2 className="text-lg font-semibold">{a.title}</h2>
          <p className="text-sm text-gray-500 mb-2">
            {new Date(a.updated_at).toLocaleDateString()}
          </p>
          <p className="text-gray-700 mb-2">{a.excerpt}</p>
          <div
            className="prose max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: a.content }}
          />
        </article>
      ))}
    </div>
  );
}
