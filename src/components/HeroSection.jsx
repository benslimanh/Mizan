import React from 'react'
import { Sparkles, Shield, BarChart3, Link2, FileText } from 'lucide-react'

const HeroSection = () => {
  // Node positions as percentages from top-left (for centering with transform)
  const nodes = [
    { icon: Shield, label: 'Security', x: 20, y: 10, delay: '0s' },
    { icon: BarChart3, label: 'Analytics', x: 85, y: 20, delay: '1s' },
    { icon: Link2, label: 'Blockchain', x: 80, y: 85, delay: '2s' },
    { icon: FileText, label: 'Documents', x: 15, y: 90, delay: '3s' },
  ]

  // Center position for connection lines
  const centerX = 50
  const centerY = 50

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950">
      {/* Background gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/80 to-indigo-950/90"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
          
          {/* Left Side - Content */}
          <div className="text-white space-y-8 order-2 lg:order-1">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Go beyond traditional finance.
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed max-w-xl">
                Discover AI-driven Islamic finance solutions woven into every process.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="solutions.html"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-950 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Explore Solutions
              </a>
              <a
                href="contact.html"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Right Side - Network Visualization */}
          <div className="relative h-[500px] lg:h-[600px] order-1 lg:order-2">
            <div className="relative w-full h-full">
              {/* SVG for connection lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                {nodes.map((node, index) => (
                  <line
                    key={index}
                    x1={`${centerX}%`}
                    y1={`${centerY}%`}
                    x2={`${node.x}%`}
                    y2={`${node.y}%`}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1.5"
                    style={{
                      strokeDasharray: '4,4',
                      animation: `pulse 3s ease-in-out infinite ${node.delay}`,
                    }}
                  />
                ))}
              </svg>

              {/* Central AI/Core System Node */}
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
              >
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-50 animate-pulse-glow"></div>
                  
                  {/* Main icon container */}
                  <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                    <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-4">
                      <Sparkles className="w-12 h-12 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  
                  {/* Pulsing rings */}
                  <div className="absolute inset-0 border-2 border-blue-400/30 rounded-2xl animate-ping" style={{ animationDuration: '3s' }}></div>
                </div>
              </div>

              {/* Surrounding Nodes */}
              {nodes.map((node, index) => {
                const IconComponent = node.icon
                
                return (
                  <div
                    key={index}
                    className="absolute z-10"
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: 'translate(-50%, -50%)',
                      animation: `float 6s ease-in-out infinite ${node.delay}`,
                    }}
                  >
                    <div className="group relative">
                      {/* Node glow */}
                      <div className="absolute inset-0 bg-blue-400/20 rounded-xl blur-md group-hover:bg-blue-400/40 transition-all duration-300"></div>
                      
                      {/* Node card */}
                      <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-xl min-w-[120px]">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-lg p-3 group-hover:from-blue-400/40 group-hover:to-indigo-500/40 transition-all duration-300">
                            <IconComponent className="w-6 h-6 text-white" strokeWidth={2} />
                          </div>
                          <span className="text-white text-sm font-medium">{node.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

