import { useContext } from 'react'
import { UserContext } from './UserContext'
import RegisterAndLoginForm from './RegisterAndLoginForm'

export const Routes = () => {
    const { username } = useContext(UserContext)

    if (username) { return "Logged in " + username }
    return (
        <RegisterAndLoginForm />
    )
}
