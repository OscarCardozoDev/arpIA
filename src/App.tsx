import { useEffect, useState } from 'react'
import type { View } from './interfaces/navigation'
import type { User } from './interfaces/auth'
import { useAuth } from './hooks/useAuth'
import { useConversations } from './hooks/useConversations'
import { useTheme } from './hooks/useTheme'
import { useSidebar } from './hooks/useSidebar'
import { AppLayout } from './pages/components/AppLayout'
import { Sidebar } from './pages/components/Sidebar'
import { TopBar } from './pages/components/TopBar'
import { ThemeToggle } from './pages/components/ThemeToggle'
import { SplashScreen } from './pages/components/SplashScreen'
import { ChatPage } from './pages/Chat/ChatPage'
import { LoginPage } from './pages/Login/LoginPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'

const VIEW_TITLES: Record<View, string> = { login: 'Iniciar sesión', dashboard: 'Dashboard', chat: 'arpIA' }

function App() {
  const auth = useAuth()
  const conversations = useConversations()
  const theme = useTheme()
  const sidebar = useSidebar()

  const [view, setView] = useState<View>('chat')
  const [notice, setNotice] = useState(false)
  // Se incrementa para que la mascota salte (saludo al iniciar sesión o al abrir un chat nuevo).
  const [hopSignal, setHopSignal] = useState(0)

  // Vista efectiva coherente con la sesión: sin usuario siempre se ve el login, aunque `view` diga otra cosa.
  const effectiveView: View = auth.user ? (view === 'login' ? 'chat' : view) : 'login'

  useEffect(() => {
    document.title = effectiveView === 'chat' ? 'arpIA' : `${VIEW_TITLES[effectiveView]} · arpIA`
  }, [effectiveView])

  function go(next: View) {
    if (!auth.user && next !== 'login') {
      setView('login')
      setNotice(true)
    } else if (auth.user && next === 'login') {
      setView('chat')
    } else {
      setView(next)
    }
    sidebar.closeOnMobile()
  }

  function handleLoggedIn(user: User) {
    auth.signIn(user)
    setView('chat')
    setHopSignal((n) => n + 1)
  }

  async function handleLogout() {
    await auth.logout()
    conversations.resetSession()
    setView('login')
    setNotice(false)
  }

  function handleNewChat() {
    conversations.select(null)
    setView('chat')
    setHopSignal((n) => n + 1)
    sidebar.closeOnMobile()
  }

  function handleOpenConversation(id: string) {
    conversations.select(id)
    setView('chat')
    sidebar.closeOnMobile()
  }

  if (auth.checking) return <SplashScreen />

  return (
    <AppLayout
      sidebarOpen={sidebar.open}
      onCloseSidebar={() => sidebar.setOpen(false)}
      sidebar={
        <Sidebar
          user={auth.user}
          view={effectiveView}
          onNavigate={go}
          onSignIn={() => go('login')}
          onClose={() => sidebar.setOpen(false)}
          onNewChat={handleNewChat}
          conversations={conversations.conversations}
          conversationsLoading={conversations.loading}
          conversationsError={conversations.error}
          activeConversationId={conversations.activeId}
          onSelectConversation={handleOpenConversation}
          onLogout={() => void handleLogout()}
        />
      }
      topBar={
        <TopBar
          title={VIEW_TITLES[effectiveView]}
          onOpenSidebar={() => sidebar.setOpen(true)}
          themeToggle={<ThemeToggle theme={theme.theme} onToggle={theme.toggleTheme} />}
        />
      }
    >
      {effectiveView === 'login' && <LoginPage showNotice={notice} onLoggedIn={handleLoggedIn} autoFocus={sidebar.isDesktop} />}
      {effectiveView === 'dashboard' && auth.user && (
        <DashboardPage
          user={auth.user}
          conversations={conversations.conversations}
          onOpenConversation={handleOpenConversation}
          onOpenChat={() => go('chat')}
        />
      )}
      {/* Siempre montado con sesión iniciada: si se desmontara, una respuesta en curso quedaría cortada. */}
      {auth.user && (
        <div className={effectiveView === 'chat' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
          <ChatPage
            activeConversation={conversations.activeConversation}
            startConversation={conversations.startConversation}
            addMessage={conversations.addMessage}
            updateMessage={conversations.updateMessage}
            hopSignal={hopSignal}
            autoFocus={sidebar.isDesktop}
          />
        </div>
      )}
    </AppLayout>
  )
}

export default App
