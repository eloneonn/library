import { gql, useQuery, useSubscription } from '@apollo/client'
import { useEffect, useState } from 'react'

const Books = (props) => {
  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [genre, setGenre] = useState(null)

  const ALL_BOOKS = gql`
    query AllBooks($genre: String) {
      allBooks(genre: $genre) {
        title
        published
        author {
          name
          id
        }
        genres
        id
      }
    }
  `

  const BOOK_ADDED = gql`
    subscription {
      bookAdded {
        title
        published
        author {
          name
          id
        }
        genres
        id
      }
    }
  `

  const result = useQuery(ALL_BOOKS, {variables: {genre: genre}})

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      setBooks(books.concat(addedBook))

      window.alert(`New book '${addedBook.title}' by '${addedBook.author.name}' was added`)
    }
  })

  useEffect(() => {
    if ( result.data ) {
      setBooks(result.data.allBooks)
      var g = []

      result.data.allBooks.forEach(book => {
        g = g.concat(book.genres)
      });

      setGenres([...new Set(g)])
    }
  }, [result.data]);

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>books</h2>
      <p>{genre === null ? 'Showing all genres' : `By genre: ${genre}`}</p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map((genre) => (
        <button onClick={() => setGenre(genre)} key={genre}>{genre}</button>
      ))}
      <button onClick={() => setGenre(null)}>all genres</button>
    </div>
  )
}

export default Books
