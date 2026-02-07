'use client'

import { useState } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Copy, Check, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

// TypeScript interfaces based on actual response structure
interface CarouselSlide {
  slide_number: number
  headline: string
  supporting_text: string
  visual_suggestion: string
  design_notes: string
}

interface Caption {
  full_caption: string
  hook: string
  body: string
  cta: string
}

interface Hashtags {
  broad: string[]
  niche: string[]
  authority: string[]
  all_hashtags: string
}

interface PostingRecommendations {
  best_times: string[]
  best_days: string[]
  reasoning: string
}

interface CarouselResponse {
  carousel_slides: CarouselSlide[]
  caption: Caption
  hashtags: Hashtags
  alternative_hooks: string[]
  alternative_ctas: string[]
  posting_recommendations: PostingRecommendations
  engagement_questions: string[]
  content_strategy_notes: string
}

interface FormData {
  topic: string
  targetAudience: string
  primaryGoal: string
  tone: string
  contentDepth: string
  ctaType: string
  industry: string
  examples: string
}

const AGENT_ID = '6986f22ce31e7bbb7ef45a62'

const TONE_CHIPS = ['Bold', 'Conversational', 'Authoritative', 'Empathetic']
const PRIMARY_GOALS = ['Educate', 'Lead Gen', 'Personal Brand', 'Sales']
const CONTENT_DEPTHS = ['Beginner', 'Intermediate', 'Advanced']
const CTA_TYPES = ['Comment', 'Follow', 'DM', 'Save', 'Share']

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    targetAudience: '',
    primaryGoal: 'Educate',
    tone: 'Bold',
    contentDepth: 'Intermediate',
    ctaType: 'Comment',
    industry: '',
    examples: ''
  })

  const [response, setResponse] = useState<CarouselResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'slides' | 'caption' | 'hashtags' | 'extras'>('slides')
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [showExamples, setShowExamples] = useState(false)
  const [showOutput, setShowOutput] = useState(false)

  const handleCopy = async (text: string, key: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedStates(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }))
      }, 2000)
    }
  }

  const buildPrompt = () => {
    let prompt = `${formData.topic}`

    if (formData.targetAudience) {
      prompt += `. Target audience: ${formData.targetAudience}`
    }

    prompt += `. Goal: ${formData.primaryGoal}`
    prompt += `. Tone: ${formData.tone}`
    prompt += `. Content Depth: ${formData.contentDepth}`
    prompt += `. CTA: ${formData.ctaType}`

    if (formData.industry) {
      prompt += ` in the ${formData.industry} industry`
    }

    if (formData.examples) {
      prompt += `. Examples/Inspiration: ${formData.examples}`
    }

    return prompt
  }

  const handleGenerate = async () => {
    if (!formData.topic.trim() || !formData.targetAudience.trim()) {
      return
    }

    setLoading(true)
    setShowOutput(true)

    try {
      const prompt = buildPrompt()
      const result = await callAIAgent(prompt, AGENT_ID)

      if (result.success && result.response.status === 'success') {
        setResponse(result.response.result as CarouselResponse)
        setActiveTab('slides')
      }
    } catch (error) {
      console.error('Error generating carousel:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = () => {
    handleGenerate()
  }

  const handleEditInputs = () => {
    setShowOutput(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">LinkedIn Carousel Post Generator</h1>
        <p className="text-sm text-gray-600 mt-1">Create engaging carousel posts in minutes</p>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-88px)]">
        {/* Input Panel - Left Side (35%) */}
        <div className={`lg:w-[35%] bg-white border-r border-gray-200 overflow-y-auto ${showOutput ? 'hidden lg:block' : 'block'}`}>
          <div className="p-6 space-y-6">
            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Enter your carousel topic..."
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., early-stage startup founders"
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
            </div>

            {/* Primary Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Goal
              </label>
              <select
                value={formData.primaryGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryGoal: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRIMARY_GOALS.map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {TONE_CHIPS.map(tone => (
                  <button
                    key={tone}
                    onClick={() => setFormData(prev => ({ ...prev, tone }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.tone === tone
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Depth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Depth
              </label>
              <div className="flex gap-2">
                {CONTENT_DEPTHS.map(depth => (
                  <button
                    key={depth}
                    onClick={() => setFormData(prev => ({ ...prev, contentDepth: depth }))}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      formData.contentDepth === depth
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {depth}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Type
              </label>
              <select
                value={formData.ctaType}
                onChange={(e) => setFormData(prev => ({ ...prev, ctaType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CTA_TYPES.map(cta => (
                  <option key={cta} value={cta}>{cta}</option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <Input
                placeholder="e.g., SaaS, Marketing, Finance"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              />
            </div>

            {/* Examples - Collapsible */}
            <div>
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
              >
                <span>Examples / Inspiration (Optional)</span>
                {showExamples ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showExamples && (
                <Textarea
                  placeholder="Add examples or inspiration for content style..."
                  value={formData.examples}
                  onChange={(e) => setFormData(prev => ({ ...prev, examples: e.target.value }))}
                  className="min-h-[80px] resize-none"
                />
              )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !formData.topic.trim() || !formData.targetAudience.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Carousel'
              )}
            </Button>
          </div>
        </div>

        {/* Output Panel - Right Side (65%) */}
        <div className={`flex-1 bg-gray-50 overflow-y-auto ${showOutput ? 'block' : 'hidden lg:block'}`}>
          {!response && !loading ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Your carousel will appear here</h2>
                <p className="text-gray-600">Fill in the form and click Generate Carousel to get started</p>
              </div>
            </div>
          ) : loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Generating your carousel...</p>
              </div>
            </div>
          ) : response ? (
            <div className="p-6">
              {/* Action Buttons */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleEditInputs}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium lg:hidden"
                >
                  Edit Inputs
                </button>
                <div className="flex gap-3 ml-auto">
                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw size={16} />
                    Regenerate
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-1">
                  {(['slides', 'caption', 'hashtags', 'extras'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${
                        activeTab === tab
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'slides' && (
                <div className="space-y-4">
                  {response.carousel_slides.map((slide) => (
                    <Card key={slide.slide_number} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                              {slide.slide_number}
                            </div>
                            <CardTitle className="text-lg">{slide.headline}</CardTitle>
                          </div>
                          <button
                            onClick={() => handleCopy(
                              `Slide ${slide.slide_number}\n\nHeadline: ${slide.headline}\n\n${slide.supporting_text}\n\nVisual: ${slide.visual_suggestion}`,
                              `slide-${slide.slide_number}`
                            )}
                            className="text-gray-500 hover:text-gray-700 p-1"
                          >
                            {copiedStates[`slide-${slide.slide_number}`] ? (
                              <Check size={18} className="text-green-600" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{slide.supporting_text}</div>
                        <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-1">Visual Suggestion:</p>
                          <p className="text-sm text-gray-700">{slide.visual_suggestion}</p>
                        </div>
                        <div className="bg-blue-50 rounded-md p-3 border border-blue-100">
                          <p className="text-xs font-medium text-blue-700 mb-1">Design Notes:</p>
                          <p className="text-sm text-blue-900">{slide.design_notes}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'caption' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Post Caption</CardTitle>
                      <button
                        onClick={() => handleCopy(response.caption.full_caption, 'caption')}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        {copiedStates.caption ? (
                          <Check size={18} className="text-green-600" />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                      <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                        {response.caption.full_caption}
                      </pre>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                        <p className="text-xs font-medium text-blue-700 mb-1">Hook:</p>
                        <p className="text-sm text-blue-900">{response.caption.hook}</p>
                      </div>

                      <div className="p-3 bg-purple-50 rounded-md border border-purple-100">
                        <p className="text-xs font-medium text-purple-700 mb-1">Body:</p>
                        <pre className="text-sm text-purple-900 whitespace-pre-wrap font-sans">{response.caption.body}</pre>
                      </div>

                      <div className="p-3 bg-green-50 rounded-md border border-green-100">
                        <p className="text-xs font-medium text-green-700 mb-1">CTA:</p>
                        <p className="text-sm text-green-900">{response.caption.cta}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'hashtags' && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Broad Reach Hashtags</CardTitle>
                          <p className="text-xs text-gray-500 mt-1">5 hashtags for maximum visibility</p>
                        </div>
                        <button
                          onClick={() => handleCopy(response.hashtags.broad.join(' '), 'hashtags-broad')}
                          className="text-gray-500 hover:text-gray-700 p-1"
                        >
                          {copiedStates['hashtags-broad'] ? (
                            <Check size={18} className="text-green-600" />
                          ) : (
                            <Copy size={18} />
                          )}
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {response.hashtags.broad.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Niche Specific Hashtags</CardTitle>
                          <p className="text-xs text-gray-500 mt-1">5 hashtags for targeted audience</p>
                        </div>
                        <button
                          onClick={() => handleCopy(response.hashtags.niche.join(' '), 'hashtags-niche')}
                          className="text-gray-500 hover:text-gray-700 p-1"
                        >
                          {copiedStates['hashtags-niche'] ? (
                            <Check size={18} className="text-green-600" />
                          ) : (
                            <Copy size={18} />
                          )}
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {response.hashtags.niche.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Authority Building Hashtags</CardTitle>
                          <p className="text-xs text-gray-500 mt-1">5 hashtags for thought leadership</p>
                        </div>
                        <button
                          onClick={() => handleCopy(response.hashtags.authority.join(' '), 'hashtags-authority')}
                          className="text-gray-500 hover:text-gray-700 p-1"
                        >
                          {copiedStates['hashtags-authority'] ? (
                            <Check size={18} className="text-green-600" />
                          ) : (
                            <Copy size={18} />
                          )}
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {response.hashtags.authority.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>All Hashtags Combined</CardTitle>
                        <button
                          onClick={() => handleCopy(response.hashtags.all_hashtags, 'hashtags-all')}
                          className="text-gray-500 hover:text-gray-700 p-1"
                        >
                          {copiedStates['hashtags-all'] ? (
                            <Check size={18} className="text-green-600" />
                          ) : (
                            <Copy size={18} />
                          )}
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                        <p className="text-sm text-gray-800 break-words">{response.hashtags.all_hashtags}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'extras' && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Alternative Hooks</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">3 alternative opening lines for testing</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {response.alternative_hooks.map((hook, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-gray-800 flex-1">{hook}</p>
                            <button
                              onClick={() => handleCopy(hook, `hook-${idx}`)}
                              className="text-gray-500 hover:text-gray-700 p-1 flex-shrink-0"
                            >
                              {copiedStates[`hook-${idx}`] ? (
                                <Check size={16} className="text-green-600" />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Alternative CTAs</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">3 alternative call-to-action options</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {response.alternative_ctas.map((cta, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-gray-800 flex-1">{cta}</p>
                            <button
                              onClick={() => handleCopy(cta, `cta-${idx}`)}
                              className="text-gray-500 hover:text-gray-700 p-1 flex-shrink-0"
                            >
                              {copiedStates[`cta-${idx}`] ? (
                                <Check size={16} className="text-green-600" />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Posting Time Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Best Times:</p>
                        <div className="flex flex-wrap gap-2">
                          {response.posting_recommendations.best_times.map((time, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium"
                            >
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Best Days:</p>
                        <div className="flex flex-wrap gap-2">
                          {response.posting_recommendations.best_days.map((day, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium"
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-1">Reasoning:</p>
                        <p className="text-sm text-gray-700">{response.posting_recommendations.reasoning}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Engagement Questions</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">{response.engagement_questions.length} questions to spark conversation</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {response.engagement_questions.map((question, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-gray-800 flex-1">{question}</p>
                            <button
                              onClick={() => handleCopy(question, `question-${idx}`)}
                              className="text-gray-500 hover:text-gray-700 p-1 flex-shrink-0"
                            >
                              {copiedStates[`question-${idx}`] ? (
                                <Check size={16} className="text-green-600" />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {response.content_strategy_notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Content Strategy Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-amber-50 rounded-md p-4 border border-amber-200">
                          <p className="text-sm text-amber-900">{response.content_strategy_notes}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
