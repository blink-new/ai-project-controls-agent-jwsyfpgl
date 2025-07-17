import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Users, MessageSquare, BarChart3, Zap, ArrowRight, CheckCircle } from 'lucide-react'

const LandingPage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "AI-Powered Chat Interface",
      description: "Contractors provide updates through intelligent conversations that extract meaningful project details."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Smart Progress Tracking",
      description: "AI analyzes project schedules and asks targeted follow-up questions for accurate status updates."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Dual Interface Design",
      description: "Separate optimized experiences for project managers and contractors with role-specific features."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Intelligent Follow-ups",
      description: "Context-aware AI asks the right questions based on uploaded schedules and project requirements."
    }
  ]

  const benefits = [
    "Eliminate vague status updates",
    "Reduce project delays",
    "Streamline communication",
    "Improve project visibility",
    "Automate progress consolidation",
    "Enhance project controls"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">AI Project Controls</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/pm-dashboard')}>
                Project Manager
              </Button>
              <Button variant="ghost" onClick={() => navigate('/contractor')}>
                Contractor
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Transform Project Tracking with{' '}
              <span className="text-primary">AI Intelligence</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Streamline project controls by enabling contractors to provide status updates through an AI chat interface that asks intelligent follow-up questions, while project managers monitor progress efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/pm-dashboard')}
              >
                Start as Project Manager
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/contractor')}
              >
                I'm a Contractor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Intelligent Project Controls
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform revolutionizes how project teams track progress and communicate updates.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Solve Project Tracking Challenges
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Traditional project tracking suffers from vague updates, communication delays, and ineffective consolidation. Our AI agent transforms this process by asking intelligent questions and extracting meaningful insights.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">AI Agent</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        "Can you provide more details about the foundation work progress? What percentage is complete and are there any blockers?"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Contractor</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        "Foundation is 75% complete. We're waiting on rebar delivery scheduled for tomorrow. Should be back on track by Friday."
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Project Controls?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join project teams who are already using AI to streamline their tracking and communication processes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/pm-dashboard')}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-muted-foreground">
              AI Project Controls Agent - Streamlining project tracking with intelligent conversations
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage