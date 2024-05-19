import { useContext } from 'react'
import { UserContext } from './UserContext'
import RegisterAndLoginForm from './RegisterAndLoginForm'
import { Chat } from './Chat'

export const Routes = () => {
    const { username } = useContext(UserContext)

    if (username) {
        return <Chat />
    }
    return (
        <RegisterAndLoginForm />
    )
}
