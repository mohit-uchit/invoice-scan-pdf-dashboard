import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'fas fa-tachometer-alt',
    path: '/'
  },
  {
    id: 'invoices',
    label: 'Invoice List',
    icon: 'fas fa-list',
    path: '/invoices'
  },
  {
    id: 'api-docs',
    label: 'API Documentation',
    icon: 'fas fa-code',
    path: '/api-docs'
  },
  {
    id: 'setup',
    label: 'Local Setup',
    icon: 'fas fa-cog',
    path: '/setup'
  }
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <i className="fas fa-file-pdf text-primary-foreground text-sm"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">PDF Review</h1>
            <p className="text-xs text-muted-foreground">Monorepo Dashboard</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location === item.path;
            return (
              <li key={item.id}>
                <Link href={item.path}>
                  <div
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                    data-testid={`nav-${item.id}`}
                  >
                    <i className={`${item.icon} w-4 h-4`}></i>
                    <span>{item.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
