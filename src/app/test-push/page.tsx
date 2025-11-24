"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { useAuth } from "@/context/auth-context"
import { usePushNotification } from "@/hooks/use-push-notification"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bell, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"

export default function TestPushPage() {
  const { user } = useAuth()
  const { isSubscribed, permission, subscribe, loading } = usePushNotification()
  const [diagnostics, setDiagnostics] = React.useState<any>(null)
  const [testResult, setTestResult] = React.useState<any>(null)
  const [loadingDiag, setLoadingDiag] = React.useState(false)
  const [sendingTest, setSendingTest] = React.useState(false)
  const [sendingTestAll, setSendingTestAll] = React.useState(false)

  // Load diagnostics on mount
  React.useEffect(() => {
    loadDiagnostics()
  }, [])

  const loadDiagnostics = async () => {
    setLoadingDiag(true)
    try {
      const res = await fetch('/api/test-push-debug')
      const data = await res.json()
      setDiagnostics(data)
    } catch (error) {
      console.error('Failed to load diagnostics:', error)
    } finally {
      setLoadingDiag(false)
    }
  }

  const handleSubscribe = async () => {
    try {
      await subscribe()
      // Reload diagnostics after subscribe
      setTimeout(() => loadDiagnostics(), 1000)
    } catch (error) {
      console.error('Subscribe error:', error)
    }
  }

  const sendTestPush = async () => {
    if (!user?.id) {
      alert('Please login first')
      return
    }

    setSendingTest(true)
    setTestResult(null)
    
    try {
      const res = await fetch('/api/test-push-debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      const data = await res.json()
      setTestResult(data)

      if (data.success) {
        alert('✅ Test push sent! Check your Windows notifications.')
      } else {
        alert(`❌ Failed: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Send test error:', error)
      alert('❌ Network error')
    } finally {
      setSendingTest(false)
    }
  }

  const sendTestPushAll = async () => {
    setSendingTestAll(true)
    setTestResult(null)
    
    try {
      const res = await fetch('/api/test-push-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🧪 Test Push to ALL Devices',
          body: 'Jika notifikasi ini muncul, push notification bekerja! Tanpa peduli role atau user.',
          icon: '/icons/icon-192x192.png',
          url: '/dashboard'
        })
      })
      const data = await res.json()
      setTestResult(data)

      if (data.success) {
        alert(`✅ Push sent to ${data.sent} device(s)! Check Windows notifications.`)
      } else {
        alert(`❌ Failed: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Send test all error:', error)
      alert('❌ Network error')
    } finally {
      setSendingTestAll(false)
    }
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status.startsWith('✅')) return <CheckCircle2 className="h-5 w-5 text-green-600" />
    if (status.startsWith('❌')) return <XCircle className="h-5 w-5 text-red-600" />
    return <AlertCircle className="h-5 w-5 text-yellow-600" />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <Bell className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Push Notification Debugger</h1>
          <p className="text-gray-600 mt-2">Test dan debug push notification sistem</p>
        </div>

        {/* Quick Status */}
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Quick Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Permission:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                permission === 'granted' ? 'bg-green-100 text-green-800' :
                permission === 'denied' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {permission}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Subscribed:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                isSubscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isSubscribed ? 'Yes ✅' : 'No ❌'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">User:</span>
              <span className="text-sm text-gray-600">{user?.email || 'Not logged in'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">User ID:</span>
              <span className="text-sm text-gray-600">{user?.id.substring(0, 12)}...</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex gap-4">
            {!isSubscribed && (
              <Button
                onClick={handleSubscribe}
                disabled={loading || permission === 'denied'}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Subscribe to Push
                  </>
                )}
              </Button>
            )}
            
            <Button
              onClick={sendTestPush}
              disabled={sendingTest || !isSubscribed}
              variant="outline"
              className="flex-1"
            >
              {sendingTest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Test Push
                </>
              )}
            </Button>

            <Button
              onClick={loadDiagnostics}
              disabled={loadingDiag}
              variant="outline"
            >
              {loadingDiag ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>

          {permission === 'denied' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                <strong>Permission Denied!</strong><br />
                Please enable notifications in your browser settings:
                <br />
                <code className="text-xs">Browser Settings → Privacy → Notifications → Allow for this site</code>
              </p>
            </div>
          )}
        </Card>

        {/* Test Result */}
        {testResult && (
          <Card className="p-6 bg-white">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </Card>
        )}

        {/* Diagnostics */}
        {diagnostics && (
          <Card className="p-6 bg-white">
            <h2 className="text-xl font-semibold mb-4">System Diagnostics</h2>
            
            {/* VAPID */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">VAPID Configuration</h3>
              <div className="space-y-2">
                {Object.entries(diagnostics.diagnostics?.vapid || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <StatusIcon status={String(value)} />
                    <span className="font-mono text-sm">{key}:</span>
                    <span className="text-sm">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Database */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Database</h3>
              <div className="space-y-2">
                {Object.entries(diagnostics.diagnostics?.database || {}).map(([key, value]) => {
                  if (key === 'tokens') return null
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <StatusIcon status={String(value)} />
                      <span className="font-mono text-sm">{key}:</span>
                      <span className="text-sm">{String(value)}</span>
                    </div>
                  )
                })}
              </div>

              {diagnostics.diagnostics?.database?.tokens?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Active Subscriptions:</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    {diagnostics.diagnostics.database.tokens.map((token: any, i: number) => (
                      <div key={i} className="text-xs text-gray-700">
                        User: {token.user_id} | Platform: {token.platform} | Created: {new Date(token.created_at).toLocaleString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Raw Data */}
            <details className="mt-6">
              <summary className="cursor-pointer font-semibold text-lg mb-2">Raw Diagnostics Data</summary>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto mt-2">
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
            </details>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">📖 How to Test</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Pastikan sudah login sebagai user (guru atau siswa)</li>
            <li>Klik "Subscribe to Push" jika belum subscribed</li>
            <li>Allow permission saat browser minta</li>
            <li>Klik "Send Test Push" untuk kirim notifikasi test</li>
            <li>Check Windows notification tray (pojok kanan bawah)</li>
            <li>Notifikasi harus muncul dalam 1-2 detik</li>
          </ol>
        </Card>

        {/* Troubleshooting */}
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h2 className="text-xl font-semibold mb-4 text-yellow-900">🔧 Troubleshooting</h2>
          <div className="space-y-3 text-yellow-800">
            <div>
              <strong>Notifikasi tidak muncul?</strong>
              <ul className="list-disc list-inside ml-4 mt-1 text-sm">
                <li>Check Windows Settings → System → Notifications → Make sure notifications are ON</li>
                <li>Check browser notifications are not blocked for this site</li>
                <li>Try in Incognito/Private mode</li>
                <li>Check Focus Assist is OFF (Windows 11)</li>
              </ul>
            </div>
            <div>
              <strong>Permission denied?</strong>
              <ul className="list-disc list-inside ml-4 mt-1 text-sm">
                <li>Browser Settings → Site Settings → Notifications → Remove block</li>
                <li>Reload page and try again</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
