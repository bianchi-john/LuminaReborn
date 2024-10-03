import axios from "axios"
import Cookies from "cookies"
import { Request, Response, NextFunction } from "express"

const retrieve_jwt = (req: Request, res: Response) =>
  new Promise((resolve, reject) => {
    // Retrieving the token from either cookies or authorization header
    // NOTE: Did not need to be a promise

    let { query, headers } = req

    let jwt

    // See if jwt available from authorization header
    if (!jwt && headers?.authorization) {
      jwt = headers?.authorization.split(" ")[1]
    }

    // Try to get JWT from cookies
    if (!jwt) {
      const cookies = new Cookies(req, res)
      jwt = cookies.get("jwt") || cookies.get("token")
    }

    // Try to get the JWT from query parameters
    if (!jwt) {
      jwt = query.jwt || query.token
    }

    if (!jwt) return reject(`Missing JWT`)

    resolve(jwt)
  })

// NOTE: Middleware itself cannot be async
const middleware =
  (options: any = {}) =>
  (req: Request, res: Response, next: NextFunction) => {
    retrieve_jwt(req, res)
      .then((jwt) => {
        const { url } = options
        if (!url) throw "URL not provided"

        res.locals.jwt = jwt

        const headers = { Authorization: `Bearer ${jwt}` }

        return axios.get(url, { headers })
      })
      .then(({ data }) => {
        res.locals.user = data
        next()
      })
      .catch((error) => {
        if (options.lax) next()
        else return res.status(403).send(error)
      })
  }

export = middleware
