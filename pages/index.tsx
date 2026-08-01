import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Section {
  title: string;
  description: string;
  icon: string;
}

const features: Section[] = [
  {
    title: 'Easy Assessment Creation',
    description: 'Create professional assessments in minutes with our intuitive builder.',
    icon: '✨',
  },
  {
    title: 'Real-time Analytics',
    description: 'Track responses and analyze results with comprehensive dashboards.',
    icon: '📊',
  },
  {
    title: 'Secure & GDPR Compliant',
    description: 'Enterprise-grade security with full data protection compliance.',
    icon: '🔒',
  },
  {
    title: 'API Integration',
    description: 'Integrate assessments into your existing workflow with our API.',
    icon: '🔗',
  },
  {
    title: 'Custom Branding',
    description: 'White-label assessments with your own branding and domain.',
    icon: '🎨',
  },
  {
    title: '24/7 Support',
    description: 'Dedicated support team available round the clock.',
    icon: '💬',
  },
];

export default function Home() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Head>
        <title>Agviews - Professional Assessment Platform</title>
        <meta
          name="description"
          content="Create, manage, and analyze professional assessments with Agviews"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="container-center flex justify-between items-center py-4">
          <div className="text-2xl font-bold text-blue-600">Agviews</div>
          <div className="flex gap-6 items-center">
            <Link href="#features" className="text-gray-700 hover:text-blue-600">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-blue-600">
              Pricing
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-primary text-white">
        <div className="container-center text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Professional Assessments Made Simple
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
            Create, deploy, and analyze assessments in minutes. Trusted by leading organizations worldwide.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="btn btn-primary bg-blue-600 text-white px-8 py-3 text-lg">
              Start Free Trial
            </Link>
            <button className="btn btn-secondary bg-white text-gray-900 px-8 py-3 text-lg">
              Watch Demo
            </button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-4xl font-bold">50K+</div>
              <div className="text-gray-400">Assessments Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold">500K+</div>
              <div className="text-gray-400">Respondents</div>
            </div>
            <div>
              <div className="text-4xl font-bold">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container-center">
          <h2 className="text-4xl font-bold text-center mb-4">Powerful Features</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Everything you need to create and manage professional assessments
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container-center">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Create', desc: 'Build your assessment' },
              { step: '2', title: 'Customize', desc: 'Add questions and settings' },
              { step: '3', title: 'Deploy', desc: 'Share with respondents' },
              { step: '4', title: 'Analyze', desc: 'Review results and insights' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container-center text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of organizations using Agviews to create better assessments.
          </p>
          <Link href="/register" className="btn bg-white text-blue-600 px-8 py-3 text-lg font-bold hover:bg-gray-100">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container-center">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">Agviews</h4>
              <p className="text-sm">Professional assessment platform</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
                <li><Link href="#">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#">About</Link></li>
                <li><Link href="#">Blog</Link></li>
                <li><Link href="#">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#">Privacy</Link></li>
                <li><Link href="#">Terms</Link></li>
                <li><Link href="#">GDPR</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2024 Agviews. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
