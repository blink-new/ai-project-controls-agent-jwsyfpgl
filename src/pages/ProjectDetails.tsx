import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { ArrowLeft, Calendar, FileText, MessageSquare, ExternalLink, Copy, Download } from 'lucide-react'
import { useToast } from '../hooks/use-toast'

interface Project {
  id: string
  name: string
  description: string
  trackingFocus: string
  scheduleFile: string | null
  createdAt: string
  status: 'active' | 'completed' | 'on-hold'
  contractorUpdates: number
  lastUpdate: string
  shareLink: string
}

interface Update {
  id: string
  timestamp: string
  content: string
  aiQuestions: string[]
  responses: string[]
}

const ProjectDetails = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [updates, setUpdates] = useState<Update[]>([])

  useEffect(() => {
    if (projectId) {
      // Load project data from localStorage
      const savedProjects = localStorage.getItem('projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const currentProject = projects.find((p: Project) => p.id === projectId)
        if (currentProject) {
          setProject(currentProject)
          // Load mock updates
          setUpdates([
            {
              id: '1',
              timestamp: '2024-01-15T10:30:00Z',
              content: 'Foundation work is 75% complete. We encountered some delays due to weather conditions.',
              aiQuestions: [
                'Can you specify which weather conditions caused the delays?',
                'What is the expected completion date for the foundation work?',
                'Are there any additional resources needed to catch up?'
              ],
              responses: [
                'Heavy rain for 3 consecutive days last week',
                'Expected completion by January 20th',
                'We may need an additional concrete crew if weather permits'
              ]
            }
          ])
        }
      }
    }
  }, [projectId])

  const copyShareLink = () => {
    if (project) {
      navigator.clipboard.writeText(project.shareLink)
      toast({
        title: "Link copied!",
        description: "Share this link with your contractors.",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Project not found</h2>
          <p className="text-slate-600 mb-4">The project you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/pm-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/pm-dashboard')}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-slate-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{project.name}</h1>
                <p className="text-sm text-slate-600">Project Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyShareLink}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Contractor Link
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Project Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Created</label>
                  <div className="flex items-center mt-1">
                    <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-sm text-slate-600">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Contractor Updates</label>
                  <div className="flex items-center mt-1">
                    <MessageSquare className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-sm text-slate-600">{project.contractorUpdates} updates</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Last Update</label>
                  <p className="text-sm text-slate-600 mt-1">{project.lastUpdate}</p>
                </div>
              </CardContent>
            </Card>

            {project.scheduleFile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-sm text-slate-600">{project.scheduleFile}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tracking Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  {project.trackingFocus || 'No specific tracking focus areas defined.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="updates" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="updates">Contractor Updates</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="updates" className="space-y-6">
                {updates.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No updates yet</h3>
                      <p className="text-slate-600 mb-6">
                        Share the contractor link to start receiving AI-powered status updates
                      </p>
                      <Button onClick={copyShareLink}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Copy Contractor Link
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {updates.map((update) => (
                      <Card key={update.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">Status Update</CardTitle>
                            <span className="text-sm text-slate-500">
                              {new Date(update.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium text-slate-900 mb-2">Initial Update</h4>
                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{update.content}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-slate-900 mb-3">AI Follow-up Questions & Responses</h4>
                            <div className="space-y-3">
                              {update.aiQuestions.map((question, index) => (
                                <div key={index} className="border-l-4 border-blue-200 pl-4">
                                  <p className="text-sm font-medium text-blue-900 mb-1">Q: {question}</p>
                                  <p className="text-sm text-slate-600">A: {update.responses[index]}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Analytics</CardTitle>
                    <CardDescription>
                      Insights and metrics from contractor updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600">Analytics will be available once you have contractor updates</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Settings</CardTitle>
                    <CardDescription>
                      Manage project configuration and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Contractor Link</h4>
                        <div className="flex">
                          <input 
                            type="text" 
                            value={project.shareLink} 
                            readOnly 
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-l-md bg-slate-50 text-sm"
                          />
                          <Button 
                            onClick={copyShareLink}
                            className="rounded-l-none"
                            variant="outline"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Project Status</h4>
                        <select className="px-3 py-2 border border-slate-300 rounded-md text-sm">
                          <option value="active">Active</option>
                          <option value="on-hold">On Hold</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProjectDetails