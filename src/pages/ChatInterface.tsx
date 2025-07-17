import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { ArrowLeft, Send, Bot, User, Loader2, MessageSquare } from 'lucide-react'
import { blink } from '../blink/client'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface Project {
  id: string
  projectName: string
  description: string
  trackingFocusAreas: string
  scheduleFileName?: string
  userId: string
}

interface ProjectAnalysis {
  id: string
  projectId: string
  scheduleAnalysis: string
  createdAt: string
}

const ChatInterface = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [projectAnalysis, setProjectAnalysis] = useState<ProjectAnalysis | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user && projectId) {
        loadProjectData()
      }
      setInitialLoading(false)
    })
    return unsubscribe
  }, [projectId, loadProjectData])

  const loadProjectData = useCallback(async () => {
    if (!projectId) return

    try {
      // Load project data
      const projectData = await blink.db.projects.list({
        where: { id: projectId },
        limit: 1
      })

      if (projectData.length > 0) {
        const currentProject = projectData[0]
        setProject(currentProject)

        // Try to load project analysis
        try {
          const analysisData = await blink.db.projectAnalysis.list({
            where: { projectId },
            limit: 1
          })
          if (analysisData.length > 0) {
            setProjectAnalysis(analysisData[0])
          }
        } catch (error) {
          console.log('No project analysis found, continuing without it')
        }

        // Initialize with welcome message
        const welcomeMessage: Message = {
          id: '1',
          type: 'ai',
          content: `Hello! I'm your AI Project Controls Agent for "${currentProject.projectName}". I'm here to help you provide detailed status updates that will be valuable for project tracking.\n\nBased on the project focus areas, I'll ask intelligent follow-up questions to ensure we capture all the important details. Let's start - what progress would you like to report today?`,
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error('Error loading project data:', error)
    }
  }, [projectId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateAIResponse = async (userMessage: string, conversationHistory: Message[]): Promise<string> => {
    try {
      // Build context for the AI
      let context = `You are an AI Project Controls Agent helping contractors provide detailed status updates for project tracking.

Project: ${project?.projectName}
Description: ${project?.description}
Focus Areas: ${project?.trackingFocusAreas}
`

      if (projectAnalysis) {
        context += `\nProject Schedule Analysis: ${projectAnalysis.scheduleAnalysis}\n`
      }

      context += `
Your role is to:
1. Ask intelligent follow-up questions to get specific, actionable project status information
2. Focus on details that would be valuable for project managers to track progress
3. Ask about timelines, percentages, blockers, dependencies, quality, and next steps
4. Keep questions conversational but professional
5. Don't ask more than 2-3 questions at once

Conversation history:
${conversationHistory.slice(-6).map(msg => `${msg.type === 'user' ? 'Contractor' : 'AI Agent'}: ${msg.content}`).join('\n')}

Latest contractor message: ${userMessage}

Respond as the AI Project Controls Agent with intelligent follow-up questions or acknowledgments. Be helpful and professional.`

      const response = await blink.ai.generateText({
        prompt: context,
        model: 'gpt-4o-mini',
        maxTokens: 300
      })

      return response.text
    } catch (error) {
      console.error('Error generating AI response:', error)
      return "I apologize, but I'm having trouble processing your message right now. Could you please try again? In the meantime, feel free to provide any additional details about your project progress."
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Generate AI response
      const aiResponseText = await generateAIResponse(inputValue, [...messages, userMessage])
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponseText,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiResponse])

      // Store the conversation in the database for project tracking
      try {
        await blink.db.statusUpdates.create({
          id: `update_${Date.now()}`,
          projectId: projectId!,
          userId: user.id,
          userMessage: inputValue,
          aiResponse: aiResponseText,
          timestamp: new Date().toISOString()
        })

        // Update project's update count
        if (project) {
          await blink.db.projects.update(project.id, {
            updatesCount: (project.updatesCount || 0) + 1,
            lastUpdate: new Date().toISOString()
          })
        }
      } catch (dbError) {
        console.error('Error storing conversation:', dbError)
        // Continue even if database storage fails
      }

    } catch (error) {
      console.error('Error in chat:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm experiencing some technical difficulties. Please try your message again, and I'll do my best to help you provide a detailed status update.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat interface...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the chat interface</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => blink.auth.login()}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/contractor')}>
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm flex-shrink-0 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/contractor')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
              <div className="h-6 w-px bg-border"></div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{project.projectName}</h1>
                <p className="text-sm text-muted-foreground">AI Project Controls Agent</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">AI Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-accent/20' 
                      : 'bg-primary/20'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-accent" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className={`rounded-lg px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-white border border-border text-foreground shadow-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-accent-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-3xl">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-white border border-border rounded-lg px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">AI is analyzing your update...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <Card className="flex-shrink-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your status update here..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Context Card */}
      <div className="border-t bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Focus Areas:</span>
                <span className="text-foreground font-medium truncate max-w-md">
                  {project.trackingFocusAreas}
                </span>
              </div>
            </div>
            {project.scheduleFileName && (
              <div className="text-muted-foreground">
                Schedule: {project.scheduleFileName}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface