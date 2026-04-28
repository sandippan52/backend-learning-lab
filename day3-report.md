# Day 3 Report - API Architecture

## Setup Status
My development environment is fully operational.

- VS Code installed and working
- Node.js installed
- Git configured
- Nodemon installed for auto restart
- Express server running successfully

## Task Inventory

- Created Express server
- Added multiple routes:
  - /about
  - /user
  - /api/users
- Implemented middleware logger
- Installed and tested nodemon
- Created JSON API endpoint for users
- Tested all routes in browser
- Verified server auto restart

## Debugging Log

### Bug 1: Cannot GET /
Issue: Browser showed Cannot GET /

Solution:
Added proper route using:

```js
app.get('/', (req,res)=>{
  res.send("Server Running");
});