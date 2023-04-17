
import LoginForm from './loginForm.js'
import LoginClient from './loginClient.js'

// import './register/register.css'

export default function Home() {

  return (
    <div className='h-screen'>
      <div className='login-left w-96 hidden md:block' />
      <div className='bg-white login-right ml-0 md:ml-96 '>

        {/* <LoginClient>
          <LoginForm savePass={true} />
        </LoginClient> */}
      </div>
    </div>
  )
}
