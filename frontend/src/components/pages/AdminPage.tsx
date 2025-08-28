import Header from "../header"

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-4xl font-bold text-center">Admin page</h1>
      </div>
    </div>
  )
}

export default AdminPage
