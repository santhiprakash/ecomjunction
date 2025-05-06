
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Sun, Moon, User, Settings, BarChart, ShoppingBag, Menu } from "lucide-react";

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { resetTheme } = useTheme();
  // This would come from auth context in a real application
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Add scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all ${
      isScrolled ? "bg-background/95 shadow-sm" : "bg-background/70"
    }`}>
      <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-brand bg-clip-text text-transparent">
              eComJunction
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/" className={navigationMenuTriggerStyle()}>
                Home
              </Link>
            </NavigationMenuItem>
            
            {/* Only show these items for logged-in users */}
            {isLoggedIn && (
              <>
                <NavigationMenuItem>
                  <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/my-products" className={navigationMenuTriggerStyle()}>
                    My Products
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/analytics" className={navigationMenuTriggerStyle()}>
                    Analytics
                  </Link>
                </NavigationMenuItem>
              </>
            )}
            
            <NavigationMenuItem>
              <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                  <Link to="/?category=Electronics" className="block select-none rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium">Electronics</div>
                    <div className="line-clamp-2 text-sm text-muted-foreground">
                      Gadgets, devices, and tech accessories
                    </div>
                  </Link>
                  <Link to="/?category=Fashion" className="block select-none rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium">Fashion</div>
                    <div className="line-clamp-2 text-sm text-muted-foreground">
                      Clothing, shoes, and accessories
                    </div>
                  </Link>
                  <Link to="/?category=Home" className="block select-none rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium">Home & Kitchen</div>
                    <div className="line-clamp-2 text-sm text-muted-foreground">
                      Furniture, appliances, and decor
                    </div>
                  </Link>
                  <Link to="/?category=Beauty" className="block select-none rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium">Beauty</div>
                    <div className="line-clamp-2 text-sm text-muted-foreground">
                      Skincare, makeup, and personal care
                    </div>
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to="/help-center" className={navigationMenuTriggerStyle()}>
                Help Center
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* User menu dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isLoggedIn ? (
                <>
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>My Products</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <BarChart className="mr-2 h-4 w-4" />
                    <span>Analytics</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={resetTheme}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Reset Theme</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-500 focus:text-red-500"
                    onClick={() => setIsLoggedIn(false)}
                  >
                    Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => setIsLoggedIn(true)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Sign In</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Register</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 py-6">
                <Link to="/" className="flex items-center">
                  <span className="text-xl font-bold">eComJunction</span>
                </Link>
                
                <nav className="flex flex-col space-y-4">
                  <SheetClose asChild>
                    <Link to="/" className="py-2 text-base">Home</Link>
                  </SheetClose>
                  
                  {isLoggedIn && (
                    <>
                      <SheetClose asChild>
                        <Link to="/dashboard" className="py-2 text-base">Dashboard</Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/my-products" className="py-2 text-base">My Products</Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/analytics" className="py-2 text-base">Analytics</Link>
                      </SheetClose>
                    </>
                  )}
                  
                  <SheetClose asChild>
                    <Link to="/help-center" className="py-2 text-base">Help Center</Link>
                  </SheetClose>
                </nav>
                
                <div className="mt-auto space-y-4">
                  {!isLoggedIn ? (
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => setIsLoggedIn(true)}>Sign In</Button>
                      <Button variant="outline">Register</Button>
                    </div>
                  ) : (
                    <Button 
                      variant="destructive"
                      onClick={() => setIsLoggedIn(false)}
                    >
                      Sign Out
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
