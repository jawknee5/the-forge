# Auth Testing Playbook (Emergent Google Auth)

Seed a test user + session, then use the session_token as Bearer header or as `session_token` cookie.

## Seed
```
mongosh test_database --eval '
var uid="test-user-forge"; var tok="test_session_forge";
db.users.deleteMany({user_id:uid}); db.user_sessions.deleteMany({session_token:tok});
db.users.insertOne({user_id:uid,email:"forge.tester@example.com",name:"Forge Tester",picture:"https://i.pravatar.cc/150",created_at:new Date().toISOString()});
db.user_sessions.insertOne({user_id:uid,session_token:tok,expires_at:new Date(Date.now()+7*24*3600*1000).toISOString(),created_at:new Date().toISOString()});
'
```

## Backend
```
curl $API/api/auth/me -H "Authorization: Bearer test_session_forge"
```

## Browser
Add cookie session_token=test_session_forge (domain=app host, path=/, httpOnly, secure, sameSite=None), then goto /dashboard.

Checklist:
- /api/auth/me returns user (not 401)
- Dashboard loads without redirect to /
- Callback detection uses useLocation().hash
