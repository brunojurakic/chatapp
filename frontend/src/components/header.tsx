import React from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { FlowLogo } from "@/components/ui/flow-logo"
import { LogOut, Settings, Shield, Menu } from "lucide-react"
import { Link } from "react-router-dom"
import { Users } from "lucide-react"

const Header: React.FC = () => {
  const { user, logout } = useAuth()

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <nav className="border-b w-full">
      <div className="w-full px-6">
        <div className="flex items-center h-16 w-full">
          <div className="flex-1 md:flex-none">
            <Link
              to="/home"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity w-fit"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-900/20">
                <FlowLogo
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                  size={20}
                />
              </div>
              <h1 className="text-xl font-bold text-emerald-600 dark:text-emerald-500">
                Flow
              </h1>
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-4">
              <Link
                to="/friends"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Friends</span>
                </Button>
              </Link>
              {user?.roles?.includes("ADMIN") && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-1 justify-end">
            <ModeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.username ? `@${user.username}` : user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to={"/settings"}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 dark:text-red-400 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <ModeToggle />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-900/20">
                      <FlowLogo
                        className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                        size={20}
                      />
                    </div>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-500">
                      Flow
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-full mt-6">
                  <div className="flex flex-col space-y-1 px-4">
                    <Link to="/friends">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-10 pl-6"
                      >
                        <Users className="mr-3 h-4 w-4" />
                        Friends
                      </Button>
                    </Link>

                    {user?.roles?.includes("ADMIN") && (
                      <Link to="/admin">
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-10 pl-6"
                        >
                          <Shield className="mr-3 h-4 w-4" />
                          Admin
                        </Button>
                      </Link>
                    )}

                    <Link to="/settings">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-10 pl-6"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                  </div>

                  <div className="pt-6 px-4 border-t mt-6">
                    <Button
                      onClick={logout}
                      variant="ghost"
                      className="w-full justify-start h-10 pl-6 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Log out
                    </Button>
                  </div>

                  <div className="flex-1"></div>

                  <div className="flex items-center space-x-3 p-3 mx-4 mb-4 rounded-lg bg-muted/50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.picture} alt={user?.name} />
                      <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                        {user?.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {user?.username ? `@${user.username}` : user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
