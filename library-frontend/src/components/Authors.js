import { gql, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

const Authors = (props) => {
  const [name, setName] = useState('')
  const [year, setYear] = useState('')
  const [authors, setAuthors] = useState([])

  const ALL_AUTHORS = gql`
    query {
      allAuthors {
        name
        id
        born
        books
      }
    }
  `

  const UPDATE_AUTHOR = gql`
    mutation updateAuthor ($nameToUse: String!, $born: Int!) {
      editAuthor (
        name: $nameToUse,
        setBornTo: $born
      ) {
        name,
        born
      }
    }
  `

  const [updateAuthor] = useMutation(UPDATE_AUTHOR)

  const result = useQuery(ALL_AUTHORS, { pollInterval: 2000 })

  useEffect(() => {
    if (result.data) {
      setAuthors(result.data.allAuthors)
    }
  }, [result.data]); // eslint-disable-line

  if (!props.show) {
    return null
  }

  const submitUpdate = async (event) => {
    event.preventDefault()

    const born = Number(year)

    var nameToUse = name

    if (name === '') { // default value in select tag
      nameToUse = authors[0].name
    }

    updateAuthor({variables: {nameToUse, born}, refetchQueries: [{query: ALL_AUTHORS}]})

    setName('')
    setYear('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.books.length}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Set birthyear</h3>
      <form onSubmit={submitUpdate}>
        name <select value={name} onChange={({target}) => setName(target.value)}>
          {authors.map((a) => (
            <option key={a.id} value={a.name}>{a.name}</option>
          ))}
        </select> <br></br>
        born <input value={year} onChange={({target}) => setYear(target.value)}></input> <br></br>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors
