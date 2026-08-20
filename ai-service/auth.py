"""
Verification des tokens JWT emis par le backend Spring Boot.
Utilise le meme secret (JWT_SECRET_KEY, encode en base64 comme cote Java,
decode ici en bytes bruts pour signWith/verify HMAC-SHA256).
"""

import base64
import jwt
from fastapi import Header, HTTPException, status

from config import JWT_SECRET_KEY

_secret_bytes = base64.b64decode(JWT_SECRET_KEY)


def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token manquant ou mal forme (attendu: Authorization: Bearer <token>)",
        )

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = jwt.decode(token, _secret_bytes, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expire")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")

    return payload
