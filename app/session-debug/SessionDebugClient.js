// app/session-debug/SessionDebugClient.js
'use client'

import { useState, useEffect } from 'react'

export default function SessionDebugClient() {
  const [session, setSession] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [csrfToken, setCsrfToken] = useState('')

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date() }])
  }

  const updateSessionStatus = (sessionData) => {
    setSession(sessionData)
  }

  // Fetch CSRF token on component mount
  const fetchCsrfToken = async () => {
    try {
      addLog('Fetching CSRF token...')
      const response = await fetch('/api/auth/csrf')
      const data = await response.json()
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken)
        addLog(`CSRF token received: ${data.csrfToken.substring(0, 20)}...`, 'success')
      } else {
        addLog('No CSRF token received', 'error')
      }
    } catch (error) {
      addLog(`Error fetching CSRF token: ${error.message}`, 'error')
    }
  }

  const checkSession = async () => {
    addLog('Checking current session...')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/session')
      const sessionData = await response.json()
      
      addLog(`Session response: ${JSON.stringify(sessionData)}`)
      updateSessionStatus(sessionData)
      
      if (sessionData.user) {
        addLog('Session found with user data', 'success')
      } else {
        addLog('No active session found', 'warning')
      }
    } catch (error) {
      addLog(`Error checking session: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const testApiRoutes = async () => {
    addLog('Testing API routes...')
    setLoading(true)
    
    const routes = ['/api/auth/session', '/api/auth/csrf', '/api/auth/providers']
    
    for (const route of routes) {
      try {
        const response = await fetch(route)
        const data = await response.text()
        addLog(`${route}: ${response.status} - ${data.substring(0, 100)}...`)
      } catch (error) {
        addLog(`${route}: ERROR - ${error.message}`, 'error')
      }
    }
    setLoading(false)
  }

  const clearCookies = () => {
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    addLog('Cookies cleared', 'success')
    updateSessionStatus(null)
    // Refetch CSRF token after clearing cookies
    fetchCsrfToken()
  }

  const testOAuth = (provider) => {
    addLog(`Initiating ${provider} OAuth flow...`)
    addLog(`Would redirect to /api/auth/signin/${provider}`, 'warning')
    addLog('Check your NextAuth configuration for OAuth providers', 'warning')
  }

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')

    addLog(`Attempting credentials login for: ${email}`)
    
    try {
      // Create formData for the API request
      const loginFormData = new FormData()
      loginFormData.append('email', email)
      loginFormData.append('password', password)
      loginFormData.append('callbackUrl', '/')
      loginFormData.append('csrfToken', csrfToken)
      loginFormData.append('json', 'true')

      addLog(`Sending formData with CSRF token: ${csrfToken.substring(0, 20)}...`)
      
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        body: loginFormData,
      })

      const result = await response.json()
      addLog(`Login response: ${JSON.stringify(result)}`)

      if (response.ok) {
        addLog('Credentials login successful!', 'success')
        setTimeout(checkSession, 500)
      } else {
        addLog(`Login failed: ${result.error || 'Unknown error'}`, 'error')
      }
    } catch (error) {
      addLog(`Login error: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    addLog('Session debug tool initialized')
    addLog('Make sure your NextAuth.js API routes are properly configured')
    fetchCsrfToken()
    checkSession()
  }, [])

  const getLogColor = (type) => {
    switch (type) {
      case 'error': return 'border-red-500 text-red-700'
      case 'success': return 'border-green-500 text-green-700'
      case 'warning': return 'border-yellow-500 text-yellow-700'
      default: return 'border-blue-500 text-gray-700'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Session Debug Tool</h1>
          <p className="text-gray-600">Debug your NextAuth.js session issues</p>
        </div>

        {/* CSRF Token Status */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">CSRF Token Status</h2>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${csrfToken ? 'text-green-600' : 'text-red-600'}`}>
              {csrfToken ? 'CSRF Token Available' : 'No CSRF Token'}
            </span>
            <button 
              onClick={fetchCsrfToken}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Refresh Token
            </button>
          </div>
          {csrfToken && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
              <code>{csrfToken.substring(0, 30)}...</code>
            </div>
          )}
        </div>

        {/* Session Status Panel */}
        <div className={`bg-white rounded-lg shadow-md p-6 mb-6 transition-all duration-300 ${
          session?.user ? 'border-2 border-green-500 bg-green-50' : 'border-2 border-red-500 bg-red-50'
        }`}>
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Session State:</label>
              <span className={`font-medium ${session?.user ? 'text-green-600' : 'text-red-600'}`}>
                {session?.user ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID:</label>
              <span>{session?.user?.id || '-'}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email:</label>
              <span>{session?.user?.email || '-'}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name:</label>
              <span>{session?.user?.name || '-'}</span>
            </div>
          </div>
        </div>

        {/* Login Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Credentials Login */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Credentials Login</h2>
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Your password"
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !csrfToken}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in with Credentials'}
              </button>
              {!csrfToken && (
                <p className="text-sm text-red-600">CSRF token not available. Please refresh the token.</p>
              )}
            </form>
          </div>

          {/* OAuth Login */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">OAuth Login</h2>
            <div className="space-y-3">
              <button 
                onClick={() => testOAuth('google')}
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Test Google OAuth
              </button>
              <button 
                onClick={() => testOAuth('facebook')}
                disabled={loading}
                className="w-full bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Test Facebook OAuth
              </button>
            </div>
          </div>
        </div>

        {/* Debug Tools */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={checkSession}
              disabled={loading}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Check Current Session
            </button>
            <button 
              onClick={clearCookies}
              className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Clear Cookies
            </button>
            <button 
              onClick={testApiRoutes}
              disabled={loading}
              className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Test API Routes
            </button>
          </div>
        </div>

        {/* Log Output */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Debug Log</h2>
            <button 
              onClick={() => setLogs([])}
              className="bg-gray-200 text-gray-700 py-1 px-3 rounded-md text-sm hover:bg-gray-300"
            >
              Clear Log
            </button>
          </div>
          <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded-md">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index}
                  className={`border-l-4 p-2 mb-2 ${getLogColor(log.type)}`}
                >
                  <span className="text-sm text-gray-400">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>{' '}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-3">Debugging Steps:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Wait for CSRF token to load (green indicator)</li>
            <li>Try logging in with credentials - check if session callback triggers</li>
            <li>Monitor the debug log for errors or success messages</li>
            <li>Use "Check Current Session" to verify session state</li>
            <li>Check browser console for additional errors</li>
            <li>Clear cookies if needed to test fresh sessions</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
