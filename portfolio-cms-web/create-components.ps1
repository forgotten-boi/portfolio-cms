# PowerShell script to create Angular component files

$basePath = "C:\MyProjects\IonicApp\portfolio\portfolio-cms-web\src\app\components"

# Navbar HTML
@"
<nav class="navbar" *ngIf="isAuthenticated">
  <div class="nav-brand">
    <h2>Portfolio CMS</h2>
  </div>
  <ul class="nav-links">
    <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
    <li><a routerLink="/blogs" routerLinkActive="active">Blogs</a></li>
    <li><a routerLink="/portfolios" routerLinkActive="active">Portfolios</a></li>
    <li><a routerLink="/users" routerLinkActive="active">Users</a></li>
    <li><a routerLink="/tenants" routerLinkActive="active">Tenants</a></li>
  </ul>
  <div class="nav-actions">
    <button class="btn btn-outline" (click)="logout()">Logout</button>
  </div>
</nav>
"@ | Set-Content -Path "$basePath\navbar\navbar.component.html"

# Navbar SCSS
@"
.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand h2 {
  color: #667eea;
  margin: 0;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
  
  a {
    text-decoration: none;
    color: #555;
    font-weight: 500;
    transition: color 0.3s;
    
    &:hover,
    &.active {
      color: #667eea;
    }
  }
}

.btn-outline {
  padding: 0.5rem 1.5rem;
  border: 2px solid #667eea;
  background: transparent;
  color: #667eea;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  
  &:hover {
    background: #667eea;
    color: white;
  }
}
"@ | Set-Content -Path "$basePath\navbar\navbar.component.scss"

Write-Host "Navbar component files created successfully!" -ForegroundColor Green
