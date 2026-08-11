import jwt from "jsonwebtoken"

import {
    config,
} from "../config.mjs"

export function createJwtToken(
    userId,
    sessionId,
) {
    return jwt.sign(
        {
            id: userId,
            ...(sessionId ? { sessionId } : {}),
        },

        config.jwt.secretKey,

        {
            expiresIn:
                config.jwt
                    .expiresInSec,
        },
    )
}
