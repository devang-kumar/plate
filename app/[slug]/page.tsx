import React from 'react';

const PAGE_CONTENT: Record<string, { title: string; content: string }> = {
  'terms': {
    title: 'Terms and Conditions',
    content: 'Welcome to PLATES.AE. By using our website, you agree to comply with and be bound by the following terms and conditions of use...'
  },
  'faq': {
    title: 'Frequently Asked Questions',
    content: 'Find answers to common questions about buying and selling plates in the UAE...'
  },
  'how-to-buy': {
    title: 'How to Buy',
    content: 'Buying a plate on PLATES.AE is simple. Browse our listings, contact the owner, and arrange the transfer...'
  },
  'buy-tablet': {
    title: 'Buy a Tablet Online',
    content: 'We offer premium digital tablets for plate display and management. Contact us for availability...'
  },
  'sell': {
    title: 'Sell Your Number',
    content: 'Want to sell your plate? Our platform connects you with thousands of potential buyers in the UAE...'
  }
};

export default function StaticPage({ params }: { params: { slug: string } }) {
  const page = PAGE_CONTENT[params.slug] || { title: 'Page Not Found', content: 'The page you are looking for does not exist.' };

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-10 my-10 bg-white rounded-lg min-h-[400px] shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
      <h1 className="text-primary-red text-3xl font-bold mb-6 border-b pb-4">
        {page.title}
      </h1>
      <div className="text-[#333] leading-relaxed text-lg">
        <p>{page.content}</p>
        <p className="mt-8 italic text-gray-400">This is a placeholder for the full {page.title} content. You can edit this in the Next.js source code.</p>
      </div>
    </div>
  );
}
