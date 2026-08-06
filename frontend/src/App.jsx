import { createBrowserRouter, RouterProvider } from "react-router-dom"
import ProtectedRoute from "./guards/ProtectedRoute"
import Login from "./pages/LoginPage"
import Home from "./pages/HomePage"
import Signup from "./pages/SignupPage"
import Main from "./components/MainLayout"
import MyPage from "./pages/MyPage"
import RecordPage from "./pages/RecordPage"
import AdminMainLayout from "./admin/components/AdminMainLayout"
import AdminHomePage from "./admin/pages/AdminHomePage"
import AdminUsersPage from "./admin/pages/AdminUsersPage"
import AdminGroupsPage from "./admin/pages/AdminGroupsPage"
import WeekStatusPage from "./pages/WeekStatusPage"
import GroupPage from "./pages/GroupPage"
import AdminRoute from "./guards/AdminRoute"
import AdminRootRedirect from "./guards/AdminRootRedirect"
import UnauthorizedPage from "./pages/UnauthorizedPage"

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login />},
  { path: "/signup",element: <Signup />},
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "/admin", element: <AdminRootRedirect /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        // 2. 사이드바를 공유하는 페이지들 묶음
        element: <Main />,
        children: [
          { path: "/home", element: <Home /> },
          { path: "/records", element: <RecordPage /> },
          { path: "/weekly", element: <WeekStatusPage /> },
          { path: "/group", element: <GroupPage /> },
          { path: "/mypage", element: <MyPage /> }
        ]
      },
      
      {
        // 관리자 페이지
        element: <AdminRoute/>,
        children: [
          {
            element: <AdminMainLayout />,
            children: [
              { path: "/admin/home", element: <AdminHomePage /> },
              { path: "/admin/users", element: <AdminUsersPage /> },
              { path: "/admin/groups", element: <AdminGroupsPage /> }
            ]
          }
        ]
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
