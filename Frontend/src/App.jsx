import { MonacoBinding } from 'y-monaco'
import { Editor } from '@monaco-editor/react'
import './App.css'
import { useRef, useMemo, useState, useEffect } from 'react'
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"

function App() {

  const editorRef = useRef(null)

  const [users, setusers] = useState([])
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })

  const ydoc = useMemo(() => new Y.Doc(), [])  //code storage
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])  //coverter filestor age

  const handleMount = (editor) => {
    editorRef.current = editor
       new MonacoBinding(
        yText,
        editorRef.current.getModel(),
        new Set([editorRef.current])
      )
  }

  const handlejoin = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value)
    window.history.pushState({}, "", "?username=" + e.target.username.value)
  }

  useEffect(() => {
    if (username) {
      const provider = new SocketIOProvider("/", "monaco", ydoc, { autoConnect: true })

      provider.awareness.setLocalStateField("user", { username })

      const states = Array.from(provider.awareness.getStates().values())
      setusers(states.filter(state => state.user && state.user.username).map(state => state.user))

      provider.awareness.on("change", () => {
        const states = Array.from(provider.awareness.getStates().values())
        setusers(states.filter(state => state.user && state.user.username).map(state => state.user))
      })


      function handlebeforeunload() {
        provider.awareness.setLocalStateField("user", null)
      }

      window.addEventListener("beforeunload", handlebeforeunload)

      return () => {
        provider.destroy()
        window.removeEventListener("beforeunload", handlebeforeunload)
      }
    }
  }, [username])

  if (!username) {
    return (
      <form
        onSubmit={handlejoin}
        className='h-screen w-full bg-gray-950 flex gap-5 p-3 items-center justify-center'>
        <div className='flex flex-col gap-4'>
          <input
            type="text"
            placeholder='Enter your name'
            className='p-2 rounded-lg bg-gray-800 text-white'
            name='username'
          />
          <button
            className='p-2 rounded-lg bg-amber-50 text-gray-950 font-bold'
          >
            JOIN
          </button>
        </div>
      </form>
    )
  }
  return (
    <>
      <main className='h-screen w-full bg-gray-950 flex gap-5 p-3'>
        <aside className='h-full w-1/4 bg-amber-100 rounded-lg'>
          <h2 className='text-2xl font-bold p-4 border-b border-gray-300'>USERS</h2>
          <ul className='p-4'>
            {users.map((user, index) => (
              <li key={index} className='p-4 bg-gray-800 text-white rounded mb-2'>
                {user.username}
              </li>
            ))}
          </ul>
        </aside>
        <section className='w-3/4 h-full bg-neutral-500'>
          <Editor
            height="100%"
            defaultLanguage='javascript'
            defaultValue='//CONTENT'
            theme='vs-dark'
            onMount={handleMount}
          />
        </section>
      </main>
    </>
  )
}

export default App
