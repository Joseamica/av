// app/components/ErrorPage.tsx
import React from 'react'

const ErrorPage = ({ status, message }) => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Oops! Something went wrong.</h1>
      <p>Status Code: {status}</p>
      <p>{message}</p>
    </div>
  )
}

export default ErrorPage
