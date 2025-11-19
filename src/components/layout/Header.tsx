import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = () => {
    if (!profile) return "U";
    return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
            <span className="text-lg font-bold text-primary-foreground">A</span>
          </div>
          <span className="text-xl font-semibold">Avenrae</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/practitioners" className="text-sm font-medium transition-colors hover:text-primary">
            Practitioners
          </Link>
          
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                <Link 
                  to="/practitioners" 
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Practitioners
                </Link>
                
                {user ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="text-lg font-medium transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Button variant="ghost" onClick={() => { signOut(); setIsOpen(false); }} className="justify-start">
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">Log in</Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
