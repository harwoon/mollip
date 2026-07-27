import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from "./pages/LoginPage"
import Home from "./pages/HomePage"
import Signup from "./pages/SignupPage"
import Main from "./components/MainLayout"

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
        element: <div>기록 페이지</div>
      },
      {
        path: "/weekly",
        element: <div>주간 현황 페이지</div>
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
