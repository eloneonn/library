import { gql, useMutation } from "@apollo/client";
import React, { useEffect, useState } from "react";

const LoginForm = ({ setToken }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const LOGIN = gql`
        mutation login($username: String!, $password: String!) {
            login(username: $username, password: $password)  {
                value
            }
        }
    `

    const [ login, result ] = useMutation(LOGIN, {
        onError: (error) => {
          console.log(error.graphQLErrors[0].message)
        }
    })
    
    useEffect(() => {
        if ( result.data ) {
            const token = result.data.login.value
            localStorage.setItem('user-token', token)
            setToken(token)
        }
    }, [result.data]) // eslint-disable-line
    
    const submit = (event) => {
        event.preventDefault()
        login({ variables: { username, password } })
    }

    return (
        <div>
            <form onSubmit={submit}>
                username <input value={username} onChange={({ target }) => setUsername(target.value)}></input> <br></br>
                password <input value={password} onChange={({ target }) => setPassword(target.value)} type="password"></input> <br></br>
                <button type="submit">login</button>
            </form>
        </div>
    )
}

export default LoginForm