import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <title>About Us | Qaoni</title>
      <meta name="description" content="Qaoni brings local shops, artisans, and service providers together in one place — making it easy to discover and support the businesses that make your community unique." />
      <link rel="canonical" href="https://www.qaoni.ca/about" />

      {/* Hero */}
      <section className="bg-brand-primary text-white py-24 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">The universe of small businesses</h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Qaoni brings local shops, artisans, and service providers together in one place —
          making it easier than ever to discover and support the businesses that make your community unique.
        </p>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-6 py-16 max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our mission</h2>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          Small businesses are the backbone of every community. They carry stories, craft, and passion
          that large retailers simply cannot replicate. Yet for many owners, getting that story in front
          of customers has always been hard — expensive websites, scattered social media, and no single
          place where people actually look.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed">
          Qaoni changes that. We give every shop owner a beautiful, fully-featured storefront in minutes,
          and give customers one trusted place to explore everything local businesses have to offer.
        </p>
      </section>

      {/* How it works — two sides */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How Qaoni helps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="w-12 h-12 rounded-full bg-brand-secondary/20 flex items-center justify-center mb-4 text-2xl">🏪</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For business owners</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-2"><span className="text-brand-secondary font-bold">✓</span> Create a professional shop page with your logo, hero image, and story</li>
                <li className="flex gap-2"><span className="text-brand-secondary font-bold">✓</span> Showcase your products and services with photos, prices, and descriptions</li>
                <li className="flex gap-2"><span className="text-brand-secondary font-bold">✓</span> Share your location, contact details, and social media in one place</li>
                <li className="flex gap-2"><span className="text-brand-secondary font-bold">✓</span> Get featured on the homepage and reach new customers every day</li>
                <li className="flex gap-2"><span className="text-brand-secondary font-bold">✓</span> Publish and update your shop anytime — no technical skills needed</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center mb-4 text-2xl">🛍️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For shoppers</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-2"><span className="text-brand-accent font-bold">✓</span> Discover local shops across every category in seconds</li>
                <li className="flex gap-2"><span className="text-brand-accent font-bold">✓</span> Browse products and services from businesses near you</li>
                <li className="flex gap-2"><span className="text-brand-accent font-bold">✓</span> Find shops that deliver directly to your door</li>
                <li className="flex gap-2"><span className="text-brand-accent font-bold">✓</span> Connect with shop owners directly through their contact details</li>
                <li className="flex gap-2"><span className="text-brand-accent font-bold">✓</span> Support your community by choosing local</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-6 py-16 max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">What we stand for</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community first</h3>
            <p className="text-gray-600 text-sm">Every feature we build is designed to strengthen the relationship between local businesses and the people they serve.</p>
          </div>
          <div>
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Simple by design</h3>
            <p className="text-gray-600 text-sm">Setting up a shop should take minutes, not months. We keep things focused so owners can spend time on what matters — their business.</p>
          </div>
          <div>
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Built to grow</h3>
            <p className="text-gray-600 text-sm">Qaoni grows alongside the businesses on it. As our community expands, every shop benefits from more visibility and more customers.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-primary text-white py-16 text-center px-6">
        <h2 className="text-3xl font-bold mb-4">Ready to join Qaoni?</h2>
        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
          Whether you're a shop owner looking to reach more customers, or a shopper looking for something special — Qaoni is your place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/businesses" className="bg-brand-secondary text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition">
            Explore Businesses
          </Link>
          <Link to="/contact" className="bg-white text-brand-primary px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
            Get in touch
          </Link>
        </div>
      </section>

    </div>
  );
}
