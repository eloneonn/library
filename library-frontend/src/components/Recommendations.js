import { gql, useQuery } from '@apollo/client'

const Recommendations = (props) => {
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

  const result = useQuery(ALL_BOOKS, {pollInterval: 2000, variables: {genre: props.favoriteGenre}})

  var books = []

  if (!result.loading) {
    books = result.data.allBooks
  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favourite genre <b>{props.favoriteGenre}</b></p>
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
    </div>
  )
}

export default Recommendations
