import { createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import RequireAuth from './layouts/RequireAuth'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import Todo from './pages/Todo'
import Calendar from './pages/Calendar'
import Chat from './pages/Chat'

export default createBrowserRouter([
  { index: true, element: <Home/> },
  {
    element: <RequireAuth/>,
    children: [
      {
        element: <AppLayout/>,
        children: [
          { path:'dashboard',element: <Dashboard/> },
          { path:'courses',element: <Courses/> },
          { path:'todo', element: <Todo/> },
          { path:'calendar', element: <Calendar/> },
          { path:'chat', element: <Chat/> },
        ],
      },
    ],
  },
])
