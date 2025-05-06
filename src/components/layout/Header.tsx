
import { useState } from "react";
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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, User, Settings, BarChart, ShoppingBag } from "lucide-react";

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { resetTheme } = useTheme();
  // This would come from auth context in a real application
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-brand">eComJunction</span>
          </Link>
        </div>

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
              <NavigationMenuTrigger>Browse Categories</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                  <Link to="/?category=Electronics" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Electronics</div>
                    <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Gadgets, devices, and tech accessories
                    </div>
                  </Link>
                  <Link to="/?category=Fashion" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Fashion</div>
                    <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Clothing, shoes, and accessories
                    </div>
                  </Link>
                  <Link to="/?category=Home" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Home & Kitchen</div>
                    <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Furniture, appliances, and decor
                    </div>
                  </Link>
                  <Link to="/?category=Beauty" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Beauty</div>
                    <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
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
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="mr-2">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isLoggedIn ? (
                <>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>My Products</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BarChart className="mr-2 h-4 w-4" />
                    <span>Analytics</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={resetTheme}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Reset Theme</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => setIsLoggedIn(true)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Sign In</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Register</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
