# Vue authentication wall
This module provides the AuthenticationWall component which wraps a Vue application's content so as to prevent unauthenticated users from accessing it.

## Usage
```vue
<template>
  <AuthenticationWall
    :options="options"
    @user="handle_user($event)">

    <h1>Your app</h1>
    <router-view />

  </AuthenticationWall>
</template>

<script>
import AuthenticationWall from '@moreillon/vue_authentication_wall'
export default {
  name: 'App',
  components: {
    AuthenticationWall
  },
  data: () => ({
    options: {
      login_url: 'https://api.authentication.example.com/login',
      identification_url: 'https://api.authentication.example.com/whoami',
    }
  }),
  methods: {
    handle_user(user) {
      console.log(user)
    }
  }

}
</script>
```

## Options
Thise are the different settings that can be done via the options prop of the component

| Otion  | Description |
| --- | --- |
| login_url | URL to which the client can post credentials in order to login (required) |
| identification_url | URL used to retrieve one's user information |
| Title | The application title if needed to be shown on the login page |

## Events

| Event | Description |
| --- | --- |
| user | Triggered when user information becomes available after identification using the identification_url. Returns user information if the user is authenticated. |
