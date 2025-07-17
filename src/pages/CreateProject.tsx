import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { ArrowLeft, Upload, FileText, CheckCircle, Loader2 } from 'lucide-react'
import { blink } from '../blink/client'

const CreateProject = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    trackingFocusAreas: ''
  })
  const [scheduleFile, setScheduleFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (isValidFileType(file)) {
        setScheduleFile(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (isValidFileType(file)) {
        setScheduleFile(file)
      }
    }
  }

  const isValidFileType = (file: File) => {
    const validTypes = ['.xer', '.mpp', '.pdf', '.xls', '.xlsx']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    return validTypes.includes(fileExtension)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      // Upload schedule file if provided
      let scheduleFileName = ''
      let scheduleFileUrl = ''
      
      if (scheduleFile) {
        const uploadResult = await blink.storage.upload(
          scheduleFile,
          `schedules/${Date.now()}-${scheduleFile.name}`,
          { upsert: true }
        )
        scheduleFileUrl = uploadResult.publicUrl
        scheduleFileName = scheduleFile.name
      }

      // Create project in database
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const contractorLink = `${window.location.origin}/chat/${projectId}`

      const project = await blink.db.projects.create({
        id: projectId,
        userId: user.id,
        projectName: formData.projectName,
        description: formData.description,
        trackingFocusAreas: formData.trackingFocusAreas,
        scheduleFileName,
        scheduleFileUrl,
        contractorLink,
        createdAt: new Date().toISOString(),
        updatesCount: 0
      })

      // If schedule file was uploaded, analyze it with AI
      if (scheduleFileUrl) {
        try {
          const scheduleAnalysis = await blink.ai.generateText({
            prompt: `Analyze this project schedule and extract key information that would be useful for tracking project progress. Focus on:
            1. Major milestones and deliverables
            2. Critical path activities
            3. Key dependencies
            4. Resource requirements
            5. Timeline phases
            
            Project: ${formData.projectName}
            Description: ${formData.description}
            Focus Areas: ${formData.trackingFocusAreas}
            
            Please provide a structured summary that an AI agent can use to ask intelligent follow-up questions to contractors about project status.`,
            model: 'gpt-4o-mini'
          })

          // Store the analysis for the AI agent to use later
          await blink.db.projectAnalysis.create({
            id: `analysis_${projectId}`,
            projectId,
            scheduleAnalysis: scheduleAnalysis.text,
            createdAt: new Date().toISOString()
          })
        } catch (error) {
          console.error('Error analyzing schedule:', error)
          // Continue even if analysis fails
        }
      }

      // Navigate to project details
      navigate(`/project/${projectId}`)
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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
            <CardDescription>Please sign in to create a project</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => blink.auth.login()}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/pm-dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <span className="text-xl font-semibold text-foreground">Create New Project</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Project</h1>
          <p className="text-muted-foreground">
            Set up a new project to start tracking contractor updates with AI assistance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Provide basic details about your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Brief Project Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the project scope, objectives, and key deliverables"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingFocusAreas">Tracking Focus Areas *</Label>
                <Textarea
                  id="trackingFocusAreas"
                  name="trackingFocusAreas"
                  value={formData.trackingFocusAreas}
                  onChange={handleInputChange}
                  placeholder="Please describe a few examples of good status updates by a contractor. For example: 'Foundation work is 75% complete with concrete pouring scheduled for tomorrow' or 'Electrical rough-in completed on floors 1-3, awaiting inspection before proceeding to floor 4'"
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Schedule (Optional)</CardTitle>
              <CardDescription>
                Upload your project schedule to enable AI-powered intelligent questioning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {scheduleFile ? (
                  <div className="space-y-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-foreground">{scheduleFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(scheduleFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setScheduleFile(null)}
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-foreground">
                        Drop your schedule file here, or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports XER, MPP, PDF, XLS, and XLSX files
                      </p>
                    </div>
                    <input
                      type="file"
                      id="scheduleFile"
                      className="hidden"
                      accept=".xer,.mpp,.pdf,.xls,.xlsx"
                      onChange={handleFileSelect}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('scheduleFile')?.click()}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/pm-dashboard')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.projectName || !formData.description || !formData.trackingFocusAreas}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Project...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProject