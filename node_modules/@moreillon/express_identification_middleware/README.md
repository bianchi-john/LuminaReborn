# Express identification middleware

An expres middlewware to identify users from their HTTP requests.

## Usage

```typescript
import express from "express"
import auth from "@moreillon/express_identification_middleware"

const app = express()
const authOptions = { url: `https://api.users.maximemoreillon.com/users/self` }

app.use(auth(options))

app.listen(8080, () => {
  console.log(`Express server started`)
})
```

## Options

- url: The URL of the identification route of the authentication API
- lax: Boolean, set to true to allow unidentified users
