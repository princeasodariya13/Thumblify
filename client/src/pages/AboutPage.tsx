import SoftBackdrop from "../components/SoftBackdrop";
import { Zap, Brain, Palette, Users, AlertTriangle, Video, Sparkles, CheckIcon } from 'lucide-react';


const AboutPage = () => {
 const specialFeatures = [
    "No design skill needed",
    "Fast generation",
    "High CTR templates",
  ];

  return (
    <>
      {/* Background glow from hero section + SoftBackdrop */}
      <SoftBackdrop />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        
        {/* ========== ABOUT SECTION (styled like hero section badge) ========== */}
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-28">
          <div className="flex justify-center">
            <div className="group inline-flex items-center gap-2 rounded-full p-1 pr-3 bg-pink-200/15">
              <span className="bg-pink-800 text-white text-xs px-3.5 py-1 rounded-full">
                About
              </span>
              <p className="flex items-center gap-1 text-pink-100 text-sm">
                <span>AI-powered thumbnail generator</span>
              </p>
            </div>
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight">
            Thumblify
          </h1>
          <p className="mt-6 text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Thumblify is an AI powered thumbnail generator which helps the creators to quickly design eye-catching, high CTR thumbnails for YouTube videos, blogs and social media posts.
          </p>
        </div>

        {/* ========== WHY CHOOSE US SECTION ========== */}
        <div className="mb-20 md:mb-28">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              Why Choose Us?
            </h2>
            <p className="text-slate-300 text-base">
              Its smart thumbnail creator and analysis tool that produces vibrant and optimized thumbnails to boost views and engagement.
            </p>
          </div>

          {/* Features Grid - glassmorphic cards matching hero style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Lightning Fast */}
            <div className="bg-pink-200/5 backdrop-blur-sm border border-pink-900/30 rounded-2xl p-6 hover:bg-pink-200/10 transition-all duration-300">
              <div className="w-12 h-12 bg-pink-800/30 rounded-xl flex items-center justify-center mb-4 text-pink-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-slate-300 font-medium mb-2">Generate professional thumbnails in seconds</p>
              <p className="text-slate-400 text-sm">Users can generate professional results in a few seconds, making designs to</p>
            </div>

            {/* AI Powered */}
            <div className="bg-pink-200/5 backdrop-blur-sm border border-pink-900/30 rounded-2xl p-6 hover:bg-pink-200/10 transition-all duration-300">
              <div className="w-12 h-12 bg-pink-800/30 rounded-xl flex items-center justify-center mb-4 text-pink-400">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Powered</h3>
              <p className="text-slate-400">Using state-of-the-art AI to optimize for clicks.</p>
            </div>

            {/* Fully Customizable */}
            <div className="bg-pink-200/5 backdrop-blur-sm border border-pink-900/30 rounded-2xl p-6 hover:bg-pink-200/10 transition-all duration-300">
              <div className="w-12 h-12 bg-pink-800/30 rounded-xl flex items-center justify-center mb-4 text-pink-400">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fully Customizable</h3>
              <p className="text-slate-400">Edit every detail to match your brand's unique style.</p>
            </div>

            {/* Built for Small Channels */}
            <div className="bg-pink-200/5 backdrop-blur-sm border border-pink-900/30 rounded-2xl p-6 hover:bg-pink-200/10 transition-all duration-300">
              <div className="w-12 h-12 bg-pink-800/30 rounded-xl flex items-center justify-center mb-4 text-pink-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Built for Small Channels</h3>
              <p className="text-slate-300 font-medium">Thumbnails Without Design Skills</p>
            </div>
          </div>
        </div>

        {/* ========== STOP LOSING CLICKS SECTION ========== */}
        <div className="bg-pink-200/5 backdrop-blur-sm border border-pink-900/30 rounded-3xl p-6 md:p-10 lg:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left content - exact text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-800/40 text-pink-300 rounded-full text-sm font-semibold tracking-wide mb-5">
                <AlertTriangle className="w-4 h-4" />
                <span>Stop Losing Clicks</span>
              </div>
              <div className="space-y-4 text-slate-200">
                <p className="text-base md:text-lg leading-relaxed">
                  Made for solo YouTubers doing everything themselves - no designer, no team, no complicated tools.
                </p>
                <p className="text-base md:text-lg leading-relaxed">
                  Describe your video and let AI generate thumbnails you can tweak in minutes, even if you've never designed before.
                </p>
                <p className="text-base md:text-lg leading-relaxed font-medium text-pink-300">
                  Create better looking thumbnails fast so your videos don't get ignored - even with a small audience.
                </p>
              </div>

              {/* Special features list matching hero section */}
              <div className="flex flex-wrap gap-4 mt-8">
                {specialFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckIcon className="size-5 text-pink-500" />
                    <span className="text-slate-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - decorative thumbnail preview */}
            <div className="relative hidden md:block">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-pink-900/30 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 h-2 w-full"></div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-600 to-rose-600 rounded-full flex items-center justify-center">
                      <Video className="w-4 h-4 text-white" />
                    </div>
                    <div className="h-2 w-24 bg-slate-700 rounded-full"></div>
                    <div className="h-2 w-16 bg-slate-700 rounded-full"></div>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-pink-900/40 to-slate-800 rounded-lg mb-3 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-pink-400" />
                  </div>
                  <div className="h-3 w-3/4 bg-slate-700 rounded-full mb-2"></div>
                  <div className="h-2 w-1/2 bg-slate-700 rounded-full"></div>
                </div>
              </div>
              <div className="absolute -bottom-3 -left-3 w-24 h-24 bg-pink-600/20 rounded-full blur-2xl -z-10"></div>
              <div className="absolute -top-3 -right-3 w-32 h-32 bg-rose-600/20 rounded-full blur-2xl -z-10"></div>
            </div>
          </div>
        </div>

        {/* subtle footer note */}
        <div className="mt-16 text-center text-xs text-slate-500">
          AI-powered thumbnail generator • high CTR optimization
        </div>
      </div>
    </>
  );
};

export default AboutPage