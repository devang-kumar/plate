import React from 'react';

const PAGE_CONTENT: Record<string, { title: string; content: string }> = {
  'terms': {
    title: 'Terms and Conditions',
    content: 'Welcome to PLATES.AE. By using our website, you agree to comply with and be bound by the following terms and conditions of use. All listings are provided for informational purposes only. PLATES.AE acts as a marketplace connecting buyers and sellers. We are not responsible for the accuracy of listings or the outcome of any transactions. All plate transfers must be completed through official UAE RTA channels.'
  },
  'faq': {
    title: 'Frequently Asked Questions',
    content: 'Find answers to common questions about buying and selling plates in the UAE. Q: How do I buy a plate? A: Browse our listings, contact the seller directly, and arrange payment and transfer through official channels. Q: How long does a transfer take? A: RTA transfers typically take 1–3 business days. Q: Can I sell any UAE plate? A: Yes, any registered UAE plate can be listed for sale on our platform.'
  },
  'how-to-buy': {
    title: 'How to Buy',
    content: 'Buying a plate on PLATES.AE is simple. Browse our listings and find the plate you want. Contact the owner directly using the phone number shown on the listing. Agree on a price and arrange an official RTA transfer. The transfer must be done in person at an RTA service center with original documents.'
  },
  'buy-tablet': {
    title: 'Buy a Tablet Online',
    content: 'We offer premium digital tablets for plate display and management. Contact us for current availability and pricing. Our tablets are compatible with all UAE plate formats and ideal for dealers and collectors.'
  },
  'sell': {
    title: 'Sell Your Number',
    content: 'Want to sell your plate? Our platform connects you with thousands of potential buyers in the UAE. Contact us to list your plate — all listings are reviewed before going live. We charge no commission on sales. Simply contact us with your plate details and asking price.'
  },
  'contact': {
    title: 'Contact Us',
    content: 'Get in touch with the PLATES.AE team. Phone: 0509080500 | Email: uaeplate10@gmail.com. We are available Saturday to Thursday, 9am to 9pm UAE time. For plate listing enquiries, please include your plate number and asking price in your message.'
  },
  'about': {
    title: 'About the Company',
    content: 'PLATES.AE is the UAE\'s premier online marketplace dedicated to buying and selling car and motorcycle license plates. Founded in Dubai, we have helped thousands of buyers and sellers connect across all seven emirates. Our mission is to provide a safe, transparent, and easy-to-use platform for the UAE plate market. All listings are verified before publication to ensure accuracy and authenticity.'
  }
};

export default async function StaticPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const page = PAGE_CONTENT[slug] || { title: 'Page Not Found', content: 'The page you are looking for does not exist.' };

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
