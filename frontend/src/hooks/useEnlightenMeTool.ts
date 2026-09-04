import { useEffect } from 'react'
import { getToken, getUser } from '../utils/auth'

/// <reference types="webmcp-types" />

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function api(method: string, path: string, body?: object) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken() ?? ''}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(data))
  return JSON.stringify(data)   // execute must return a string
}

export function useEnlightenMeTools() {
  useEffect(() => {
    if (!document.modelContext) {
      console.warn('WebMCP not available — enable chrome://flags/#enable-webmcp-testing')
      return
    }

    const controllers: AbortController[] = []

    function register(tool: any) {
  document.modelContext.registerTool(tool)
}

    register({
      name: 'search_lectures',
      description: 'Search YouTube for top 3 lecture videos on a topic.',
      inputSchema: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Topic to search for' },
        },
        required: ['topic'],
      },
      execute: async ({ topic }: { topic: string }) =>
        api('POST', '/api/lectures/search/', { topic }),
    })

    register({
      name: 'create_lecture',
      description: 'Create a lecture. Fetches YouTube transcript automatically if source is youtube.',
      inputSchema: {
        type: 'object',
        properties: {
          youtube_url: { type: 'string' },
          source: { type: 'string', enum: ['youtube', 'chatgpt'] },
          title: { type: 'string' },
        },
        required: ['source'],
      },
      execute: async ({ youtube_url, source, title }: any) =>
        api('POST', '/api/lectures/create/', { youtube_url, source, title }),
    })

    register({
      name: 'save_explanation',
      description: 'Save 3-level explanation, key concepts, and related topics to a lecture.',
      inputSchema: {
        type: 'object',
        properties: {
          lecture_id:    { type: 'string' },
          plain_english: { type: 'string' },
          technical:     { type: 'string' },
          advanced:      { type: 'string' },
          key_concepts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title:       { type: 'string' },
                explanation: { type: 'string' },
              },
            },
          },
          related_topics: { type: 'array', items: { type: 'string' } },
        },
        required: ['lecture_id', 'plain_english', 'technical', 'advanced'],
      },
      execute: async ({ lecture_id, plain_english, technical, advanced, key_concepts, related_topics }: any) =>
        api('POST', `/api/lectures/${lecture_id}/explain/`, {
          plain_english, technical, advanced,
          key_concepts:   key_concepts   ?? [],
          related_topics: related_topics ?? [],
        }),
    })

    register({
      name: 'generate_quiz',
      description: 'Get quiz generation prompt. Use the returned prompt to generate 10 questions yourself, then call save_quiz.',
      inputSchema: {
        type: 'object',
        properties: {
          lecture_id: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        },
        required: ['lecture_id', 'difficulty'],
      },
      execute: async ({ lecture_id, difficulty }: any) =>
        api('POST', '/api/quizzes/generate/', { lecture_id, difficulty }),
    })

    register({
      name: 'save_quiz',
      description: 'Save AI-generated quiz questions to database. Returns quiz_id needed for submit_answer.',
      inputSchema: {
        type: 'object',
        properties: {
          lecture_id: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question:    { type: 'string' },
                options:     { type: 'array', items: { type: 'string' } },
                correct:     { type: 'integer', description: '0-based index of correct option' },
                explanation: { type: 'string' },
                topic:       { type: 'string' },
              },
              required: ['question', 'options', 'correct'],
            },
          },
        },
        required: ['lecture_id', 'difficulty', 'questions'],
      },
      execute: async ({ lecture_id, difficulty, questions }: any) =>
        api('POST', '/api/quizzes/save/', {
          lecture_id, difficulty, questions,
          user_id: getUser()?.id ?? '',
        }),
    })

    register({
      name: 'submit_answer',
      description: 'Submit user answers. Returns score, percentage, and weak topics.',
      inputSchema: {
        type: 'object',
        properties: {
          quiz_id:    { type: 'string' },
          lecture_id: { type: 'string' },
          answers: {
            type: 'array',
            items: { type: 'integer' },
            description: '0-based selected option index per question in order',
          },
        },
        required: ['quiz_id', 'lecture_id', 'answers'],
      },
      execute: async ({ quiz_id, lecture_id, answers }: any) =>
        api('POST', '/api/quizzes/submit/', { quiz_id, lecture_id, answers }),
    })

    register({
      name: 'get_weak_topics',
      description: 'Get ranked list of topics the user struggles with most. Use to recommend what to study next.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () =>
        api('GET', '/api/quizzes/weak-topics/'),
    })

    return () => {
      controllers.forEach(c => c.abort())
    }
  }, [])
}