import jwt from "jsonwebtoken"

import {
    config,
} from "../config.mjs"

export function createJwtToken(
    userId,
) {
    return jwt.sign(
        {
            id: userId,
        },

        config.jwt.secretKey,

        {
            expiresIn:
                config.jwt
                    .expiresInSec,
        },
    )
}