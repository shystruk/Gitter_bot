# Gitter_bot
UA WEB CHALLENGE

##Default
1. **npm install**
2. **node server.js**
3. **http://localhost:3000**
4. Sign In and you will see default room which would be scanned by **BOT**
5. Click on the **ROOM** and BOT will be working
```
Ask him - How many: calc 10 * 2
```

**Change ROOM**:
```
ROOM=<username/room> node server.js
```

####If problems with Authentication
1. Create a new app at https://developer.gitter.im: ```Redirect URL``` -  should be **http://localhost:3000/login/callback**<br/>
2. Launch Gitter BOT with:<br/>

```

GITTER_KEY=<app-key> GITTER_SECRET=<app-secret> ROOM=<username/room> node server.js

<app-key> & <app-secret> - app's OAUTH KEY & OAUTH SECRET which you have created at https://developer.gitter.im

```

Go to - **http://localhost:3000** <br/>

After **Sign In** you will see ROOM which would be scanned by BOT and ROOMS which you are currently in the following.
You can select any one which you want.<br/>
Click on the **ROOM** which would be scanned by BOT and BOT will be working.
```
Ask him - How many: calc 10 * 2
```

