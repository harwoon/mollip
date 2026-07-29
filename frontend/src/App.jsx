import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from "./pages/LoginPage"
import Home from "./pages/HomePage"
import Signup from "./pages/SignupPage"
import Main from "./components/MainLayout"
import MyPage from "./pages/MyPage"
import RecordPage from "./pages/RecordPage"
import AdminMainLayout from "./admin/components/AdminMainLayout"
import AdminHomePage from "./admin/pages/AdminHomePage"
import WeekStatusPage from "./pages/WeekStatusPage"
import GroupPage from "./pages/GroupPage"

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
        path: "/group",
        element: <GroupPage/>
      },
      {
        path: "/mypage",
        element: <MyPage />
      }
    ]
  },
  {
    // 관리자 페이지
    element: <AdminMainLayout/>,
    children: [
      {
        path: "/admin/home",
        element: <AdminHomePage/>
      },
      {
        path: "/admin/users",
        element: <div>회원 조회</div>
      },
      {
        path: "/admin/groups",
        element: <div>그룹 관리</div>
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
