import { gql, useApolloClient, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import LoginForm from './components/LoginForm'
import NewBook from './components/NewBook'
import Recommendations from './components/Recommendations'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  useEffect(() => {
    const localToken = localStorage.getItem('user-token')
    if (localToken) {
      setToken(localToken)
    }
  }, []);

  useEffect(() => {
    if (token) {
      refetch()
    }
  }, [token]); // eslint-disable-line

  const GENRE = gql`
    query genre {
        me {
          favoriteGenre
        }
      }
    `

  const { loading, error, data, refetch } = useQuery(GENRE, { skip: !token }) // eslint-disable-line
  let genre = ''

  try {
    if (!loading && data.hasOwnProperty('me')) {
      genre = data.me.favoriteGenre
    }  
  } catch (error) {

  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (!token) {
    return (
      <div>
        <h2>Login</h2>
        <LoginForm setToken={setToken} />
      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('recommendations')}>recommendations</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={logout}>logout</button>
      </div>
      <Authors show={page === 'authors'} />
      <Books show={page === 'books'} />
      <Recommendations favoriteGenre={genre} show={page === 'recommendations'} />
      <NewBook show={page === 'add'} />
    </div>
  )
}

export default App
