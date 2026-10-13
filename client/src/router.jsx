import { createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import RequireAuth from './layouts/RequireAuth'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import CourseView from './components/courses/CourseView'
import CourseLayout from './layouts/CourseLayout'
import LiveClassPage from './pages/LiveClassPage'
import Tasks from './components/tasks/Tasks'
import CreateTask from './components/tasks/CreateTask'
import TaskDetail from './components/tasks/TaskDetail'
import Submissions from './components/tasks/Submissions'
import CourseDiscussion from './components/discussion/CourseDiscussion'
import CourseMembersView from './components/discussion/CourseMembersView'
import Todo from './pages/Todo'
import Calendar from './pages/Calendar'
import Chat from './pages/Chat'
import Error from './pages/Error'

export default createBrowserRouter([
  { index: true, element: <Home/> },
  {
    element: <RequireAuth/>,
    children: [
      {
        element: <AppLayout/>,
        children: [
          { path:'dashboard', element: <Dashboard/> },
          { path:'courses', element: <Courses/> },
          { path:'todo', element: <Todo/> },
          { path:'calendar', element: <Calendar/> },
          { path:'chat', element: <Chat/> },
          { path:'*', element: <Error/> },
        ],
      },
      {
        element: <CourseLayout/>,
        children: [
          { path:'courses/:id', element: <CourseView/> },
          { path:'courses/:id/video', element: <LiveClassPage/> },
          { path:'courses/:id/task', element: <Tasks/> },
          { path:'courses/:id/task/create', element: <CreateTask/> },
          { path:'courses/:id/task/:taskId', element: <TaskDetail/> },
          { path:'courses/:id/task/:taskId/submissions', element: <Submissions/> },
          { path:'courses/:id/discussion', element: <CourseDiscussion/> },
          { path:'courses/:id/discussion/members', element: <CourseMembersView/> },
        ],
      },
    ],
  },
])