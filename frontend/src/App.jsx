import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from "./pages/LoginPage"
import Home from "./pages/HomePage"
import Signup from "./pages/SignupPage"
import Main from "./components/MainLayout"
import MyPage from "./pages/MyPage"
import RecordPage from "./pages/RecordPage"
import WeekStatusPage from "./pages/WeekStatusPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path:"/signup",
    element: <Signup/>
  },
  {
    // 2. 사이드바를 공유하는 페이지들 묶음
    element: <Main />,
    children: [
      {
        path: "/home",
        element: <Home />
      },
      {
        path: "/records",
        element: <RecordPage/>
      },
      {
        path: "/weekly",
        element: <WeekStatusPage/>
      },
      {
        path: "/mypage",
        element: <MyPage />
      }
    ]
  }
])

function App() {


  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  )
}

export default App
