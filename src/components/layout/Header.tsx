import { Link } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, LogOut, Settings } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function Header() {
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container-wide">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Wiz Store
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/products" className="text-small text-muted-foreground hover:text-foreground transition-colors">
              Shop
            </Link>
            <Link to="/products?category=Outerwear" className="text-small text-muted-foreground hover:text-foreground transition-colors">
              Outerwear
            </Link>
            <Link to="/products?category=Shirts" className="text-small text-muted-foreground hover:text-foreground transition-colors">
              Shirts
            </Link>
            <Link to="/products?category=Pants" className="text-small text-muted-foreground hover:text-foreground transition-colors">
              Pants
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="hidden md:flex items-center text-small text-muted-foreground hover:text-foreground transition-colors outline-none">
                  <User className="w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-small font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="hidden md:flex items-center text-small text-muted-foreground hover:text-foreground transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}
            <Link to="/cart" className="relative flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-micro flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-3">
              <Link
                to="/products"
                onClick={() => setMenuOpen(false)}
                className="text-body text-muted-foreground hover:text-foreground"
              >
                Shop All
              </Link>
              <Link
                to="/products?category=Outerwear"
                onClick={() => setMenuOpen(false)}
                className="text-body text-muted-foreground hover:text-foreground"
              >
                Outerwear
              </Link>
              <Link
                to="/products?category=Shirts"
                onClick={() => setMenuOpen(false)}
                className="text-body text-muted-foreground hover:text-foreground"
              >
                Shirts
              </Link>
              <Link
                to="/products?category=Pants"
                onClick={() => setMenuOpen(false)}
                className="text-body text-muted-foreground hover:text-foreground"
              >
                Pants
              </Link>
              {user ? (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="text-body text-muted-foreground hover:text-foreground"
                  >
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="text-body text-muted-foreground hover:text-foreground"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMenuOpen(false);
                    }}
                    className="text-body text-destructive hover:text-destructive/80 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="text-body text-muted-foreground hover:text-foreground"
                >
                  Account
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
