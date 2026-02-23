# E2E Test Plan for Portfolio CMS

## Test Environment
- **Frontend URL**: http://localhost:4200
- **Backend URL**: http://localhost:5000/api (needs to be running)
- **Playwright MCP**: Running on port 9000
- **Browser**: Chromium (default)

## Test Scenarios

### 1. Login Page Tests

#### Test 1.1: Login Page Loads
- **Objective**: Verify login page loads correctly
- **Steps**:
  1. Navigate to http://localhost:4200
  2. Verify page redirects to /login
  3. Verify "Portfolio CMS" heading is visible
  4. Verify all form fields are present (Tenant ID, Email, Password)
  5. Verify Login button is present and disabled initially

#### Test 1.2: Form Validation
- **Objective**: Verify form validation works
- **Steps**:
  1. Click Login button (should remain disabled)
  2. Fill only Tenant ID field
  3. Verify button is still disabled
  4. Fill Email field with invalid email
  5. Verify validation error appears
  6. Fill Email with valid email
  7. Fill Password field
  8. Verify Login button becomes enabled

#### Test 1.3: Successful Login (requires backend)
- **Objective**: Verify login flow works with valid credentials
- **Steps**:
  1. Fill Tenant ID: "tenant1"
  2. Fill Email: "admin@example.com"
  3. Fill Password: "password123"
  4. Click Login button
  5. Verify redirect to /dashboard
  6. Verify auth token is stored in localStorage
  7. Verify navbar is visible

### 2. Dashboard Tests

#### Test 2.1: Dashboard Loads
- **Objective**: Verify dashboard displays correctly
- **Steps**:
  1. Login with valid credentials
  2. Verify "Dashboard" heading is visible
  3. Verify 4 stat cards are displayed (Blogs, Published, Portfolios, Users)
  4. Verify quick action buttons are present

#### Test 2.2: Dashboard Navigation
- **Objective**: Verify navigation from dashboard works
- **Steps**:
  1. From dashboard, click "Create New Blog" button
  2. Verify redirect to /dashboard/blogs/new
  3. Go back to dashboard
  4. Click "Create New Portfolio" button
  5. Verify redirect to /dashboard/portfolios/new

### 3. Blogs Tests

#### Test 3.1: Blogs List Page
- **Objective**: Verify blogs list displays correctly
- **Steps**:
  1. Navigate to /dashboard/blogs
  2. Verify "Blogs" heading is visible
  3. Verify "Create New Blog" button is present
  4. If blogs exist, verify blog cards are displayed
  5. Verify each card has Edit and Delete buttons

#### Test 3.2: Create Blog
- **Objective**: Verify blog creation works
- **Steps**:
  1. Navigate to /dashboard/blogs
  2. Click "Create New Blog" button
  3. Verify form loads with all fields
  4. Fill Title: "Test Blog Post"
  5. Fill Summary: "This is a test blog summary"
  6. Fill Content: "Full blog content here..."
  7. Fill Tags: "test, angular, cms"
  8. Check "Publish immediately" checkbox
  9. Click "Create Blog" button
  10. Verify redirect to /dashboard/blogs
  11. Verify new blog appears in the list

#### Test 3.3: Edit Blog
- **Objective**: Verify blog editing works
- **Steps**:
  1. Navigate to /dashboard/blogs
  2. Click Edit button on a blog
  3. Verify form loads with existing data
  4. Change Title to "Updated Blog Post"
  5. Click "Update Blog" button
  6. Verify redirect to /dashboard/blogs
  7. Verify blog title is updated in the list

#### Test 3.4: Delete Blog
- **Objective**: Verify blog deletion works
- **Steps**:
  1. Navigate to /dashboard/blogs
  2. Click Delete button on a blog
  3. Verify confirmation dialog appears
  4. Click OK/Confirm
  5. Verify blog is removed from the list

### 4. Portfolios Tests

#### Test 4.1: Portfolios List Page
- **Objective**: Verify portfolios list displays correctly
- **Steps**:
  1. Navigate to /dashboard/portfolios
  2. Verify "Portfolios" heading is visible
  3. Verify "Create New Portfolio" button is present
  4. If portfolios exist, verify portfolio cards are displayed
  5. Verify each card shows title, subtitle, template, visibility

#### Test 4.2: Create Portfolio
- **Objective**: Verify portfolio creation works
- **Steps**:
  1. Navigate to /dashboard/portfolios
  2. Click "Create New Portfolio" button
  3. Verify form loads with all fields
  4. Fill Title: "My Portfolio"
  5. Fill Subtitle: "Full Stack Developer"
  6. Fill Bio: "Experienced developer..."
  7. Select Template: "Modern"
  8. Check "Make portfolio public"
  9. Check "Enable featured blogs"
  10. Click "Create Portfolio" button
  11. Verify redirect to /dashboard/portfolios
  12. Verify new portfolio appears in the list

#### Test 4.3: Edit Portfolio
- **Objective**: Verify portfolio editing works
- **Steps**:
  1. Navigate to /dashboard/portfolios
  2. Click Edit button on a portfolio
  3. Verify form loads with existing data
  4. Change Subtitle to "Senior Developer"
  5. Click "Update Portfolio" button
  6. Verify redirect to /dashboard/portfolios
  7. Verify portfolio subtitle is updated

#### Test 4.4: Delete Portfolio
- **Objective**: Verify portfolio deletion works
- **Steps**:
  1. Navigate to /dashboard/portfolios
  2. Click Delete button on a portfolio
  3. Verify confirmation dialog appears
  4. Click OK/Confirm
  5. Verify portfolio is removed from the list

### 5. Users Tests

#### Test 5.1: Users List Page
- **Objective**: Verify users list displays correctly
- **Steps**:
  1. Navigate to /dashboard/users
  2. Verify "Users" heading is visible
  3. Verify user table is displayed
  4. Verify table headers: Name, Email, Role, Created
  5. Verify user rows with avatars and role badges

### 6. Tenants Tests

#### Test 6.1: Tenants List Page
- **Objective**: Verify tenants list displays correctly
- **Steps**:
  1. Navigate to /dashboard/tenants
  2. Verify "Tenants" heading is visible
  3. Verify tenant cards are displayed
  4. Verify each card shows name, subdomain, status

### 7. Navigation Tests

#### Test 7.1: Navbar Navigation
- **Objective**: Verify all navbar links work
- **Steps**:
  1. Login to application
  2. Click "Dashboard" link → Verify /dashboard
  3. Click "Blogs" link → Verify /dashboard/blogs
  4. Click "Portfolios" link → Verify /dashboard/portfolios
  5. Click "Users" link → Verify /dashboard/users
  6. Click "Tenants" link → Verify /dashboard/tenants

#### Test 7.2: Logout
- **Objective**: Verify logout functionality works
- **Steps**:
  1. Login to application
  2. Click "Logout" button in navbar
  3. Verify redirect to /login
  4. Verify auth token is removed from localStorage
  5. Try to navigate to /dashboard
  6. Verify redirect back to /login

### 8. Responsive Design Tests

#### Test 8.1: Mobile View
- **Objective**: Verify application works on mobile
- **Steps**:
  1. Set viewport to mobile size (375x667)
  2. Navigate through all pages
  3. Verify layouts adapt to mobile
  4. Verify cards stack vertically
  5. Verify tables convert to cards
  6. Verify forms are scrollable

#### Test 8.2: Tablet View
- **Objective**: Verify application works on tablet
- **Steps**:
  1. Set viewport to tablet size (768x1024)
  2. Navigate through all pages
  3. Verify layouts adapt to tablet
  4. Verify appropriate grid columns

## Test Data Requirements

### User Credentials
- **Tenant ID**: tenant1
- **Admin Email**: admin@example.com
- **Admin Password**: password123

### Test Blogs
- Blog 1: "Getting Started with Angular", "Learn the basics...", ["angular", "tutorial"]
- Blog 2: ".NET Core Best Practices", "Tips for better...", ["dotnet", "bestpractices"]

### Test Portfolios
- Portfolio 1: "John Doe", "Software Engineer", "Modern", Public
- Portfolio 2: "Jane Smith", "Full Stack Developer", "Classic", Private

## Test Execution Order

1. **Smoke Tests** (Must pass before proceeding):
   - Login page loads
   - Login with valid credentials
   - Dashboard loads

2. **CRUD Tests** (Can run in parallel):
   - Blogs CRUD
   - Portfolios CRUD

3. **Navigation Tests**:
   - All navbar links
   - Logout

4. **View Tests** (Read-only):
   - Users list
   - Tenants list

5. **Responsive Tests**:
   - Mobile view
   - Tablet view

## Success Criteria

- ✅ All pages load without errors
- ✅ All forms validate correctly
- ✅ All CRUD operations work
- ✅ Navigation works across all pages
- ✅ Logout clears session
- ✅ Auth guard protects routes
- ✅ Responsive design works on all sizes
- ✅ No console errors

## Known Limitations (without Backend)

Without the backend API running, these tests will fail:
- Login authentication
- Loading blogs/portfolios/users/tenants
- Creating/updating/deleting records
- Dashboard statistics

However, the UI can still be tested for:
- Page loads
- Form validation
- Navigation (except protected routes)
- Responsive design
- UI interactions

## Next Steps

1. Start the backend API
2. Run Playwright MCP tests
3. Document any bugs found
4. Fix issues and retest
5. Add automated test suite
