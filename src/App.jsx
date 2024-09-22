import { createSignal, onMount, onCleanup, Show } from 'solid-js'
import { supabase, createEvent } from './supabaseClient'
import { Auth } from '@supabase/auth-ui-solid'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { SolidMarkdown } from "solid-markdown"
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import mammoth from 'mammoth'
import XLSX from 'xlsx'

function App() {
  const [user, setUser] = createSignal(null)
  const [currentPage, setCurrentPage] = createSignal('login')
  const [loading, setLoading] = createSignal(false)
  const [summary, setSummary] = createSignal('')
  const [file, setFile] = createSignal(null)
  const [error, setError] = createSignal('')

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      setCurrentPage('homePage')
    }
  }

  onMount(() => {
    checkUserSignedIn()

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user)
        setCurrentPage('homePage')
      } else {
        setUser(null)
        setCurrentPage('login')
      }
    })

    onCleanup(() => {
      authListener?.unsubscribe()
    })
  })

  const handleFileChange = async (event) => {
    const uploadedFile = event.target.files[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    setSummary('')
    setError('')

    try {
      setLoading(true)

      let textContent = ''

      if (uploadedFile.type === 'application/pdf') {
        // PDF file
        const arrayBuffer = await uploadedFile.arrayBuffer()

        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.js',
          import.meta.url,
        ).toString()

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

        let pageTexts = []
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const strings = content.items.map(item => item.str)
          pageTexts.push(strings.join(' '))
        }
        textContent = pageTexts.join('\n')
      } else if (uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 uploadedFile.type === 'application/msword') {
        // Word document
        const arrayBuffer = await uploadedFile.arrayBuffer()
        const { value } = await mammoth.extractRawText({ arrayBuffer })
        textContent = value
      } else if (uploadedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                 uploadedFile.type === 'application/vnd.ms-excel') {
        // Excel file
        const arrayBuffer = await uploadedFile.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        textContent = ''
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName]
          const sheetText = XLSX.utils.sheet_to_csv(worksheet)
          textContent += sheetText
        })
      } else {
        setError('Unsupported file type. Please upload a PDF, Word, or Excel file.')
        setLoading(false)
        return
      }

      // Limit text content length to prevent exceeding prompt size
      if (textContent.length > 5000) {
        textContent = textContent.slice(0, 5000)
      }

      const prompt = `Please summarize the following document in less than 100 words:\n\n${textContent}`

      const result = await createEvent('chatgpt_request', {
        prompt: prompt,
        response_type: 'text'
      })

      setSummary(result)
    } catch (error) {
      console.error('Error processing file:', error)
      setError('An error occurred while processing the file.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-4 text-center">Sign in with ZAPT</h2>
            <a href="https://www.zapt.ai" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline mb-4 block text-center">
              Learn more about ZAPT
            </a>
            <Auth 
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google', 'facebook', 'apple']}
            />
          </div>
        }
      >
        <div class="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md h-full">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Document Summarizer</h1>
            <button
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
          <div class="mb-6">
            <label class="block text-lg font-medium mb-2">Upload a document (PDF, Word, Excel):</label>
            <div class="flex items-center">
              <label class={`flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${loading() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.88 9.94l-1.41-1.42-4.47 4.47V2h-2v10.99l-4.47-4.47-1.41 1.42 6 6 .01.01 6-6z" />
                </svg>
                <span>Choose File</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  class="hidden"
                  onChange={handleFileChange}
                  disabled={loading()}
                />
              </label>
            </div>
            <Show when={file()}>
              <p class="mt-2 text-gray-700">Selected file: {file().name}</p>
            </Show>
          </div>
          <Show when={loading()}>
            <div class="mt-6 flex items-center">
              <svg class="animate-spin h-5 w-5 mr-3 text-gray-700" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <p class="text-gray-700">Processing your document...</p>
            </div>
          </Show>
          <Show when={error()}>
            <div class="mt-6 text-red-500">
              {error()}
            </div>
          </Show>
          <Show when={summary()}>
            <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 h-full">
              <h3 class="text-xl font-semibold mb-2">Summary:</h3>
              <div class="text-gray-700 prose">
                <SolidMarkdown children={summary()} />
              </div>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}

export default App